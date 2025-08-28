import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogAPI } from '../services/api';

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: '',
    isPublished: true
  });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBlog = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await blogAPI.getBlogById(id);
      const blog = response.data;
      
      setFormData({
        title: blog.title,
        description: blog.description,
        content: blog.content,
        tags: blog.tags ? blog.tags.join(', ') : '',
        isPublished: blog.isPublished
      });
      setCurrentImage(blog.image);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to load blog data.');
    } finally {
      setFetchLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      fetchBlog();
    }
  }, [id, isEditing, fetchBlog]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB.');
        return;
      }
      
      setImage(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error('Title is required.');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required.');
      }
      if (!formData.content.trim()) {
        throw new Error('Content is required.');
      }

      // Prepare form data
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('content', formData.content.trim());
      submitData.append('tags', formData.tags.trim());
      submitData.append('isPublished', formData.isPublished);
      
      if (image) {
        submitData.append('image', image);
      }

      if (isEditing) {
        await blogAPI.updateBlog(id, submitData);
        setSuccess('Blog updated successfully!');
      } else {
        await blogAPI.createBlog(submitData);
        setSuccess('Blog created successfully!');
      }

      // Redirect after a delay
      setTimeout(() => {
        navigate('/admin/blogs');
      }, 1500);

    } catch (error) {
      console.error('Error saving blog:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ 
        fontSize: '2.5rem',
        fontWeight: '800',
        marginBottom: '2rem',
        background: 'linear-gradient(145deg, #6366f1, #8b5cf6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {isEditing ? 'Edit Blog' : 'Create New Blog'}
      </h1>

      <div className="card">
        {success && (
          <div className="success-message">
            <strong>{success}</strong><br />
            Redirecting to blog list...
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter blog title"
              maxLength="200"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              required
              placeholder="Brief description of the blog post"
              maxLength="1000"
              rows="3"
            />
            <small style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              {formData.description.length}/1000 characters
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="form-textarea"
              required
              placeholder="Write your blog content here..."
              rows="15"
              style={{ minHeight: '400px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags" className="form-label">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter tags separated by commas (e.g., technology, design, programming)"
            />
            <small style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Separate multiple tags with commas
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="image" className="form-label">Featured Image</label>
            {currentImage && (
              <div style={{ marginBottom: '1rem' }}>
                <img 
                  src={`http://localhost:5000${currentImage}`}
                  alt="Current blog"
                  style={{
                    maxWidth: '200px',
                    height: 'auto',
                    borderRadius: '8px',
                    border: '1px solid rgba(99, 102, 241, 0.3)'
                  }}
                />
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Current image
                </p>
              </div>
            )}
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              className="form-input"
              accept="image/*"
            />
            <small style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </small>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                style={{
                  accentColor: '#6366f1',
                  transform: 'scale(1.2)'
                }}
              />
              <span className="form-label" style={{ margin: 0 }}>Publish immediately</span>
            </label>
            <small style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Uncheck to save as draft
            </small>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <button
              type="button"
              onClick={() => navigate('/admin/blogs')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Blog' : 'Create Blog')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;
