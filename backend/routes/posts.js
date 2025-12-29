import { Router } from "express";
import authMiddleware from "../middleware/auth.js";

const postsRoutes = (db) => {
  const router = Router();

  // 1. CREATE POST (JWT REQUIRED)
  router.post("/create", authMiddleware, async (req, res) => {
    const { content, image_url } = req.body;
    const user_id = req.user.id;

    try {
      const result = await db.query(
        "INSERT INTO posts (user_id, content, image_url) VALUES ($1, $2, $3) RETURNING *",
        [user_id, content, image_url]
      );
      res.status(201).json({
        message: "Post created!",
        post: result.rows[0],
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  });

  //2. GET FEED PUBLIC - Shows posts + author info,includes Comments!,Pagination
  
  router.get("/feed", async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 20;
    const offset = (page - 1) * limit; // Page 1 = skip 0, Page 2 = skip 20

    try {
      const result = await db.query(
        `
        SELECT 
            p.id, p.content, p.image_url, p.likes, p.created_at,
            u.id as user_id, u.name, u.username,
            COALESCE(
                (
                    SELECT json_agg(row_to_json(c_row))
                    FROM (
                        SELECT c.id, c.content, u2.username
                        FROM comments c
                        JOIN users u2 ON c.user_id = u2.id
                        WHERE c.post_id = p.id
                        ORDER BY c.created_at ASC
                    ) c_row
                ),
                '[]'
            ) as comments
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        ORDER BY p.created_at DESC 
        LIMIT $1 OFFSET $2
      `,
        [limit, offset]
      ); // Pass limit and offset to SQL

      res.json({ posts: result.rows });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  });

  // 3. LIKE POST JWT REQUIRED, With Duplicate Prevention, Like / Unlike, Updated with Notification
  router.post("/:id/like", authMiddleware, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
      const checkLike = await db.query(
        "SELECT * FROM post_likes WHERE user_id = $1 AND post_id = $2",
        [userId, postId]
      );

      if (checkLike.rows.length > 0) {
        // UNLIKE logic. (No notification needed)
        await db.query("DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2", [userId, postId]);
        const result = await db.query("UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = $1 RETURNING likes", [postId]);
        return res.json({ message: "Unliked", likes: result.rows[0].likes });
      } else {
        // LIKE logic!
        await db.query("INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)", [userId, postId]);
        const result = await db.query("UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes", [postId]);

        // notification logic start
        const postRes = await db.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
        const recipient_id = postRes.rows[0].user_id;
        
        if (recipient_id !== userId) {
            await db.query(
                `INSERT INTO notifications (recipient_id, sender_id, type, post_id) 
                 VALUES ($1, $2, 'like', $3)`,
                [recipient_id, userId, postId]
            );
        }
        // notification logic end

        return res.json({ message: "Liked", likes: result.rows[0].likes });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  });

  // 4. DELETE OWN POST (JWT REQUIRED)
  router.delete("/:id", authMiddleware, async (req, res) => {
    const postId = req.params.id;
    const user_id = req.user.id;

    try {
      const result = await db.query(
        "DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *",
        [postId, user_id]
      );
      if (result.rows.length > 0) {
        res.json({ message: "🗑️ Post deleted!" });
      } else {
        res.status(403).send("Cannot delete this post");
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  });
  // GET SINGLE POST WITH COMMENTS
  router.get("/:id", async (req, res) => {
    const postId = req.params.id;

    try {
      // Post + author
      const postResult = await db.query(
        `SELECT 
                p.id, p.content, p.image_url, p.likes, p.created_at,
                u.id AS user_id, u.username, u.name
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = $1`,
        [postId]
      );

      if (postResult.rows.length === 0) {
        return res.status(404).send("Post not found");
      }

      // Comments + commenters
      const commentsResult = await db.query(
        `SELECT 
                c.id, c.content, c.created_at,
                u.id AS user_id, u.username, u.name
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.post_id = $1
             ORDER BY c.created_at ASC`,
        [postId]
      );

      res.json({
        post: postResult.rows[0],
        comments: commentsResult.rows,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });
  // UPDATE POST (EDIT CAPTION) – OWNER ONLY
  router.put("/:id", authMiddleware, async (req, res) => {
    const postId = req.params.id;
    const user_id = req.user.id;
    const { content } = req.body;

    try {
      const result = await db.query(
        `UPDATE posts 
             SET content = $1 
             WHERE id = $2 AND user_id = $3
             RETURNING *`,
        [content, postId, user_id]
      );

      if (result.rows.length === 0) {
        return res.status(403).send("Cannot edit this post");
      }

      res.json({
        message: "Post updated",
        post: result.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  return router;
};

export default postsRoutes;
