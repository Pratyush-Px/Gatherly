import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    
    // Search States
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    // Handle Search Input
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim()) {
                try {
                    const res = await api.get(`/users/search?query=${query}`);
                    setResults(res.data);
                } catch (err) {
                    console.error(err);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-content">
                <Link to="/feed" className="nav-logo">
                    Social App
                </Link>

                {/* SEARCH BAR (Visible on Desktop) */}
                <div className="search-container">
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="search-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    
                    {/* Search Results Dropdown */}
                    {results.length > 0 && (
                        <div className="search-results" style={{
                            position: 'absolute', top: '45px', left: 0, width: '100%', 
                            background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', 
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000, overflow: 'hidden'
                        }}>
                            {results.map(user => (
                                <Link 
                                    key={user.id} 
                                    to={`/profile/${user.username}`}
                                    className="search-item"
                                    onClick={() => { setQuery(''); setResults([]); }}
                                    style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f3f4f6' }}
                                >
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', fontWeight: 'bold' }}>
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>{user.username}</span>
                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{user.name}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="nav-links">
                    <Link to="/feed" className="nav-item">
                        <span className="nav-icon">🏠</span>
                        <span className="nav-label">Home</span>
                    </Link>

                    <Link to="/notifications" className="nav-item">
                        <span className="nav-icon">🔔</span>
                        <span className="nav-label">Notifications</span>
                    </Link>

                    <Link to="/create" className="nav-item">
                        <span className="nav-icon">➕</span>
                        <span className="nav-label">Create</span>
                    </Link>

                    <Link to={`/profile/${username}`} className="nav-item">
                        <span className="nav-icon">👤</span>
                        <span className="nav-label">Profile</span>
                    </Link>
                </div>

                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;