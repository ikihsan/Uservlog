const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Determine if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

// Configure multer for memory storage in production, disk storage in development
const storage = isProduction 
  ? multer.memoryStorage() // Store in memory for production (Vercel)
  : multer.diskStorage({   // Store on disk for development
      destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
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

// Function to upload image to external service or fallback to base64
async function uploadImageToExternal(imageBuffer, originalName, mimeType) {
  try {
    // Option 1: Cloudinary (recommended for production)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      console.log('Uploading to Cloudinary...');
      return await uploadToCloudinary(imageBuffer, originalName, mimeType);
    }
    
    // Option 2: Fallback to base64 (works everywhere but larger file sizes)
    console.log('Using base64 fallback for image storage');
    const base64 = imageBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Image processing failed:', error.message);
    // Emergency fallback
    const base64 = imageBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }
}

// Cloudinary upload function (optional - requires credentials)
async function uploadToCloudinary(imageBuffer, originalName, mimeType) {
  try {
    const FormData = require('form-data');
    const axios = require('axios');
    
    const form = new FormData();
    form.append('file', imageBuffer, {
      filename: originalName,
      contentType: mimeType,
    });
    form.append('upload_preset', 'ml_default'); // or create a custom preset
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );

    if (response.data && response.data.secure_url) {
      console.log('Image uploaded to Cloudinary:', response.data.secure_url);
      return response.data.secure_url;
    } else {
      throw new Error('Failed to get image URL from Cloudinary');
    }
  } catch (error) {
    console.error('Cloudinary upload failed:', error.message);
    throw error; // Let the main function handle fallback
  }
}

// CORS configuration - allow all origins for testing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static images (for development only)
if (!isProduction) {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/api/uploads', express.static(uploadsDir));
}

// Data file paths
const dataDir = path.join(__dirname, 'data');
const blogsFile = path.join(dataDir, 'blogs.json');
const adminFile = path.join(dataDir, 'admin.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize blogs.json if it doesn't exist
if (!fs.existsSync(blogsFile)) {
  const initialBlogs = [
    {
      _id: '1',
      title: 'Welcome to Fathi.vlogs',
      description: 'My journey as a blogger and content creator',
      content: 'Welcome to my personal blog! Here I share my thoughts, experiences, and insights about technology, life, and everything in between. This is my first blog post, and I\'m excited to share my journey with you.',
      image: '',
      publishDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true,
      views: 15,
      tags: ['personal', 'welcome', 'introduction']
    }
  ];
  fs.writeFileSync(blogsFile, JSON.stringify(initialBlogs, null, 2));
}

// Initialize admin.json if it doesn't exist
if (!fs.existsSync(adminFile)) {
  const adminData = {
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    lastLogin: null
  };
  fs.writeFileSync(adminFile, JSON.stringify(adminData, null, 2));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fathi.vlogs API is running',
    timestamp: new Date().toISOString(),
    environment: isProduction ? 'production' : 'development',
    cloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  });
});

// Auth login
app.post('/api/auth/login', (req, res) => {
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

// Get blogs (public)
app.get('/api/blogs', (req, res) => {
  try {
    console.log('GET /api/blogs called');
    const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf8'));
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

// Get single blog
app.get('/api/blogs/:id', (req, res) => {
  try {
    const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf8'));
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
app.post('/api/blogs', upload.single('image'), async (req, res) => {
  try {
    console.log('Create blog request body keys:', Object.keys(req.body));
    console.log('Environment:', { isProduction, vercel: !!process.env.VERCEL });
    console.log('Uploaded file:', req.file ? {
      filename: req.file.filename || 'memory-stored',
      originalname: req.file.originalname,
      size: req.file.size,
      hasBuffer: !!req.file.buffer
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
    
    const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf8'));
    
    // Handle image upload based on environment
    let imageUrl = '';
    if (req.file) {
      if (isProduction) {
        // Production: Upload to external service
        console.log('Production mode: Processing image...');
        imageUrl = await uploadImageToExternal(req.file.buffer, req.file.originalname, req.file.mimetype);
        console.log('Image processed, URL:', imageUrl);
      } else {
        // Development: Use local file path
        console.log('Development mode: Using local file path');
        imageUrl = `/api/uploads/${req.file.filename}`;
        console.log('Local image URL:', imageUrl);
      }
    }
    
    const newBlog = {
      _id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      isPublished: isPublished === 'true' || isPublished === true,
      views: 0,
      image: imageUrl,
      publishDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    blogs.unshift(newBlog);
    fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2));
    
    console.log('Blog created successfully with image URL:', imageUrl);
    res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Error creating blog', error: error.message });
  }
});

// Update blog
app.put('/api/blogs/:id', upload.single('image'), async (req, res) => {
  try {
    console.log('Update blog request body keys:', Object.keys(req.body));
    console.log('Uploaded file:', req.file ? {
      filename: req.file.filename || 'memory-stored',
      originalname: req.file.originalname,
      size: req.file.size,
      hasBuffer: !!req.file.buffer
    } : 'No file uploaded');
    
    const { title, description, content, tags, isPublished } = req.body;
    const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf8'));
    const blogIndex = blogs.findIndex(b => b._id === req.params.id);
    
    if (blogIndex === -1) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const updatedBlog = {
      ...blogs[blogIndex],
      title: title || blogs[blogIndex].title,
      description: description || blogs[blogIndex].description,
      content: content || blogs[blogIndex].content,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : blogs[blogIndex].tags,
      isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : blogs[blogIndex].isPublished,
      updatedAt: new Date().toISOString()
    };
    
    // Update image if new file was provided
    if (req.file) {
      if (isProduction) {
        // Production: Upload to external service
        console.log('Production mode: Processing new image...');
        updatedBlog.image = await uploadImageToExternal(req.file.buffer, req.file.originalname, req.file.mimetype);
        console.log('Image processed, URL:', updatedBlog.image);
      } else {
        // Development: Delete old image file if it exists and is local
        if (blogs[blogIndex].image && blogs[blogIndex].image.startsWith('/api/uploads/')) {
          const uploadsDir = path.join(__dirname, 'uploads');
          const oldImagePath = path.join(uploadsDir, path.basename(blogs[blogIndex].image));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('Deleted old image:', oldImagePath);
          }
        }
        updatedBlog.image = `/api/uploads/${req.file.filename}`;
      }
    }
    
    blogs[blogIndex] = updatedBlog;
    fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2));
    
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
    const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf8'));
    const blogIndex = blogs.findIndex(b => b._id === req.params.id);
    
    if (blogIndex === -1) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Delete image file if it exists and is local (development mode)
    if (!isProduction && blogs[blogIndex].image && blogs[blogIndex].image.startsWith('/api/uploads/')) {
      const uploadsDir = path.join(__dirname, 'uploads');
      const imagePath = path.join(uploadsDir, path.basename(blogs[blogIndex].image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted image:', imagePath);
      }
    }
    
    blogs.splice(blogIndex, 1);
    fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2));
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Error deleting blog', error: error.message });
  }
});

// Get all blogs for admin (includes unpublished)
app.get('/api/blogs/admin/all', (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf8'));
    
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

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
