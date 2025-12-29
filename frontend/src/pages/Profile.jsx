import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import '../styles/profile.css';

const Profile = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    //MODAL STATES
    const [selectedPost, setSelectedPost] = useState(null);
    const [showUserModal, setShowUserModal] = useState(null);
    const [userList, setUserList] = useState([]);
    const [commentText, setCommentText] = useState('');
    
    //EDIT STATE
    const [isEditing, setIsEditing] = useState(false);
    const [editCaption, setEditCaption] = useState('');

    const currentUser = localStorage.getItem('username');
    const isOwnProfile = currentUser === username;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/users/profile/${username}`);
                setProfile(res.data.user);
                setPosts(res.data.posts);
                setStats(res.data.stats);
                setIsFollowing(res.data.isFollowing);
            } catch (err) {
                console.error("Error fetching profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await api.delete(`/follows/unfollow/${profile.id}`);
                setStats(prev => ({ ...prev, followers: parseInt(prev.followers) - 1 }));
            } else {
                await api.post(`/follows/follow/${profile.id}`);
                setStats(prev => ({ ...prev, followers: parseInt(prev.followers) + 1 }));
            }
            setIsFollowing(!isFollowing);
        } catch (err) {
            console.error("Follow error", err);
        }
    };

    const handlePostClick = async (postId) => {
        try {
            const res = await api.get(`/posts/${postId}`);
            setSelectedPost(res.data);
            setIsEditing(false); 
        } catch (err) {
            console.error("Error fetching post details", err);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(p => p.id !== postId));
            setStats(prev => ({ ...prev, posts: prev.posts - 1 }));
            setSelectedPost(null);
        } catch (err) {
            console.error("Error deleting post", err);
        }
    };

    const handleUpdatePost = async () => {
        try {
            const res = await api.put(`/posts/${selectedPost.post.id}`, { content: editCaption });
            setSelectedPost(prev => ({
                ...prev,
                post: { ...prev.post, content: res.data.post.content }
            }));
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating post", err);
            alert("Failed to update post");
        }
    };

    const handleLikePost = async () => {
        if (!selectedPost) return;
        try {
            const res = await api.post(`/posts/${selectedPost.post.id}/like`);
            setSelectedPost(prev => ({
                ...prev,
                post: { ...prev.post, likes: res.data.likes }
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const res = await api.post(`/comments/posts/${selectedPost.post.id}`, { content: commentText });
            const newComment = res.data.comment;
            newComment.username = currentUser;
            setSelectedPost(prev => ({
                ...prev,
                comments: [...prev.comments, newComment]
            }));
            setCommentText('');
        } catch (err) {
            console.error(err);
        }
    };

    // DELETE COMMENT FUNCTION 
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        
        try {
            await api.delete(`/comments/${commentId}`);
            
            // Remove from local list instantly
            setSelectedPost(prev => ({
                ...prev,
                comments: prev.comments.filter(c => c.id !== commentId)
            }));
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    };

    const openUserList = async (type) => {
        if (stats[type] === 0) return;
        try {
            const res = await api.get(`/follows/${type}/${profile.id}`);
            setUserList(res.data[type]);
            setShowUserModal(type);
        } catch (err) {
            console.error(`Error fetching ${type}`, err);
        }
    };

    if (loading) return <div className="profile-container">Loading...</div>;
    if (!profile) return <div className="profile-container">User not found</div>;

    return (
        <>
            <Navbar />
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-pic-large">{profile.username[0].toUpperCase()}</div>
                    <div className="profile-info">
                        <div className="profile-title-row">
                            <h2 className="profile-username">{profile.username}</h2>
                            {!isOwnProfile && (
                                <button className={`follow-btn ${isFollowing ? 'following' : ''}`} onClick={handleFollowToggle}>
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            )}
                        </div>
                        <div className="profile-stats">
                            <span><span className="stat-count">{stats.posts}</span> posts</span>
                            <span onClick={() => openUserList('followers')} style={{cursor: 'pointer'}}><span className="stat-count">{stats.followers}</span> followers</span>
                            <span onClick={() => openUserList('following')} style={{cursor: 'pointer'}}><span className="stat-count">{stats.following}</span> following</span>
                        </div>
                        <div className="profile-fullname">{profile.name}</div>
                    </div>
                </div>

                <div className="profile-posts-grid">
                    {posts.map(post => (
                        <div key={post.id} className="grid-post" onClick={() => handlePostClick(post.id)}>
                            {post.image_url ? (
                                <img src={post.image_url} alt="post" className="grid-image" />
                            ) : (
                                <div className="grid-image" style={{display:'flex', alignItems:'center', justifyContent:'center', background:'#eee'}}>📝</div>
                            )}
                            <div className="grid-overlay">❤️ {post.likes}</div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedPost && (
                <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedPost(null)}>×</button>
                        
                        <div className="post-modal-layout">
                            <div className="post-modal-image-container">
                                {selectedPost.post.image_url ? (
                                    <img src={selectedPost.post.image_url} className="post-modal-image" alt="Post" />
                                ) : (
                                    <div style={{color:'white'}}>No Image</div>
                                )}
                            </div>

                            <div className="post-modal-sidebar">
                                <div className="modal-header">
                                    <strong>{selectedPost.post.username}</strong>
                                    
                                    {isOwnProfile && (
                                        <div style={{display:'flex', gap:'10px'}}>
                                            {!isEditing ? (
                                                <button 
                                                    onClick={() => {
                                                        setIsEditing(true);
                                                        setEditCaption(selectedPost.post.content);
                                                    }}
                                                    className="delete-btn"
                                                    style={{color: 'black'}}
                                                >
                                                    Edit
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={handleUpdatePost}
                                                    className="delete-btn"
                                                    style={{color: '#0095f6'}}
                                                >
                                                    Save
                                                </button>
                                            )}

                                            <button 
                                                className="delete-btn" 
                                                onClick={() => handleDeletePost(selectedPost.post.id)}
                                                style={{color:'red'}}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="modal-comments-list">
                                    <div style={{marginBottom:'10px', borderBottom:'1px solid #efefef', paddingBottom:'10px'}}>
                                        <strong>{selectedPost.post.username} </strong>
                                        {isEditing ? (
                                            <textarea 
                                                value={editCaption} 
                                                onChange={(e) => setEditCaption(e.target.value)}
                                            />
                                        ) : (
                                            <span>{selectedPost.post.content}</span>
                                        )}
                                    </div>

                                    {selectedPost.comments.map((c, i) => (
                                        <div key={c.id || i} style={{marginBottom:'8px', fontSize:'14px', display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                            <div>
                                                <strong style={{marginRight:'5px'}}>{c.username}</strong> 
                                                {c.content}
                                            </div>
                                            
                                            {/*DELETE COMMENT BUTTON (Only if owner) */}
                                            {c.username === currentUser && (
                                                <button 
                                                    onClick={() => handleDeleteComment(c.id)}
                                                    style={{
                                                        border:'none', background:'none', color:'#ef4444', 
                                                        cursor:'pointer', fontSize:'16px', marginLeft:'10px', padding:'0'
                                                    }}
                                                    title="Delete Comment"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="modal-actions">
                                    <div style={{marginBottom:'10px'}}>
                                        <button onClick={handleLikePost} style={{background:'none', color:'black', padding:0, fontSize:'20px', marginRight:'10px'}}>❤️</button>
                                        <strong>{selectedPost.post.likes} likes</strong>
                                    </div>
                                    <form onSubmit={handlePostComment}>
                                        <input 
                                            type="text" 
                                            placeholder="Add a comment..." 
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                        />
                                        <button type="submit" disabled={!commentText}>Post</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showUserModal && (
                <div className="modal-overlay" onClick={() => setShowUserModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-title">{showUserModal === 'followers' ? 'Followers' : 'Following'}</div>
                        <button className="modal-close" onClick={() => setShowUserModal(null)}>×</button>
                        <div>
                            {userList.map(user => (
                                <Link to={`/profile/${user.username}`} key={user.id} className="user-list-item" onClick={() => setShowUserModal(null)}>
                                    <div className="user-list-avatar">{user.username[0].toUpperCase()}</div>
                                    <div className="user-list-info">
                                        <span className="user-list-username">{user.username}</span>
                                        <span style={{fontSize:'12px', color:'#888'}}>{user.name}</span>
                                    </div>
                                </Link>
                            ))}
                            {userList.length === 0 && <p style={{textAlign:'center', padding:'20px'}}>No users found.</p>}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;