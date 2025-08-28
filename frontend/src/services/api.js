import axios from 'axios';

// Use relative /api by default (Vercel), allow override via REACT_APP_API_URL for local/dev
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (credentials) => 
    api.post('/auth/login', credentials),

  verifyToken: () => 
    api.get('/auth/verify'),

  validateToken: () => 
    api.get('/auth/verify'),
};

// Blog API functions (Admin)
export const blogAPI = {
  // Get all blogs (admin)
  getAllBlogs: (params = {}) => 
    api.get('/blogs/admin/all', { params }),

  // Get single blog by ID
  getBlogById: (id) => 
    api.get(`/blogs/${id}`),

  // Create new blog
  createBlog: (blogData) => {
    console.log('Creating blog with data:', {
      title: blogData.title,
      hasImage: !!blogData.image,
      imageLength: blogData.image ? blogData.image.length : 0,
      imageStart: blogData.image ? blogData.image.substring(0, 50) : 'no image'
    });
    return api.post('/blogs', blogData);
  },

  // Update blog
  updateBlog: (id, blogData) => 
    api.put(`/blogs/${id}`, blogData),

  // Delete blog
  deleteBlog: (id) => 
    api.delete(`/blogs/${id}`),
};

export default api;
