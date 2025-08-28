const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { fileStorage } = require('../utils/fileStorage');

const router = express.Router();

// Try to load MongoDB models, fall back to file storage
let Admin;
try {
  Admin = require('../models/Admin');
} catch (error) {
  Admin = null;
}

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    let admin;
    let isValidPassword = false;

    if (global.useFileStorage) {
      // Use file storage
      admin = fileStorage.getAdmin();
      isValidPassword = await bcrypt.compare(password, admin.password);
      
      if (username !== admin.username || !isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login
      fileStorage.updateAdminLastLogin();
    } else {
      // Use MongoDB
      admin = await Admin.findOne({ username });
      
      if (!admin) {
        admin = new Admin({
          username: process.env.ADMIN_USERNAME || 'admin',
          password: process.env.ADMIN_PASSWORD || 'admin123'
        });
        await admin.save();
      }

      isValidPassword = await admin.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      admin.lastLogin = new Date();
      await admin.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id || admin.username, 
        username: admin.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id || admin.username,
        username: admin.username,
        lastLogin: admin.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let admin;
    if (global.useFileStorage) {
      admin = fileStorage.getAdmin();
      if (decoded.username !== admin.username) {
        return res.status(401).json({ message: 'Admin not found' });
      }
    } else {
      admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }
    }

    res.json({ 
      valid: true, 
      admin: {
        id: admin._id || admin.username,
        username: admin.username,
        lastLogin: admin.lastLogin
      }
    });

  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
