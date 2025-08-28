# UserBlog Web Application

# Fathi.vlogs - Personal Engineering Blog

Welcome to **Fathi.vlogs**, a personal blog platform where I share my journey as an engineering student, web development projects, and technical insights. Built with modern web technologies and a futuristic dark theme design.

## ✨ Features
- 🎨 **Modern Dark Theme** - Futuristic design with gradient text and glowing buttons
- 📝 **Blog Management** - Full CRUD operations for blog posts
- 👨‍💼 **Admin Panel** - Dedicated admin interface for content management
- 🔐 **Authentication** - Secure JWT-based admin authentication
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- 🚀 **Real-time Updates** - Live blog updates across the platform
- 📸 **Image Upload** - Support for blog featured images
- 🏷️ **Tagging System** - Organize blogs with tags
- 🔍 **Search & Filter** - Search blogs by title, description, or tags

## 🛠 Tech Stack
- **Frontend**: React 18, CSS3, React Router DOM
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer for image handling
- **Database**: MongoDB with Mongoose ODM

## 📁 Project Structure
```
├── backend/          # Node.js + Express API server
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API routes
│   ├── middleware/   # Authentication middleware
│   └── uploads/      # Uploaded images storage
├── frontend/         # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
├── admin/           # Admin panel React application
│   └── src/
│       ├── components/  # Admin components
│       └── services/    # Admin API services
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd fathi-vlogs

# Install dependencies for all components
npm run install-all
# OR manually:
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fathi-vlogs
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB installation
mongod

# Or use MongoDB Atlas connection string in .env
```

### 4. Run the Applications

#### Option A: Using VS Code Tasks
1. Open the project in VS Code
2. Use `Ctrl+Shift+P` and run "Tasks: Run Task"
3. Select and run:
   - "Start Backend Server"
   - "Start Frontend" 
   - "Start Admin Panel"

#### Option B: Manual Startup
```bash
# Terminal 1 - Backend (Port 5000)
cd backend
npm start

# Terminal 2 - Frontend (Port 3001)
cd frontend
npm start

# Terminal 3 - Admin Panel (Port 3002)
cd admin
npm start
```

### 5. Access the Applications
- **Frontend**: http://localhost:3001
- **Admin Panel**: http://localhost:3002
- **Backend API**: http://localhost:5000

## 🔑 Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

## 📊 API Endpoints

### Public Endpoints
- `GET /api/blogs` - Get all published blogs
- `GET /api/blogs/:id` - Get single blog by ID
- `GET /api/health` - Health check

### Admin Endpoints (Requires Authentication)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token
- `GET /api/blogs/admin/all` - Get all blogs (including drafts)
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

## 🎨 Design Features
- **Gradient Text Effects** - Beautiful color transitions
- **Glowing Buttons** - Interactive hover effects
- **Animated Background** - Subtle floating animations
- **Glass Morphism** - Modern frosted glass effect cards
- **Responsive Grid** - Adaptive layouts for all screen sizes
- **Dark Theme** - Easy on the eyes futuristic design

## 📱 Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Development

### Adding New Features
1. Backend: Add routes in `/backend/routes/`
2. Frontend: Add components in `/frontend/src/components/`
3. Admin: Add admin features in `/admin/src/components/`

### Database Schema
```javascript
// Blog Schema
{
  title: String (required, max 200 chars)
  description: String (required, max 1000 chars)
  content: String (required)
  image: String (file path)
  publishDate: Date (default: now)
  isPublished: Boolean (default: true)
  views: Number (default: 0)
  tags: [String]
  createdAt: Date
  updatedAt: Date
}
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables
2. Ensure MongoDB is accessible
3. Run `npm start` in production

### Frontend Deployment
1. Run `npm run build`
2. Serve the `build` folder
3. Update API endpoints in production

### Admin Panel Deployment
1. Run `npm run build`
2. Deploy on separate subdomain/path
3. Secure admin access

## 🛡️ Security Features
- JWT-based authentication
- Password hashing with bcryptjs
- File upload validation
- CORS protection
- Input sanitization
- Environment variable protection

## 📄 License
This project is licensed under the MIT License.

## 👨‍💻 Built by ikcodes
Created with ❤️ by **ikcodes** - A modern, full-stack blog platform with stunning design and seamless functionality.

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection Error**: Ensure MongoDB is running
2. **Port Already in Use**: The applications will prompt to use different ports
3. **Image Upload Issues**: Check file permissions in `/backend/uploads/`
4. **CORS Errors**: Verify API URLs in frontend services

### Support
For issues and support, please check the troubleshooting guide or contact the development team.

---

**Note**: This application is designed for development and demonstration purposes. For production use, implement additional security measures and optimizations.
