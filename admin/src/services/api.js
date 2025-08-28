import axios from 'axios';

// Use relative /api by default (works on Vercel); override with REACT_APP_API_URL locally if needed
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
  createBlog: (formData) => 
    api.post('/blogs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Update blog
  updateBlog: (id, formData) => 
    api.put(`/blogs/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Delete blog
  deleteBlog: (id) => 
    api.delete(`/blogs/${id}`),
};

export default api;
