import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import authRoutes from './routes/auth.js'; 
import commentsRoutes from './routes/comments.js';
import postsRoutes from './routes/posts.js';
import followsRoutes from './routes/follows.js';
import usersRoutes from './routes/users.js';
import notificationsRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const connectDB = async() => {
    try{
        await db.connect();
        console.log("Database connected successfully");
    }catch(err){
        console.error("Database connection failed", err);
        process.exit(1);
    }
}

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Instagram Clone API' });
});

app.use('/api/auth', authRoutes(db));
app.use('/api/posts', postsRoutes(db)); 
app.use('/api/comments', commentsRoutes(db));   
app.use('/api/follows', followsRoutes(db));
app.use('/api/users', usersRoutes(db));
app.use('/api/notifications', notificationsRoutes(db));

app.listen(PORT, async () =>{
    await connectDB();
    console.log(`Server running at port ${PORT}`);
})