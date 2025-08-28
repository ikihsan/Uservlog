const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Blog = require('../models/Blog');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

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

// GET all blogs (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = { isPublished: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-content'); // Exclude full content for list view

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
});

// GET single blog by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog || !blog.isPublished) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json(blog);

  } catch (error) {
    console.error('Get blog error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).json({ message: 'Server error while fetching blog' });
  }
});

// GET all blogs for admin (includes unpublished)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Blog.countDocuments();

    res.json({
      blogs,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });

  } catch (error) {
    console.error('Get admin blogs error:', error);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
});

// POST create new blog (admin only)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, content, tags, isPublished } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({ message: 'Title, description, and content are required' });
    }

    const blogData = {
      title,
      description,
      content,
      isPublished: isPublished === 'true' || isPublished === true,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };

    if (req.file) {
      blogData.image = `/uploads/${req.file.filename}`;
    }

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });

  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server error while creating blog' });
  }
});

// PUT update blog (admin only)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, content, tags, isPublished } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Update fields
    if (title) blog.title = title;
    if (description) blog.description = description;
    if (content) blog.content = content;
    if (typeof isPublished !== 'undefined') {
      blog.isPublished = isPublished === 'true' || isPublished === true;
    }
    if (tags) {
      blog.tags = tags.split(',').map(tag => tag.trim());
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (blog.image) {
        const oldImagePath = path.join(__dirname, '..', blog.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      blog.image = `/uploads/${req.file.filename}`;
    }

    await blog.save();

    res.json({
      message: 'Blog updated successfully',
      blog
    });

  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server error while updating blog' });
  }
});

// DELETE blog (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Delete associated image
    if (blog.image) {
      const imagePath = path.join(__dirname, '..', blog.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog deleted successfully' });

  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error while deleting blog' });
  }
});

module.exports = router;
