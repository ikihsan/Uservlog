const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['*'] // Allow all origins for now to test
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'],
  credentials: true
}));

app.use(express.json());

// File storage paths
const dataDir = path.join('/tmp', 'blog-data');
const adminFile = path.join(dataDir, 'admin.json');

// Initialize data directory
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize admin if not exists
if (!fs.existsSync(adminFile)) {
  const adminData = {
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    lastLogin: null
  };
  fs.writeFileSync(adminFile, JSON.stringify(adminData, null, 2));
}

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Get admin data
    const adminData = JSON.parse(fs.readFileSync(adminFile, 'utf8'));
    console.log('Admin data loaded:', { username: adminData.username });

    if (username !== adminData.username) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = bcrypt.compareSync(password, adminData.password);
    console.log('Password validation:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: adminData.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Update last login
    adminData.lastLogin = new Date().toISOString();
    fs.writeFileSync(adminFile, JSON.stringify(adminData, null, 2));

    console.log('Login successful');
    res.json({
      message: 'Login successful',
      token,
      user: { username: adminData.username }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token route
app.get('/api/auth/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Auth API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
