const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import authentication middleware
const authMiddleware = require('./middleware/auth');

const app = express();

// Environment detection - Render, Vercel, or local
const isRender = !!process.env.RENDER;
const isVercel = !!process.env.VERCEL;
const isProduction = process.env.NODE_ENV === 'production' || isVercel;

console.log(`🚀 Starting Fathi.vlogs API`);
console.log(`📍 Environment: ${isRender ? 'Render' : isVercel ? 'Vercel' : 'Local'}`);

// Enhanced CORS configuration
app.use(cors({
  origin: isProduction 
    ? [
        'https://fathivlog.vercel.app',
        'https://fathi-vlogs.onrender.com',
        /\.vercel\.app$/,
        /\.onrender\.com$/
      ]
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for Render
if (isRender) {
  app.set('trust proxy', 1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: isRender ? 'render' : isVercel ? 'vercel' : 'local',
    uptime: process.uptime()
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Fathi.vlogs API is running',
    timestamp: new Date().toISOString()
  });
});

// Enhanced multer storage configuration
const uploadsDir = path.join(__dirname, 'uploads');
const storage = (isProduction && !isRender)
  ? multer.memoryStorage() // Memory for Vercel serverless
  : multer.diskStorage({   // Disk for Render and local
      destination: (req, file, cb) => {
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'blog-' + unique + path.extname(file.originalname));
      }
    });

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    file.mimetype && file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only image files are allowed!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Image upload to Cloudinary or base64 fallback
async function uploadImageToExternal(imageBuffer, originalName, mimeType) {
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const FormData = require('form-data');
      const axios = require('axios');
      const form = new FormData();
      form.append('file', imageBuffer, { filename: originalName, contentType: mimeType });
      form.append('upload_preset', 'ml_default');
      const url = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
      const { data } = await axios.post(url, form, { headers: form.getHeaders() });
      if (data?.secure_url) return data.secure_url;
      throw new Error('No secure_url from Cloudinary');
    }
    // Fallback: data URL
    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
  } catch (e) {
    // Final fallback
    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
  }
}

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve local uploads only in dev
// Static file serving for uploads (only in non-serverless environments)
if (!isVercel) {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/api/uploads', express.static(uploadsDir));
}

// Enhanced data storage configuration
const dataDir = isProduction && !isRender 
  ? '/tmp/blog-data'  // Vercel serverless
  : isRender 
    ? path.join(__dirname, '..', 'data')  // Render: relative to project root
    : path.join(__dirname, 'data');   // Local development

console.log(`💾 Data directory: ${dataDir}`);
console.log(`🌍 Environment: Render=${isRender}, Vercel=${isVercel}, Production=${isProduction}`);

// JWT Secret configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-please-change-in-production';
if (!process.env.JWT_SECRET && isProduction) {
  console.warn('⚠️  WARNING: Using default JWT secret in production. Set JWT_SECRET environment variable.');
}

// Initialize file paths first
const adminFile = path.join(dataDir, 'admin.json');
const blogsFile = path.join(dataDir, 'blogs.json');

// Initialize data files on startup
console.log(`🔧 Initializing data files...`);
const initialAdmin = getAdmin();
const initialBlogs = getBlogs();
console.log(`👤 Admin initialized: ${initialAdmin.username}`);
console.log(`📚 Blogs initialized: ${initialBlogs.length} blogs loaded`);

// Ensure data directory exists with proper error handling
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`✅ Created data directory: ${dataDir}`);
  } else {
    console.log(`📁 Data directory exists: ${dataDir}`);
  }
  
  // Test write permissions
  const testFile = path.join(dataDir, 'test.json');
  fs.writeFileSync(testFile, '{"test":true}');
  fs.unlinkSync(testFile);
  console.log(`✅ Data directory is writable`);
} catch (error) {
  console.error(`❌ Data directory error:`, error.message);
  console.error(`📍 Attempted path: ${dataDir}`);
}

// Enhanced file operations with logging
function readJsonSafe(file, fallback) {
  try {
    if (!fs.existsSync(file)) {
      console.log(`📄 File doesn't exist, creating: ${file}`);
      return fallback;
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`📖 Successfully read: ${path.basename(file)}`);
    return data;
  } catch (error) {
    console.error(`❌ Error reading ${path.basename(file)}:`, error.message);
    return fallback;
  }
}

function writeJsonSafe(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`💾 Successfully wrote: ${path.basename(file)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error writing ${path.basename(file)}:`, error.message);
    console.error(`📍 File path: ${file}`);
    console.error(`📁 Directory exists: ${fs.existsSync(path.dirname(file))}`);
    return false;
  }
}
function getAdmin() { return readJsonSafe(adminFile, initAdmin()); }
function saveAdmin(admin) { return writeJsonSafe(adminFile, admin); }
function getBlogs() { return readJsonSafe(blogsFile, initBlogs()); }
function saveBlogs(blogs) { return writeJsonSafe(blogsFile, blogs); }
function initAdmin() {
  const admin = { username: 'admin', password: bcrypt.hashSync('admin123', 10), lastLogin: null };
  writeJsonSafe(adminFile, admin);
  return admin;
}
function initBlogs() {
  const blogs = [
    {
      _id: '1',
      title: 'Welcome to Fathi.vlogs',
      description: 'My journey as an engineering student exploring the world of technology, coding, and innovation.',
      content: "Welcome to my personal blog! 👋\n\nI'm Fathima, an engineering student passionate about technology...",
      image: '',
      publishDate: new Date().toISOString(),
      isPublished: true,
      views: 42,
      tags: ['welcome', 'engineering', 'journey'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  writeJsonSafe(blogsFile, blogs);
  return blogs;
}

// Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Fathi.vlogs API is running',
    timestamp: new Date().toISOString(),
    environment: isProduction ? 'production' : 'development'
  });
});

// Auth
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
    const admin = getAdmin();
    if (username !== admin.username) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, admin.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
    admin.lastLogin = new Date().toISOString();
    saveAdmin(admin);
    res.json({ message: 'Login successful', token, user: { username: admin.username } });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.get('/api/auth/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Blogs (public)
app.get('/api/blogs', (req, res) => {
  try {
    const published = getBlogs().filter(b => b.isPublished);
    res.json(published);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching blogs' });
  }
});

// Single blog
app.get('/api/blogs/:id', (req, res) => {
  try {
    const blog = getBlogs().find(b => b._id === req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch {
    res.status(500).json({ message: 'Error fetching blog' });
  }
});

// Admin list with pagination
app.get('/api/blogs/admin/all', authMiddleware, (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const blogs = getBlogs();
    const start = (page - 1) * limit;
    const slice = blogs.slice(start, start + limit);
    res.json({ blogs: slice, totalBlogs: blogs.length, currentPage: page, totalPages: Math.ceil(blogs.length / limit) });
  } catch {
    res.status(500).json({ message: 'Error fetching blogs' });
  }
});

// Create blog
app.post('/api/blogs', authMiddleware, upload.single('image'), async (req, res) => {
  console.log(`🆕 Creating new blog...`);
  console.log(`📝 Request body:`, req.body);
  console.log(`🖼️ Image file:`, req.file ? 'Present' : 'None');
  
  try {
    const { title, description, content, tags, isPublished } = req.body || {};
    if (!title?.trim() || !description?.trim() || !content?.trim()) {
      console.log(`❌ Missing required fields`);
      return res.status(400).json({ message: 'Title, description and content are required' });
    }
    
    console.log(`📚 Loading existing blogs...`);
    const blogs = getBlogs();
    console.log(`📊 Current blog count: ${blogs.length}`);
    
    let imageUrl = '';
    if (req.file) {
      console.log(`🖼️ Processing image upload...`);
      if (isProduction) {
        imageUrl = await uploadImageToExternal(req.file.buffer, req.file.originalname, req.file.mimetype);
        console.log(`☁️ Image uploaded to external service: ${imageUrl}`);
      } else {
        imageUrl = `/api/uploads/${req.file.filename}`;
        console.log(`💾 Image saved locally: ${imageUrl}`);
      }
    }
    
    const newBlog = {
      _id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      isPublished: isPublished === 'true' || isPublished === true,
      views: 0,
      image: imageUrl,
      publishDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log(`📄 New blog created:`, { id: newBlog._id, title: newBlog.title, isPublished: newBlog.isPublished });
    
    blogs.unshift(newBlog);
    console.log(`💾 Saving blogs... Total count: ${blogs.length}`);
    
    const saveResult = saveBlogs(blogs);
    if (!saveResult) {
      console.error(`❌ Failed to save blogs to file`);
      return res.status(500).json({ message: 'Failed to save blog data' });
    }
    
    console.log(`✅ Blog created successfully: ${newBlog._id}`);
    res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
  } catch (error) {
    console.error(`❌ Error creating blog:`, error);
    res.status(500).json({ message: 'Error creating blog', error: error.message });
  }
});

// Update blog
app.put('/api/blogs/:id', authMiddleware, upload.single('image'), async (req, res) => {
  console.log(`✏️ Updating blog: ${req.params.id}`);
  console.log(`📝 Request body:`, req.body);
  console.log(`🖼️ Image file:`, req.file ? 'Present' : 'None');
  
  try {
    const { title, description, content, tags, isPublished } = req.body || {};
    console.log(`📚 Loading existing blogs...`);
    const blogs = getBlogs();
    const idx = blogs.findIndex(b => b._id === req.params.id);
    
    if (idx === -1) {
      console.log(`❌ Blog not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    console.log(`📄 Found blog at index ${idx}: ${blogs[idx].title}`);
    
    const updated = {
      ...blogs[idx],
      title: title?.trim() || blogs[idx].title,
      description: description?.trim() || blogs[idx].description,
      content: content?.trim() || blogs[idx].content,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : blogs[idx].tags,
      isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : blogs[idx].isPublished,
      updatedAt: new Date().toISOString()
    };
    
    if (req.file) {
      console.log(`🖼️ Processing image upload for update...`);
      if (isProduction) {
        updated.image = await uploadImageToExternal(req.file.buffer, req.file.originalname, req.file.mimetype);
        console.log(`☁️ Image uploaded to external service: ${updated.image}`);
      } else {
        // clean old local image
        if (blogs[idx].image && blogs[idx].image.startsWith('/api/uploads/')) {
          const oldPath = path.join(uploadsDir, path.basename(blogs[idx].image));
          if (fs.existsSync(oldPath)) { try { fs.unlinkSync(oldPath); } catch {} }
        }
        updated.image = `/api/uploads/${req.file.filename}`;
        console.log(`💾 Image saved locally: ${updated.image}`);
      }
    }
    
    console.log(`📝 Updated blog data:`, { id: updated._id, title: updated.title, isPublished: updated.isPublished });
    
    blogs[idx] = updated;
    console.log(`💾 Saving updated blogs... Total count: ${blogs.length}`);
    
    const saveResult = saveBlogs(blogs);
    if (!saveResult) {
      console.error(`❌ Failed to save updated blogs to file`);
      return res.status(500).json({ message: 'Failed to save blog data' });
    }
    
    console.log(`✅ Blog updated successfully: ${updated._id}`);
    res.json({ message: 'Blog updated successfully', blog: updated });
  } catch (error) {
    console.error(`❌ Error updating blog:`, error);
    res.status(500).json({ message: 'Error updating blog', error: error.message });
  }
});

// Delete blog
app.delete('/api/blogs/:id', authMiddleware, (req, res) => {
  try {
    const blogs = getBlogs();
    const idx = blogs.findIndex(b => b._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Blog not found' });
    const blog = blogs[idx];
    if (!isProduction && blog.image?.startsWith('/api/uploads/')) {
      const img = path.join(uploadsDir, path.basename(blog.image));
      if (fs.existsSync(img)) { try { fs.unlinkSync(img); } catch {} }
    }
    blogs.splice(idx, 1);
    saveBlogs(blogs);
    res.json({ message: 'Blog deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Error deleting blog' });
  }
});

// Serve static files from root directory (for Render deployment)
if (isRender || !isProduction) {
  const staticPath = isRender 
    ? path.join(__dirname, '..')  // Render: project root directory
    : path.join(__dirname, '..');  // Local root
  
  console.log(`🌐 Serving static files from: ${staticPath}`);
  
  // Serve static assets
  app.use('/static', express.static(path.join(staticPath, 'static')));
  app.use('/images', express.static(path.join(staticPath, 'images')));
  app.use('/favicon.ico', express.static(path.join(staticPath, 'favicon.ico')));
  app.use('/manifest.json', express.static(path.join(staticPath, 'manifest.json')));
  app.use('/robots.txt', express.static(path.join(staticPath, 'robots.txt')));
  
  // Serve index.html for all non-API routes (SPA fallback)
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend build not found. Please run build command.');
    }
  });
}

// Debug endpoint for testing authentication and file operations
app.post('/api/debug/test-save', authMiddleware, (req, res) => {
  console.log(`🧪 Debug: Testing file save operation`);
  try {
    const testData = { test: true, timestamp: new Date().toISOString() };
    const testFile = path.join(dataDir, 'debug-test.json');
    
    console.log(`📁 Data directory: ${dataDir}`);
    console.log(`📄 Test file path: ${testFile}`);
    console.log(`✅ Directory exists: ${fs.existsSync(dataDir)}`);
    
    const result = writeJsonSafe(testFile, testData);
    console.log(`💾 Write result: ${result}`);
    
    if (result && fs.existsSync(testFile)) {
      fs.unlinkSync(testFile); // cleanup
      console.log(`🧹 Test file cleaned up`);
      res.json({ 
        message: 'File operations working correctly',
        dataDir,
        testResult: 'SUCCESS',
        permissions: 'READ/WRITE OK'
      });
    } else {
      res.status(500).json({ 
        message: 'File write failed',
        dataDir,
        testResult: 'FAILED',
        permissions: 'WRITE ERROR'
      });
    }
  } catch (error) {
    console.error(`❌ Debug test error:`, error);
    res.status(500).json({ 
      message: 'Debug test failed',
      error: error.message,
      dataDir
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: isProduction ? 'Something went wrong' : err.message
  });
});

// Enhanced server startup for Render
const PORT = process.env.PORT || 10000;

if (isRender || (!isProduction && !isVercel)) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Fathi.vlogs server running on port ${PORT}`);
    console.log(`📝 API endpoint: http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
      console.log('✅ Server closed. Goodbye!');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

// Export Vercel Serverless function handler
module.exports = app;
