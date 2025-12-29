import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

const authRoutes = (db) => {  //RECEIVE db parameter
    const router = Router();

    // REGISTER
    router.post('/register', async (req, res) => {
        const { name, username, email, password } = req.body;
        
        try {
            const checkResult = await db.query(  //Use passed db
                'SELECT * FROM users WHERE username = $1 OR email = $2', 
                [username, email]
            );
            
            if (checkResult.rows.length > 0) {
                res.status(409).send("Username or email already exists. Try logging in.");
            } else {
                bcrypt.hash(password, saltRounds, async (err, hash) => {
                    if (err) {
                        console.error("Error hashing password:", err);
                        res.status(500).send("Password hash failed");
                    } else {
                        //console.log("Hashed Password:", hash);
                        await db.query(  //Use passed db
                            "INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4)",
                            [name, username, email, hash]
                        );
                        res.status(201).send("✅ User registered successfully!");
                    }
                });
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Server error");
        }
    });

    // LOGIN (same pattern)
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;
        
        try {
            const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
            
            if (result.rows.length > 0) {
                const user = result.rows[0];
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.error("Error comparing passwords:", err);
                        res.status(500).send("Password verification failed");
                    } else {
                        if (isMatch) {
                            const token = jwt.sign(
                                { id: user.id, username: user.username},
                                process.env.JWT_SECRET,
                            );
                            res.send({ 
                                message: `Welcome back ${user.username}!`, 
                                token,
                                user: { username: user.username, name: user.name } 
                            });
                        } else {
                            res.status(400).send("Incorrect Password");
                        }
                    }
                });
            } else {
                res.status(404).send("User not found");
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Server error");
        }
    });

    return router;  //Return router
};

export default authRoutes;
