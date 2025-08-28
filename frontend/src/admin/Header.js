import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onLogout }) => {
  return (
    <header className="admin-header">
      <nav className="admin-nav">
        <Link to="/admin" className="admin-logo">
          fathi.vlogs Admin
        </Link>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/admin" className="btn btn-secondary btn-sm">
            Dashboard
          </Link>
          <Link to="/admin/blogs" className="btn btn-secondary btn-sm">
            Manage Blogs
          </Link>
          <Link to="/admin/blogs/new" className="btn btn-primary btn-sm">
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
