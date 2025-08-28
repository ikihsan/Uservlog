const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const blogsFile = path.join(dataDir, 'blogs.json');
const adminFile = path.join(dataDir, 'admin.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize sample data
const initializeData = () => {
  // Initialize blogs
  if (!fs.existsSync(blogsFile)) {
    const sampleBlogs = [
      {
        _id: '1',
        title: 'Welcome to My Engineering Journey',
        description: 'Starting my blog to share experiences, learnings, and thoughts as an engineering student.',
        content: 'Hello and welcome to fathi.vlogs! 👋\n\nI\'m Fathima NK, a 22-year-old engineering student at KMCT College of Engineering, and this is where I share my journey through the fascinating world of technology and personal growth.\n\n## Why This Blog?\n\nAs an engineering student, I believe in the power of sharing knowledge and experiences. This blog serves as:\n\n• A digital diary of my learning journey\n• A platform to share interesting projects and discoveries\n• A space to connect with fellow learners and tech enthusiasts\n• A way to document challenges and how I overcome them\n\n## What You Can Expect\n\nFrom coding adventures to college life, from technical tutorials to personal reflections - this blog will cover it all. I believe that every small step in learning is worth celebrating and sharing.\n\n## Let\'s Grow Together\n\n"The journey of a thousand miles begins with one step" - and this blog is my first step into sharing my engineering journey with the world.\n\nThank you for being here! 🚀',
        image: '',
        publishDate: new Date().toISOString(),
        isPublished: true,
        views: 42,
        tags: ['welcome', 'engineering', 'journey', 'student-life'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'My First Semester Learnings',
        description: 'Reflecting on the challenges and discoveries from my first semester in engineering college.',
        content: 'First semester is officially over, and what a journey it has been! 📚\n\n## The Reality Check\n\nComing into engineering, I thought I knew what to expect. But college life brought its own set of surprises:\n\n• **Time Management**: Balancing lectures, assignments, and personal time\n• **New Concepts**: From basic programming to advanced mathematics\n• **Social Connections**: Meeting amazing classmates and professors\n• **Independence**: Learning to navigate college life\n\n## Key Takeaways\n\n### 1. Consistency Over Cramming\nDaily practice beats last-minute preparation every time.\n\n### 2. Ask Questions\nNo question is too basic when you\'re learning something new.\n\n### 3. Collaborate\nStudying with friends makes complex topics easier to understand.\n\n### 4. Take Breaks\nRest is just as important as study time.\n\n## Looking Forward\n\nExcited for the upcoming semester and all the new challenges it will bring. Here\'s to continuous learning and growth! 🚀',
        image: '',
        publishDate: new Date(Date.now() - 86400000).toISOString(),
        isPublished: true,
        views: 28,
        tags: ['college', 'learning', 'reflection', 'engineering'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: '3',
        title: 'Building My First Web Application',
        description: 'The exciting journey of creating my first full-stack web application - this very blog!',
        content: 'Creating this blog has been an incredible learning experience! 💻\n\n## The Vision\n\nI wanted a space where I could:\n• Share my engineering journey\n• Document my learning process\n• Connect with fellow students and developers\n• Practice my web development skills\n\n## Technology Stack\n\n### Frontend\n- **React**: For building the user interface\n- **CSS3**: For the dark, futuristic design\n- **Responsive Design**: Mobile-first approach\n\n### Backend\n- **Node.js & Express**: Server-side logic\n- **File Storage**: Simple yet effective data management\n- **JWT**: For secure authentication\n\n## Challenges & Solutions\n\n### Challenge 1: Design\n**Problem**: Creating a modern, engaging UI\n**Solution**: Embraced dark themes with gradient accents and smooth animations\n\n### Challenge 2: Mobile Responsiveness\n**Problem**: Making navigation work on all devices\n**Solution**: Implemented a hamburger menu with smooth transitions\n\n### Challenge 3: Deployment\n**Problem**: Getting the app live on the internet\n**Solution**: Used Vercel for seamless deployment\n\n## Lessons Learned\n\n1. **Start Simple**: Begin with core features and iterate\n2. **User Experience Matters**: Good design makes all the difference\n3. **Documentation is Key**: Write code like someone else will read it\n4. **Testing is Essential**: Always test on multiple devices\n\n## What\'s Next?\n\nThis is just the beginning! I plan to add more features like:\n- Comment system\n- Email subscriptions\n- Advanced search\n- Analytics dashboard\n\nBuilding this blog taught me that the best way to learn is by doing. Every error message was a lesson, every successful deployment was a victory! 🎉\n\n*Have questions about the technical implementation? Feel free to reach out!*',
        image: '',
        publishDate: new Date(Date.now() - 172800000).toISOString(),
        isPublished: true,
        views: 56,
        tags: ['web-development', 'react', 'node.js', 'project'],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    
    fs.writeFileSync(blogsFile, JSON.stringify(sampleBlogs, null, 2));
  }

  // Initialize admin
  if (!fs.existsSync(adminFile)) {
    const bcrypt = require('bcryptjs');
    const adminData = {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10),
      lastLogin: null
    };
    fs.writeFileSync(adminFile, JSON.stringify(adminData, null, 2));
  }
};

// File storage operations
const fileStorage = {
  // Blog operations
  getAllBlogs: () => {
    const data = fs.readFileSync(blogsFile, 'utf8');
    return JSON.parse(data);
  },

  getBlogById: (id) => {
    const blogs = fileStorage.getAllBlogs();
    return blogs.find(blog => blog._id === id);
  },

  createBlog: (blogData) => {
    const blogs = fileStorage.getAllBlogs();
    const newBlog = {
      ...blogData,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0
    };
    blogs.push(newBlog);
    fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2));
    return newBlog;
  },

  updateBlog: (id, updateData) => {
    const blogs = fileStorage.getAllBlogs();
    const index = blogs.findIndex(blog => blog._id === id);
    if (index !== -1) {
      blogs[index] = { ...blogs[index], ...updateData, updatedAt: new Date().toISOString() };
      fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2));
      return blogs[index];
    }
    return null;
  },

  deleteBlog: (id) => {
    const blogs = fileStorage.getAllBlogs();
    const filteredBlogs = blogs.filter(blog => blog._id !== id);
    fs.writeFileSync(blogsFile, JSON.stringify(filteredBlogs, null, 2));
    return true;
  },

  incrementViews: (id) => {
    const blogs = fileStorage.getAllBlogs();
    const blog = blogs.find(blog => blog._id === id);
    if (blog) {
      blog.views = (blog.views || 0) + 1;
      fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2));
    }
  },

  // Admin operations
  getAdmin: () => {
    const data = fs.readFileSync(adminFile, 'utf8');
    return JSON.parse(data);
  },

  updateAdminLastLogin: () => {
    const admin = fileStorage.getAdmin();
    admin.lastLogin = new Date().toISOString();
    fs.writeFileSync(adminFile, JSON.stringify(admin, null, 2));
  }
};

module.exports = { fileStorage, initializeData };
