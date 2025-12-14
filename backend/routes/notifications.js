import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';

const notificationsRoutes = (db) => {
    const router = Router();

    // GET MY NOTIFICATIONS
    router.get('/', authMiddleware, async (req, res) => {
        const userId = req.user.id;

        try {
            const result = await db.query(`
                SELECT n.*, 
                       u.username as sender_name, 
                       u.id as sender_id,
                       p.image_url as post_image
                FROM notifications n
                JOIN users u ON n.sender_id = u.id
                LEFT JOIN posts p ON n.post_id = p.id
                WHERE n.recipient_id = $1
                ORDER BY n.created_at DESC
                LIMIT 20
            `, [userId]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    });

    return router;
};

export default notificationsRoutes;