import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI } from '../services/api';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getBlogById(id);
        setBlog(response.data);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Blog not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="section">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="section">
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <h2 style={{ color: '#f87171', marginBottom: '20px' }}>Blog Not Found</h2>
          <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
            {error || "The blog post you're looking for doesn't exist."}
          </p>
          <Link to="/blogs" className="glow-button">
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="blog-detail">
        <Link to="/blogs" className="back-button">
          ← Back to Blogs
        </Link>

        <div className="blog-detail-header">
          <h1 className="blog-detail-title">{blog.title}</h1>
          
          <div className="blog-detail-meta">
            <span>Published {formatDate(blog.publishDate)}</span>
            <span>{blog.views} views</span>
            {blog.tags && blog.tags.length > 0 && (
              <span>{blog.tags.length} tag{blog.tags.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px', 
              justifyContent: 'center',
              marginBottom: '32px'
            }}>
              {blog.tags.map((tag, index) => (
                <span 
                  key={index}
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#6366f1',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    fontWeight: '500'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {blog.image && (
            <img 
              src={`http://localhost:5000${blog.image}`} 
              alt={blog.title}
              className="blog-detail-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>

        <div className="blog-detail-content">
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.3)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            marginBottom: '32px'
          }}>
            <h3 style={{ 
              color: '#e2e8f0', 
              marginBottom: '12px',
              fontSize: '1.25rem'
            }}>
              Summary
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.7' }}>
              {blog.description}
            </p>
          </div>

          <div style={{ whiteSpace: 'pre-wrap' }}>
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index} style={{ marginBottom: '24px' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '60px',
          padding: '32px',
          background: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '16px' }}>
            Enjoyed this article?
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
            Check out more amazing content on our blog!
          </p>
          <Link to="/blogs" className="glow-button">
            Read More Articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
