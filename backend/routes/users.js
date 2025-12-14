import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';

const usersRoutes = (db) => {
    const router = Router();

    // 1. SEARCH USERS
    router.get('/search', async (req, res) => {
        const { query } = req.query; // ?query=john
        if (!query) return res.json([]);

        try {
            const result = await db.query(
                "SELECT id, username, name FROM users WHERE username ILIKE $1 OR name ILIKE $1 LIMIT 5",
                [`%${query}%`]
            );
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    });

    // 2. GET USER PROFILE (Info + Stats + IsFollowing?)
    router.get('/profile/:username', authMiddleware, async (req, res) => {
        const { username } = req.params;
        const currentUserId = req.user.id;

        try {
            // Get User Details
            const userRes = await db.query("SELECT id, username, name FROM users WHERE username = $1", [username]);
            
            if (userRes.rows.length === 0) {
                return res.status(404).send("User not found");
            }

            const profileUser = userRes.rows[0];

            // Get Post Count
            const postCountRes = await db.query("SELECT COUNT(*) FROM posts WHERE user_id = $1", [profileUser.id]);
            
            // Get Follower/Following Counts
            const followersRes = await db.query("SELECT COUNT(*) FROM follows WHERE following_id = $1", [profileUser.id]);
            const followingRes = await db.query("SELECT COUNT(*) FROM follows WHERE follower_id = $1", [profileUser.id]);

            // Check if WE follow THEM
            const isFollowingRes = await db.query(
                "SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2",
                [currentUserId, profileUser.id]
            );

            // Get Their Posts
            const postsRes = await db.query(
                "SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC", 
                [profileUser.id]
            );

            res.json({
                user: profileUser,
                stats: {
                    posts: postCountRes.rows[0].count,
                    followers: followersRes.rows[0].count,
                    following: followingRes.rows[0].count
                },
                isFollowing: isFollowingRes.rows.length > 0,
                posts: postsRes.rows
            });

        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    });

    return router;
};

export default usersRoutes;