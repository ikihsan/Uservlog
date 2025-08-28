const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const { fileStorage, initializeData } = require('./utils/fileStorage');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'fathi.vlogs API is running!', 
    timestamp: new Date().toISOString(),
    database: global.useFileStorage ? 'File Storage' : 'MongoDB',
    status: 'healthy'
  });
});

// Connect to MongoDB or use file storage
const connectDatabase = async () => {
  // Always try MongoDB first if URI is provided
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== '') {
    try {
      console.log('🔄 Attempting to connect to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB successfully');
      global.useFileStorage = false;
      return true;
    } catch (error) {
      console.log('⚠️  MongoDB connection failed, falling back to file system storage');
      console.log('Error:', error.message);
    }
  }
  
  // Use file storage as fallback
  console.log('📁 Using file system storage');
  global.useFileStorage = true;
  initializeData();
  console.log('📝 File storage initialized with sample data');
  return true;
};

// Start server
connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 API endpoint: http://localhost:${PORT}/api`);
      if (global.useFileStorage) {
        console.log('💡 Note: Using file storage. Install and configure MongoDB for production use.');
      }
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
