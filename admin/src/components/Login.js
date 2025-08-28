import React, { useState } from 'react';
import { authAPI } from '../services/api';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('adminToken', response.data.token);
      onLogin();
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-title">Admin Login</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Enter admin username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Enter admin password"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>Default Credentials</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Username: <strong>admin</strong><br />
            Password: <strong>admin123</strong>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
