import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onLogout }) => {
  return (
    <header className="admin-header">
      <nav className="admin-nav">
        <Link to="/" className="admin-logo">
          UserBlog Admin
        </Link>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/" className="btn btn-secondary btn-sm">
            Dashboard
          </Link>
          <Link to="/blogs" className="btn btn-secondary btn-sm">
            Manage Blogs
          </Link>
          <Link to="/blogs/new" className="btn btn-primary btn-sm">
            New Blog
          </Link>
          <button 
            onClick={onLogout}
            className="btn btn-danger btn-sm"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
