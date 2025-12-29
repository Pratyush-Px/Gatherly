import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';

const followsRoutes = (db) => {
    const router = Router();

    // FOLLOW a user (Updated with Notification)
    router.post('/follow/:userId', authMiddleware, async (req, res) => {
        const follower_id = req.user.id;
        const following_id = parseInt(req.params.userId, 10);

        if (follower_id === following_id) return res.status(400).send('Cannot follow self');

        try {
            // 1. Create Follow
            await db.query(
                `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)
                 ON CONFLICT DO NOTHING`,
                [follower_id, following_id]
            );

            // 2. Create Notification
            await db.query(
                `INSERT INTO notifications (recipient_id, sender_id, type) 
                 VALUES ($1, $2, 'follow')`,
                [following_id, follower_id]
            );

            res.json({ message: 'Now following user' });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    });

    // UNFOLLOW a user
    router.delete('/unfollow/:userId', authMiddleware, async (req, res) => {
        const follower_id = req.user.id;
        const following_id = parseInt(req.params.userId, 10);

        try {
            const result = await db.query(
                `DELETE FROM follows
                 WHERE follower_id = $1 AND following_id = $2
                 RETURNING *`,
                [follower_id, following_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).send('Follow relationship not found');
            }

            res.json({ message: '🗑️ Unfollowed user' });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    });

    // GET list of users I am following
    router.get('/following/:userId', async (req, res) => {
        const userId = parseInt(req.params.userId, 10);

        try {
            const result = await db.query(
                `SELECT u.id, u.username, u.name
                 FROM follows f
                 JOIN users u ON f.following_id = u.id
                 WHERE f.follower_id = $1`,
                [userId]
            );

            res.json({ following: result.rows });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    });

    // GET list of followers of a user
    router.get('/followers/:userId', async (req, res) => {
        const userId = parseInt(req.params.userId, 10);

        try {
            const result = await db.query(
                `SELECT u.id, u.username, u.name
                 FROM follows f
                 JOIN users u ON f.follower_id = u.id
                 WHERE f.following_id = $1`,
                [userId]
            );

            res.json({ followers: result.rows });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    });

    return router;
};

export default followsRoutes;
