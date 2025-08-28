const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
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
    message: 'UserBlog API is running!', 
    timestamp: new Date().toISOString(),
    database: process.env.MONGODB_URI ? 'MongoDB' : 'File System',
    status: 'healthy'
  });
});

// Database connection with fallback
const connectDatabase = async () => {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017/userblog') {
    // Try to connect to MongoDB
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB');
      return true;
    } catch (error) {
      console.log('⚠️  MongoDB connection failed, falling back to file system storage');
      console.log('Error:', error.message);
      return false;
    }
  } else {
    console.log('📁 Using file system storage (no MongoDB configured)');
    return false;
  }
};

// Start server
const startServer = async () => {
  const mongoConnected = await connectDatabase();
  
  if (!mongoConnected) {
    // Create data directory for file storage
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Initialize sample data if no blogs exist
    const blogsFile = path.join(dataDir, 'blogs.json');
    if (!fs.existsSync(blogsFile)) {
      const sampleBlogs = [
        {
          _id: '1',
          title: 'Welcome to UserBlog',
          description: 'Discover the amazing features of our modern blog platform with futuristic design.',
          content: 'Welcome to UserBlog, a cutting-edge blog platform designed with modern aesthetics and powerful functionality.\n\nOur platform features:\n\n• Beautiful dark theme with gradient effects\n• Responsive design that works on all devices\n• Powerful admin panel for content management\n• Secure authentication system\n• Image upload capabilities\n• Search and filtering features\n\nThis blog post demonstrates the rich content capabilities of our platform. You can create, edit, and manage your content through the intuitive admin interface.\n\nThank you for choosing UserBlog!',
          image: '',
          publishDate: new Date().toISOString(),
          isPublished: true,
          views: 42,
          tags: ['welcome', 'features', 'getting-started'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'The Future of Web Design',
          description: 'Exploring modern design trends including dark themes, gradients, and glass morphism effects.',
          content: 'The web design landscape is constantly evolving, and today we are witnessing some exciting trends that are reshaping how we interact with digital interfaces.\n\n## Dark Mode Revolution\n\nDark themes have become more than just a trend—they are now an essential feature. Users prefer dark interfaces because they:\n\n• Reduce eye strain in low-light conditions\n• Save battery life on OLED displays\n• Create a premium, modern aesthetic\n• Improve focus on content\n\n## Gradient Magic\n\nGradients are making a strong comeback in web design. They add depth, dimension, and visual interest to otherwise flat interfaces. The key is to use them subtly and purposefully.\n\n## Glass Morphism\n\nThis design trend creates elements that appear to be made of frosted glass, with subtle transparency and blur effects. It adds a sophisticated, modern touch to user interfaces.\n\n## Conclusion\n\nThese design trends, when combined thoughtfully, create engaging and visually appealing user experiences that feel both modern and timeless.',
          image: '',
          publishDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          isPublished: true,
          views: 28,
          tags: ['design', 'web-development', 'ui-ux', 'trends'],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: '3',
          title: 'Building Modern React Applications',
          description: 'A comprehensive guide to building scalable and performant React applications with modern tools.',
          content: 'React has revolutionized front-end development, and with the latest updates, building modern applications has never been more exciting.\n\n## React 18 Features\n\nThe latest version of React introduces several powerful features:\n\n• **Concurrent Features**: Better user experience with automatic batching\n• **Suspense**: Improved loading states and data fetching\n• **Strict Mode**: Enhanced development experience\n\n## Best Practices\n\n### Component Architecture\n\nStructure your components for reusability and maintainability:\n\n1. Keep components small and focused\n2. Use custom hooks for shared logic\n3. Implement proper prop types\n4. Follow naming conventions\n\n### State Management\n\nChoose the right state management solution:\n\n• **Local State**: For component-specific data\n• **Context API**: For app-wide state\n• **External Libraries**: For complex state logic\n\n### Performance Optimization\n\n• Use React.memo for expensive components\n• Implement lazy loading with React.lazy\n• Optimize bundle size with code splitting\n• Monitor performance with React DevTools\n\n## Conclusion\n\nBuilding modern React applications requires understanding these concepts and applying them thoughtfully. The ecosystem continues to evolve, bringing new opportunities for creating amazing user experiences.',
          image: '',
          publishDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          isPublished: true,
          views: 56,
          tags: ['react', 'javascript', 'frontend', 'development'],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      
      fs.writeFileSync(blogsFile, JSON.stringify(sampleBlogs, null, 2));
      console.log('📝 Created sample blog data');
    }
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 API endpoint: http://localhost:${PORT}/api`);
  });
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
