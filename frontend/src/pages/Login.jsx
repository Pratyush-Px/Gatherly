import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles/login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // "api" is the axios instance we created
            const response = await api.post('/auth/login', { email, password });
            
            // Save the token to local storage so we stay logged in
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.user.username);
            // Redirect to the Feed page
            navigate('/feed');
        } catch (err) {
            // Show error message from backend if available
            setError(err.response?.data || "Login failed. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-logo">Gatherly</h1>
                
                {error && <p className="login-error">{error}</p>}

                <form className="login-form" onSubmit={handleLogin}>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Log In</button>
                </form>
            </div>

            <div className="signup-box">
                <p>Don't have an account? <Link to="/register">Sign up</Link></p>
            </div>
        </div>
    );
};

export default Login;