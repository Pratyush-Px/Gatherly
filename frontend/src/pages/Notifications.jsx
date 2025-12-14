import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import '../styles/profile.css'; // Reusing profile styles for simplicity

const Notifications = () => {
    const [notifs, setNotifs] = useState([]);

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifs(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchNotifs();
    }, []);

    const getMessage = (n) => {
        if (n.type === 'like') return `liked your post.`;
        if (n.type === 'comment') return `commented on your post.`;
        if (n.type === 'follow') return `started following you.`;
    };

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: '600px', margin: '80px auto', padding: '20px' }}>
                <h2>Notifications</h2>
                <div style={{ marginTop: '20px', background: 'white', border: '1px solid #dbdbdb', borderRadius: '3px' }}>
                    {notifs.length === 0 && <p style={{ padding: '20px', textAlign: 'center' }}>No notifications.</p>}
                    
                    {notifs.map(n => (
                        <div key={n.id} style={{ padding: '15px', borderBottom: '1px solid #efefef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '50%', background: '#efefef', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontWeight: 'bold' 
                                }}>
                                    {n.sender_name[0].toUpperCase()}
                                </div>
                                <div>
                                    <Link to={`/profile/${n.sender_name}`} style={{ fontWeight: 'bold', marginRight: '5px', textDecoration: 'none', color: 'black' }}>
                                        {n.sender_name}
                                    </Link>
                                    <span>{getMessage(n)}</span>
                                    <div style={{ fontSize: '12px', color: '#8e8e8e', marginTop: '2px' }}>
                                        {new Date(n.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Show small post preview if it's a like/comment */}
                            {(n.type === 'like' || n.type === 'comment') && n.post_image && (
                                <img src={n.post_image} alt="post" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Notifications;