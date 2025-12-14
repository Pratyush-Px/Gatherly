import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import '../styles/feed.css';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1); // Track current page
    const [hasMore, setHasMore] = useState(true); // Hide button if no more posts
    const [loadingMore, setLoadingMore] = useState(false); // Spinner for button

    const [commentInputs, setCommentInputs] = useState({});

    // 1. Initial Load (Page 1)
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await api.get('/posts/feed?page=1');
                setPosts(res.data.posts);
                if (res.data.posts.length < 20) setHasMore(false); // Less than 20 means end of list
            } catch (err) {
                console.error("Error fetching feed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // 2. Load More Function
    const handleLoadMore = async () => {
        setLoadingMore(true);
        const nextPage = page + 1;
        
        try {
            const res = await api.get(`/posts/feed?page=${nextPage}`);
            const newPosts = res.data.posts;

            if (newPosts.length === 0) {
                setHasMore(false); // No more posts to load
            } else {
                // Combine old posts + new posts
                setPosts(prev => [...prev, ...newPosts]);
                setPage(nextPage);
                if (newPosts.length < 20) setHasMore(false);
            }
        } catch (err) {
            console.error("Error loading more:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await api.post(`/posts/${postId}/like`);
            setPosts(posts.map(post => 
                post.id === postId ? { ...post, likes: res.data.likes } : post
            ));
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (postId, value) => {
        setCommentInputs(prev => ({ ...prev, [postId]: value }));
    };

    const handlePostComment = async (e, postId) => {
        e.preventDefault();
        const content = commentInputs[postId];
        if (!content) return;

        try {
            const res = await api.post(`/comments/posts/${postId}`, { content });
            const newComment = res.data.comment;
            const username = localStorage.getItem('username') || "me"; 
            newComment.username = username; 

            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return { ...post, comments: [...post.comments, newComment] };
                }
                return post;
            }));

            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        } catch (err) {
            console.error("Failed to post comment", err);
        }
    };

    if (loading) return <div className="feed-container">Loading...</div>;

    return (
        <>
            <Navbar />
            
            <div className="feed-container">
                {posts.length === 0 ? (
                    <p style={{textAlign: 'center', marginTop: '20px'}}>No posts yet.</p>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="post-card">
                            <div className="post-header">
                                <div className="post-avatar-placeholder">
                                    {post.username[0].toUpperCase()}
                                </div>
                                <Link 
                                    to={`/profile/${post.username}`} 
                                    className="post-username"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    {post.username}
                                </Link>
                            </div>

                            {post.image_url && (
                                <img src={post.image_url} alt="Post" className="post-image" />
                            )}

                            <div className="post-actions">
                                <button className="like-btn" onClick={() => handleLike(post.id)}>
                                    ❤️
                                </button>
                                <span className="likes-count">
                                    {post.likes} {post.likes === 1 ? 'like' : 'likes'}
                                </span>
                            </div>

                            <div className="post-caption">
                                <Link 
                                    to={`/profile/${post.username}`} 
                                    className="post-username"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    {post.username} 
                                </Link>
                                {' '}{post.content}
                            </div>

                            <div className="comments-section">
                                {post.comments && post.comments.map((comment, index) => (
                                    <div key={comment.id || index} className="comment-item">
                                        <span className="comment-username">{comment.username}</span>
                                        {comment.content}
                                    </div>
                                ))}
                            </div>

                            <form className="comment-form" onSubmit={(e) => handlePostComment(e, post.id)}>
                                <input 
                                    type="text" 
                                    className="comment-input" 
                                    placeholder="Add a comment..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => handleInputChange(post.id, e.target.value)}
                                />
                                <button type="submit" className="post-btn" disabled={!commentInputs[post.id]}>
                                    Post
                                </button>
                            </form>
                        </div>
                    ))
                )}

                {/* --- LOAD MORE BUTTON --- */}
                {hasMore && posts.length > 0 && (
                    <div style={{ textAlign: 'center', margin: '20px 0 40px' }}>
                        <button 
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#0095f6',
                                border: '1px solid #0095f6',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {loadingMore ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Feed;