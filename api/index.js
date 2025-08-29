const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Env
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

// Multer storage: memory on Vercel, disk locally
const uploadsDir = path.join(__dirname, 'uploads');
const storage = isProduction
  ? multer.memoryStorage()
  : multer.diskStorage({
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
if (!isProduction) {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/api/uploads', express.static(uploadsDir));
}

// Data storage: /tmp in prod, repo folder in dev
const dataDir = isProduction ? '/tmp/blog-data' : path.join(__dirname, 'data');
const adminFile = path.join(dataDir, 'admin.json');
const blogsFile = path.join(dataDir, 'blogs.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Helpers
function readJsonSafe(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJsonSafe(file, data) {
  try { fs.writeFileSync(file, JSON.stringify(data, null, 2)); } catch {}
}
function getAdmin() { return readJsonSafe(adminFile, initAdmin()); }
function saveAdmin(admin) { writeJsonSafe(adminFile, admin); }
function getBlogs() { return readJsonSafe(blogsFile, initBlogs()); }
function saveBlogs(blogs) { writeJsonSafe(blogsFile, blogs); }
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
    const token = jwt.sign({ username: admin.username }, 'your-secret-key', { expiresIn: '24h' });
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
    const decoded = jwt.verify(token, 'your-secret-key');
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
app.get('/api/blogs/admin/all', (req, res) => {
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
app.post('/api/blogs', upload.single('image'), async (req, res) => {
  try {
    const { title, description, content, tags, isPublished } = req.body || {};
    if (!title?.trim() || !description?.trim() || !content?.trim()) return res.status(400).json({ message: 'Title, description and content are required' });
    const blogs = getBlogs();
    let imageUrl = '';
    if (req.file) {
      if (isProduction) imageUrl = await uploadImageToExternal(req.file.buffer, req.file.originalname, req.file.mimetype);
      else imageUrl = `/api/uploads/${req.file.filename}`;
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
    blogs.unshift(newBlog);
    saveBlogs(blogs);
    res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
  } catch (error) {
    res.status(500).json({ message: 'Error creating blog', error: error.message });
  }
});

// Update blog
app.put('/api/blogs/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, content, tags, isPublished } = req.body || {};
    const blogs = getBlogs();
    const idx = blogs.findIndex(b => b._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Blog not found' });
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
      if (isProduction) updated.image = await uploadImageToExternal(req.file.buffer, req.file.originalname, req.file.mimetype);
      else {
        // clean old local image
        if (blogs[idx].image && blogs[idx].image.startsWith('/api/uploads/')) {
          const oldPath = path.join(uploadsDir, path.basename(blogs[idx].image));
          if (fs.existsSync(oldPath)) { try { fs.unlinkSync(oldPath); } catch {} }
        }
        updated.image = `/api/uploads/${req.file.filename}`;
      }
    }
    blogs[idx] = updated;
    saveBlogs(blogs);
    res.json({ message: 'Blog updated successfully', blog: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog', error: error.message });
  }
});

// Delete blog
app.delete('/api/blogs/:id', (req, res) => {
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

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server for Render deployment
const PORT = process.env.PORT || 10000;
if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Blog API ready at http://localhost:${PORT}/api`);
  });
}

// Export Vercel Serverless function handler
module.exports = app;
