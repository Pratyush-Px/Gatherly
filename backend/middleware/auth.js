import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.replace('Bearer ', '')
        : null;

    if (!token) {
        return res.status(401).send('❌ Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, username }
        next();
    } catch (err) {
        console.error('JWT verification error:', err.message);
        return res.status(400).send('❌ Invalid or expired token');
    }
};

export default authMiddleware;
