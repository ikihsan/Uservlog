const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();

// CORS configuration - allow all origins for testing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File storage setup
const dataDir = '/tmp/blog-data';
const adminFile = path.join(dataDir, 'admin.json');
const blogsFile = path.join(dataDir, 'blogs.json');

// Initialize data directory
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize admin
if (!fs.existsSync(adminFile)) {
  const adminData = {
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    lastLogin: null
  };
  fs.writeFileSync(adminFile, JSON.stringify(adminData, null, 2));
}

// Initialize sample blogs
if (!fs.existsSync(blogsFile)) {
  const sampleBlogs = [
    {
      _id: '1',
      title: 'Welcome to Fathi.vlogs',
      description: 'My journey as an engineering student exploring the world of technology, coding, and innovation.',
      content: 'Welcome to my personal blog! 👋\n\nI\'m Fathima, an engineering student passionate about technology...',
      image: '',
      publishDate: new Date().toISOString(),
      isPublished: true,
      views: 42,
      tags: ['welcome', 'engineering', 'journey'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(blogsFile, JSON.stringify(sampleBlogs, null, 2));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fathi.vlogs API is running',
    timestamp: new Date().toISOString()
  });
});

// Auth login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request:', req.body);
    
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const adminData = JSON.parse(fs.readFileSync(adminFile, 'utf8'));
    
    if (username !== adminData.username) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = bcrypt.compareSync(password, adminData.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username: adminData.username },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    adminData.lastLogin = new Date().toISOString();
    fs.writeFileSync(adminFile, JSON.stringify(adminData, null, 2));

    res.json({
      message: 'Login successful',
      token,
      user: { username: adminData.username }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Auth verify
app.get('/api/auth/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'your-secret-key');
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Get blogs
app.get('/api/blogs', (req, res) => {
  try {
    const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf8'));
    const publishedBlogs = blogs.filter(blog => blog.isPublished);
    res.json(publishedBlogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
