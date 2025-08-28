import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../services/api';

const Home = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      try {
        const response = await blogAPI.getAllBlogs({ limit: 3 });
        setFeaturedBlogs(response.data.blogs);
      } catch (error) {
        console.error('Error fetching featured blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBlogs();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    // For relative URLs, prepend the API base URL
    const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
    return imageUrl.startsWith('/api/') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to fathi.vlogs</h1>
          <p>
            Join me on my journey as an engineering student, sharing thoughts,
            experiences, and insights from my academic and personal life.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/blogs" className="glow-button">
              Explore Blogs
            </Link>
            <Link to="/about" className="glow-button" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '2px solid rgba(99, 102, 241, 0.3)' }}>
              About Me
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Blogs Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Latest Stories</h2>
          <p className="section-subtitle">
            Stay updated with the most recent articles and insights
          </p>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="blog-grid">
              {featuredBlogs.length > 0 ? (
                featuredBlogs.map((blog) => {
                  return (
                  <Link to={`/blogs/${blog._id}`} key={blog._id} className="blog-card">
                    {blog.image && blog.image.trim() !== '' ? (
                      <img 
                        src={getImageUrl(blog.image)} 
                        alt={blog.title}
                        className="blog-card-image"
                        onError={(e) => {
                          console.log('Image failed to load:', blog.title, 'URL:', getImageUrl(blog.image));
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', blog.title, 'URL:', getImageUrl(blog.image));
                        }}
                      />
                    ) : (
                      <div className="blog-card-image"></div>
                    )}
                    <div className="blog-card-content">
                      <h3 className="blog-card-title">{blog.title}</h3>
                      <p className="blog-card-description">{blog.description}</p>
                      <div className="blog-card-meta">
                        <span className="blog-card-date">
                          {formatDate(blog.publishDate)}
                        </span>
                        <span>{blog.views} views</span>
                      </div>
                    </div>
                  </Link>
                )})
              ) : (
                <div style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: '#94a3b8'
                }}>
                  <h3>No blogs found</h3>
                  <p>Check back soon for new content!</p>
                </div>
              )}
            </div>
          )}

          {featuredBlogs.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/blogs" className="glow-button">
                View All Blogs
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{ background: 'rgba(30, 41, 59, 0.1)' }}>
        <div className="container">
          <h2 className="section-title">"The Journey of a Thousand Miles Begins with One Step"</h2>
          <p style={{ 
            textAlign: 'center', 
            color: '#94a3b8', 
            fontSize: '1.1rem', 
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px auto'
          }}>
            Every great engineer started as a curious learner. Follow my journey through the world of technology, 
            innovation, and personal growth.
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            marginTop: '40px'
          }}>
            <div className="card">
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎨</div>
              <h3 style={{ marginBottom: '12px', color: '#e2e8f0' }}>Creative Expression</h3>
              <p style={{ color: '#94a3b8' }}>
                Where engineering meets creativity - sharing innovative ideas and artistic approaches to problem-solving.
              </p>
            </div>
            <div className="card">
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📱</div>
              <h3 style={{ marginBottom: '12px', color: '#e2e8f0' }}>Tech Journey</h3>
              <p style={{ color: '#94a3b8' }}>
                From code to concepts - documenting my learning experiences and discoveries in the tech world.
              </p>
            </div>
            <div className="card">
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚡</div>
              <h3 style={{ marginBottom: '12px', color: '#e2e8f0' }}>Growth Mindset</h3>
              <p style={{ color: '#94a3b8' }}>
                Embracing challenges, learning from failures, and celebrating progress - one post at a time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
