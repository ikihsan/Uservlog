import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalViews: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await blogAPI.getAllBlogs({ limit: 5 });
        const blogs = response.data.blogs;
        
        setRecentBlogs(blogs);
        
        // Calculate stats
        const totalBlogs = blogs.length;
        const publishedBlogs = blogs.filter(blog => blog.isPublished).length;
        const draftBlogs = totalBlogs - publishedBlogs;
        const totalViews = blogs.reduce((sum, blog) => sum + blog.views, 0);
        
        setStats({
          totalBlogs,
          publishedBlogs,
          draftBlogs,
          totalViews
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
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
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalBlogs}</div>
          <div className="stat-label">Total Blogs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.publishedBlogs}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.draftBlogs}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalViews}</div>
          <div className="stat-label">Total Views</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/admin/blogs/new" className="btn btn-primary">
            ✏️ Create New Blog
          </Link>
          <Link to="/admin/blogs" className="btn btn-secondary">
            📝 Manage Blogs
          </Link>
          <a 
            href="http://localhost:3000" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            👀 View Frontend
          </a>
        </div>
      </div>

      {/* Recent Blogs */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Blogs</h2>
          <Link to="/admin/blogs" className="btn btn-secondary btn-sm">
            View All
          </Link>
        </div>
        
        {recentBlogs.length > 0 ? (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBlogs.map((blog) => (
                  <tr key={blog._id}>
                    <td>
                      <strong style={{ color: '#e2e8f0' }}>{blog.title}</strong>
                    </td>
                    <td>
                      <span style={{
                        background: blog.isPublished 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(239, 68, 68, 0.1)',
                        color: blog.isPublished ? '#22c55e' : '#ef4444',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        border: `1px solid ${blog.isPublished 
                          ? 'rgba(34, 197, 94, 0.3)' 
                          : 'rgba(239, 68, 68, 0.3)'}`
                      }}>
                        {blog.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{blog.views}</td>
                    <td>{formatDate(blog.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link 
                          to={`/admin/blogs/edit/${blog._id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </Link>
                        <a 
                          href={`http://localhost:3000/blogs/${blog._id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: '#94a3b8'
          }}>
            <h3>No blogs found</h3>
            <p>Create your first blog to get started!</p>
            <Link to="/admin/blogs/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Create First Blog
            </Link>
          </div>
        )}
      </div>

      {/* System Info */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">System Information</h2>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <h4 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>Version</h4>
            <p style={{ color: '#94a3b8' }}>fathi.vlogs v1.0.0</p>
          </div>
          <div>
            <h4 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>Last Updated</h4>
            <p style={{ color: '#94a3b8' }}>{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <h4 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>Built by</h4>
            <p style={{ color: '#94a3b8' }}>ikcodes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
