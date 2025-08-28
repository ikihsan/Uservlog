import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../services/api';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await blogAPI.getAllBlogs({ page, limit: 10 });
      setBlogs(response.data.blogs);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (blogId, blogTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(blogId);
      await blogAPI.deleteBlog(blogId);
      await fetchBlogs(currentPage);
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          fontWeight: '800',
          background: 'linear-gradient(145deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Manage Blogs
        </h1>
        <Link to="/blogs/new" className="btn btn-primary">
          ✏️ Create New Blog
        </Link>
      </div>

      {blogs.length > 0 ? (
        <div className="card">
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id}>
                    <td>
                      <div>
                        <strong style={{ color: '#e2e8f0' }}>{blog.title}</strong>
                        {blog.description && (
                          <p style={{ 
                            color: '#94a3b8', 
                            fontSize: '0.875rem',
                            marginTop: '0.25rem',
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {blog.description}
                          </p>
                        )}
                      </div>
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
                    <td>
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#6366f1',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        border: '1px solid rgba(99, 102, 241, 0.3)'
                      }}>
                        {blog.views}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>
                      {formatDate(blog.createdAt)}
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>
                      {formatDate(blog.updatedAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Link 
                          to={`/blogs/edit/${blog._id}`}
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
                        <button
                          onClick={() => handleDelete(blog._id, blog.title)}
                          className="btn btn-danger btn-sm"
                          disabled={deleteLoading === blog._id}
                        >
                          {deleteLoading === blog._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '1rem',
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <button
                onClick={() => fetchBlogs(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm"
                style={{ 
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              <span style={{ color: '#94a3b8' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => fetchBlogs(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm"
                style={{ 
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            color: '#94a3b8'
          }}>
            <h3>No blogs found</h3>
            <p>Create your first blog to get started!</p>
            <Link to="/blogs/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Create First Blog
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList;
