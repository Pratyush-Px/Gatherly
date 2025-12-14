import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles/register.css';

const Register = () => {
    // State for all 4 fields required by your backend
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Send data to backend
            await api.post('/auth/register', formData);
            
            // On success, go to login page
            alert("Registration successful! Please log in.");
            navigate('/');
        } catch (err) {
            setError(err.response?.data || "Registration failed.");
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h1 className="login-logo">Gatherly</h1>
                <h2 className="register-title">Sign up to see photos and videos from your friends.</h2>

                {error && <p className="login-error">{error}</p>}

                <form className="register-form" onSubmit={handleRegister}>
                    <input 
                        type="email" name="email" placeholder="Email" 
                        onChange={handleChange} required 
                    />
                    <input 
                        type="text" name="name" placeholder="Full Name" 
                        onChange={handleChange} required 
                    />
                    <input 
                        type="text" name="username" placeholder="Username" 
                        onChange={handleChange} required 
                    />
                    <input 
                        type="password" name="password" placeholder="Password" 
                        onChange={handleChange} required 
                    />
                    
                    <button type="submit">Sign Up</button>
                </form>

                <p className="register-footer">
                    By signing up, you agree to our Terms.
                </p>
            </div>

            <div className="signup-box">
                <p>Have an account? <Link to="/">Log in</Link></p>
            </div>
        </div>
    );
};

export default Register;