import { Router } from "express";
import authMiddleware from "../middleware/auth.js";

const commentsRoutes = (db) => {
  const router = Router();

  // ADD COMMENT TO POST (JWT REQUIRED)
  // ADD COMMENT (Updated with Notification)
  router.post("/posts/:postId", authMiddleware, async (req, res) => {
    const postId = req.params.postId;
    const { content } = req.body;
    const sender_id = req.user.id;

    try {
      // 1. Insert Comment
      const result = await db.query(
        "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
        [postId, sender_id, content]
      );

      // 2. Find Post Owner to notify
      const postResult = await db.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
      const recipient_id = postResult.rows[0].user_id;

      // 3. Create Notification (Only if not commenting on own post)
      if (recipient_id !== sender_id) {
          await db.query(
            `INSERT INTO notifications (recipient_id, sender_id, type, post_id) 
             VALUES ($1, $2, 'comment', $3)`,
            [recipient_id, sender_id, postId]
          );
      }

      res.status(201).json({ message: "Comment added!", comment: result.rows[0] });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  });

  // GET COMMENTS FOR POST (PUBLIC)
  router.get("/posts/:postId", async (req, res) => {
    const postId = req.params.postId;

    try {
      const result = await db.query(
        `
                SELECT c.*, u.username, u.name 
                FROM comments c 
                JOIN users u ON c.user_id = u.id 
                WHERE c.post_id = $1 
                ORDER BY c.created_at ASC
            `,
        [postId]
      );
      res.json({ comments: result.rows });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  });
  // DELETE COMMENT (COMMENT OWNER)
  router.delete("/:id", authMiddleware, async (req, res) => {
    const commentId = req.params.id;
    const user_id = req.user.id;

    try {
      const result = await db.query(
        `DELETE FROM comments 
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
        [commentId, user_id]
      );

      if (result.rows.length === 0) {
        return res.status(403).send("Cannot delete this comment");
      }

      res.json({ message: "🗑️ Comment deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  return router;
};

export default commentsRoutes;
