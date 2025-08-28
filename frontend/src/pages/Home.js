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
                featuredBlogs.map((blog) => (
                  <Link to={`/blogs/${blog._id}`} key={blog._id} className="blog-card">
                    {blog.image ? (
                      <img 
                        src={`http://localhost:5000${blog.image}`} 
                        alt={blog.title}
                        className="blog-card-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
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
                ))
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
          <h2 className="section-title">Why Choose UserBlog?</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            marginTop: '40px'
          }}>
            <div className="card">
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎨</div>
              <h3 style={{ marginBottom: '12px', color: '#e2e8f0' }}>Modern Design</h3>
              <p style={{ color: '#94a3b8' }}>
                Experience a futuristic, dark-themed interface with stunning gradients and smooth animations.
              </p>
            </div>
            <div className="card">
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📱</div>
              <h3 style={{ marginBottom: '12px', color: '#e2e8f0' }}>Responsive</h3>
              <p style={{ color: '#94a3b8' }}>
                Perfectly optimized for all devices - desktop, tablet, and mobile experiences.
              </p>
            </div>
            <div className="card">
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚡</div>
              <h3 style={{ marginBottom: '12px', color: '#e2e8f0' }}>Fast & Reliable</h3>
              <p style={{ color: '#94a3b8' }}>
                Lightning-fast loading times and reliable performance for the best user experience.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
