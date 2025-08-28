import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../services/api';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchBlogs = async (page = 1, search = '') => {
    try {
      setLoading(page === 1);
      setSearchLoading(search !== '');
      
      const response = await blogAPI.getAllBlogs({ 
        page, 
        limit: 9,
        search 
      });
      
      setBlogs(response.data.blogs);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(1, ''); // Start with empty search term
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs(1, searchTerm);
  };

  const handlePageChange = (page) => {
    fetchBlogs(page, searchTerm);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl;
    // For relative URLs, prepend the API base URL
    const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
    return imageUrl.startsWith('/api/') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title">All Blogs</h1>
        <p className="section-subtitle">
          Explore our collection of articles, insights, and stories
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: '500px', margin: '0 auto 60px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ flex: 1 }}
            />
            <button 
              type="submit" 
              className="glow-button"
              disabled={searchLoading}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {blogs.length > 0 ? (
              <div className="blog-grid">
                {blogs.map((blog) => {
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
                      {blog.tags && blog.tags.length > 0 && (
                        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span 
                              key={index}
                              style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: '#6366f1',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                border: '1px solid rgba(99, 102, 241, 0.3)'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                )})}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '80px 20px',
                color: '#94a3b8'
              }}>
                <h3>No blogs found</h3>
                {searchTerm ? (
                  <p>No results for "{searchTerm}". Try a different search term.</p>
                ) : (
                  <p>Check back soon for new content!</p>
                )}
                {searchTerm && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      fetchBlogs(1, '');
                    }}
                    className="glow-button"
                    style={{ marginTop: '20px' }}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '12px',
                marginTop: '60px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="glow-button"
                  style={{ 
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          background: pageNum === currentPage 
                            ? 'linear-gradient(145deg, #6366f1, #8b5cf6)' 
                            : 'rgba(99, 102, 241, 0.1)',
                          border: `1px solid ${pageNum === currentPage ? '#6366f1' : 'rgba(99, 102, 241, 0.3)'}`,
                          color: pageNum === currentPage ? 'white' : '#94a3b8',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: '0.9rem'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="glow-button"
                  style={{ 
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blogs;
