import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import '../styles/createPost.css';

const CreatePost = () => {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false); //state for error handling
    const navigate = useNavigate();

    // Resets error when user types a new URL
    const handleImageChange = (e) => {
        setImageUrl(e.target.value);
        setImageError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/posts/create', {
                content: content,
                image_url: imageUrl
            });
            navigate('/feed');
        } catch (err) {
            console.error("Failed to create post:", err);
            alert("Failed to post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="create-post-container">
                <div className="create-card">
                    <h2 className="create-header">Create New Post</h2>
                    
                    <form className="create-form" onSubmit={handleSubmit}>
                        <div>
                            <input 
                                type="text" 
                                placeholder="Paste Image Address (Right-click image > Copy Image Address)" 
                                value={imageUrl}
                                onChange={handleImageChange}
                                required
                            />
                        </div>

                        {/* Image Preview */}
                        <div className="image-preview">
                            {imageUrl && !imageError ? (
                                <img 
                                    src={imageUrl} 
                                    alt="Preview" 
                                    onError={() => setImageError(true)} 
                                />
                            ) : (
                                <span style={{color: imageError ? 'red' : 'inherit'}}>
                                    {imageError ? "Invalid Image Link" : "Image Preview"}
                                </span>
                            )}
                        </div>

                        <textarea 
                            className="caption-input"
                            placeholder="Write a caption..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        ></textarea>

                        <button type="submit" disabled={loading || imageError}>
                            {loading ? 'Sharing...' : 'Share'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreatePost;