const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// CORS configuration - allow all origins for testing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static images
app.use('/api/uploads', express.static(uploadsDir));

// In-memory storage (since Vercel /tmp is ephemeral)
let adminData = {
  username: 'admin',
  password: bcrypt.hashSync('admin123', 10),
  lastLogin: null
};

let blogsData = [
  {
    _id: '1',
    title: 'Welcome to Fathi.vlogs',
    description: 'My journey as an engineering student exploring the world of technology, coding, and innovation.',
    content: 'Welcome to my personal blog! 👋\n\nI\'m Fathima, an engineering student passionate about technology, coding, and innovation. This blog is where I share my learning journey, project experiences, and insights from the fascinating world of engineering.\n\nFrom coding challenges to breakthrough moments, from failed experiments to successful implementations - I believe every step of the learning process has value. Through this platform, I hope to connect with fellow learners, share knowledge, and inspire others who are on similar paths.\n\nWhat you can expect to find here:\n• Technical tutorials and guides\n• Project showcases and case studies\n• Learning resources and recommendations\n• Personal reflections on the engineering journey\n• Industry insights and trends\n\nWhether you\'re a fellow student, a seasoned professional, or simply someone curious about technology, I hope you find something valuable here. Let\'s learn and grow together!\n\nFeel free to reach out if you have questions, suggestions, or just want to connect. Happy reading! 🚀',
    image: '', // No image for sample blog
    publishDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    views: 42,
    tags: ['welcome', 'engineering', 'journey']
  },
  {
    _id: '2',
    title: 'Getting Started with Web Development',
    description: 'A beginner\'s guide to building your first web application.',
    content: 'Web development is an exciting field that combines creativity with technical skills. In this post, I\'ll share some tips for getting started with web development.\n\nHere are the key technologies you should learn:\n\n1. HTML - The structure of web pages\n2. CSS - The styling and layout\n3. JavaScript - The interactive functionality\n4. React - A powerful frontend framework\n5. Node.js - Backend development\n\nRemember, practice makes perfect!',
    image: '',
    publishDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    views: 15,
    tags: ['webdev', 'beginner', 'tutorial']
  }
];

// Helper functions for data management
const getBlogs = () => blogsData;
const saveBlogs = (blogs) => { blogsData = blogs; };
const getAdmin = () => adminData;
const saveAdmin = (admin) => { adminData = admin; };

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fathi.vlogs API is running',
    timestamp: new Date().toISOString(),
    totalBlogs: blogsData.length,
    publishedBlogs: blogsData.filter(b => b.isPublished).length
  });
});

// Test endpoint to check blogs data
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    blogsCount: blogsData.length,
    blogs: blogsData.map(blog => ({
      _id: blog._id,
      title: blog.title,
      isPublished: blog.isPublished,
      hasImage: !!blog.image,
      imageUrl: blog.image
    }))
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

    const admin = getAdmin();
    
    if (username !== admin.username) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = bcrypt.compareSync(password, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username: admin.username },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    admin.lastLogin = new Date().toISOString();
    saveAdmin(admin);

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

// Get blogs (public)
app.get('/api/blogs', (req, res) => {
  try {
    console.log('GET /api/blogs called');
    const blogs = getBlogs();
    console.log('Total blogs available:', blogs.length);
    const publishedBlogs = blogs.filter(blog => blog.isPublished);
    console.log('Published blogs:', publishedBlogs.length);
    
    console.log('Returning blogs with image info:');
    publishedBlogs.forEach((blog, index) => {
      console.log(`Blog ${index + 1} (${blog.title}):`, {
        id: blog._id,
        isPublished: blog.isPublished,
        hasImage: !!blog.image,
        imageUrl: blog.image
      });
    });
    
    res.json(publishedBlogs);
  } catch (error) {
    console.error('Error in GET /api/blogs:', error);
    res.status(500).json({ message: 'Error fetching blogs', error: error.message });
  }
});

// Get all blogs (admin)
app.get('/api/blogs/admin/all', (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const blogs = getBlogs();
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBlogs = blogs.slice(startIndex, endIndex);
    
    res.json({
      blogs: paginatedBlogs,
      totalBlogs: blogs.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(blogs.length / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs' });
  }
});

// Get single blog
app.get('/api/blogs/:id', (req, res) => {
  try {
    const blogs = getBlogs();
    const blog = blogs.find(b => b._id === req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog' });
  }
});

// Create blog
app.post('/api/blogs', upload.single('image'), (req, res) => {
  try {
    console.log('Create blog request body keys:', Object.keys(req.body));
    console.log('Uploaded file:', req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    } : 'No file uploaded');
    
    const { title, description, content, tags, isPublished } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      console.log('Title validation failed:', title);
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!description || !description.trim()) {
      console.log('Description validation failed:', description);
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!content || !content.trim()) {
      console.log('Content validation failed:', content);
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const blogs = getBlogs();
    
    // Generate image URL if file was uploaded
    const imageUrl = req.file ? `/api/uploads/${req.file.filename}` : '';
    
    const newBlog = {
      _id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      isPublished: isPublished === 'true' || isPublished === true,
      views: 0,
      image: imageUrl, // Store URL instead of base64
      publishDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    blogs.unshift(newBlog);
    saveBlogs(blogs);
    
    console.log('Blog created successfully with image URL:', imageUrl);
    res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Error creating blog', error: error.message });
  }
});

// Update blog
app.put('/api/blogs/:id', upload.single('image'), (req, res) => {
  try {
    console.log('Update blog request body keys:', Object.keys(req.body));
    console.log('Uploaded file:', req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    } : 'No file uploaded');
    
    const { title, description, content, tags, isPublished } = req.body;
    const blogs = getBlogs();
    
    const blogIndex = blogs.findIndex(b => b._id === req.params.id);
    
    if (blogIndex === -1) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Update blog with new data
    const updatedBlog = {
      ...blogs[blogIndex],
      title: title?.trim() || blogs[blogIndex].title,
      description: description?.trim() || blogs[blogIndex].description,
      content: content?.trim() || blogs[blogIndex].content,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : blogs[blogIndex].tags,
      isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : blogs[blogIndex].isPublished,
      updatedAt: new Date().toISOString()
    };
    
    // Update image if new file was provided
    if (req.file) {
      // Delete old image file if it exists
      if (blogs[blogIndex].image && blogs[blogIndex].image.startsWith('/api/uploads/')) {
        const oldImagePath = path.join(uploadsDir, path.basename(blogs[blogIndex].image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Deleted old image:', oldImagePath);
        }
      }
      updatedBlog.image = `/api/uploads/${req.file.filename}`;
    }
    
    blogs[blogIndex] = updatedBlog;
    saveBlogs(blogs);
    
    console.log('Blog updated successfully with image URL:', updatedBlog.image);
    res.json({ message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Error updating blog', error: error.message });
  }
});

// Delete blog
app.delete('/api/blogs/:id', (req, res) => {
  try {
    const blogs = getBlogs();
    const blogIndex = blogs.findIndex(b => b._id === req.params.id);
    
    if (blogIndex === -1) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const blog = blogs[blogIndex];
    
    // Delete image file if it exists
    if (blog.image && blog.image.startsWith('/api/uploads/')) {
      const imagePath = path.join(uploadsDir, path.basename(blog.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted image file:', imagePath);
      }
    }
    
    blogs.splice(blogIndex, 1);
    saveBlogs(blogs);
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Error deleting blog' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
