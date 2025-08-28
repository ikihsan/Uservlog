const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const { fileStorage } = require('../utils/fileStorage');

const router = express.Router();

// Try to load MongoDB model, fall back to file storage
let Blog;
try {
  Blog = require('../models/Blog');
} catch (error) {
  Blog = null;
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
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

// GET all blogs
router.get('/', async (req, res) => {
  try {
    let blogs;
    
    if (global.useFileStorage) {
      blogs = fileStorage.getBlogs().map(blog => ({
        ...blog,
        excerpt: blog.content ? blog.content.substring(0, 150) + '...' : ''
      }));
    } else {
      blogs = await Blog.find().sort({ createdAt: -1 });
    }

    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
});

// GET blog by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    let blog;
    const { identifier } = req.params;
    
    if (global.useFileStorage) {
      blog = fileStorage.getBlogById(identifier);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
    } else {
      // Try to find by ID first, then by slug
      blog = await Blog.findById(identifier) || await Blog.findOne({ slug: identifier });
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
    }

    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Server error while fetching blog' });
  }
});

// POST create new blog (protected)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const blogData = {
      title,
      content,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      image: req.file ? `/uploads/${req.file.filename}` : null,
      author: req.admin?.username || 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let savedBlog;
    
    if (global.useFileStorage) {
      savedBlog = fileStorage.createBlog(blogData);
    } else {
      const blog = new Blog(blogData);
      savedBlog = await blog.save();
    }

    res.status(201).json({
      message: 'Blog created successfully',
      blog: savedBlog
    });

  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Server error while creating blog' });
  }
});

// PUT update blog (protected)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const updateData = {
      title,
      content,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    let updatedBlog;
    
    if (global.useFileStorage) {
      updatedBlog = fileStorage.updateBlog(req.params.id, updateData);
      if (!updatedBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
    } else {
      updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!updatedBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
    }

    res.json({
      message: 'Blog updated successfully',
      blog: updatedBlog
    });

  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Server error while updating blog' });
  }
});

// DELETE blog (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    let deletedBlog;
    
    if (global.useFileStorage) {
      deletedBlog = fileStorage.deleteBlog(req.params.id);
      if (!deletedBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
    } else {
      deletedBlog = await Blog.findByIdAndDelete(req.params.id);
      if (!deletedBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
    }

    // Delete associated image file if it exists
    if (deletedBlog.image) {
      const imagePath = path.join(__dirname, '../uploads', path.basename(deletedBlog.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: 'Blog deleted successfully' });

  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Server error while deleting blog' });
  }
});

module.exports = router;
