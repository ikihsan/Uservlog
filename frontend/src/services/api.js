import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || '/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for serverless functions
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
      // Redirect to login if needed
    }
    return Promise.reject(error);
  }
);

// Blog API functions
export const blogAPI = {
  // Get all blogs (public)
  getAllBlogs: (params = {}) => 
    api.get('/blogs', { params }),

  // Get single blog by ID (public)
  getBlogById: (id) => 
    api.get(`/blogs/${id}`),

  // Search blogs
  searchBlogs: (searchTerm, page = 1) => 
    api.get('/blogs', { params: { search: searchTerm, page } }),
};

// Contact API functions
export const contactAPI = {
  // Send contact form
  sendMessage: (data) => 
    api.post('/contact', data),
};

export default api;
