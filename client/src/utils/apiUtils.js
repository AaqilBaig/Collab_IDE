/**
 * API utility functions for making HTTP requests
 */
import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  // If no REACT_APP_API_URL is provided, use relative URLs (which work with the proxy in package.json)
  // If running in development mode, we can explicitly set the URL to the backend server
  baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : ''),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  // Helper method to explicitly set token on the API instance
  setToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }
};

// Project API calls
export const projectAPI = {
  getAllProjects: () => api.get('/api/projects'),
  getProject: (id) => api.get(`/api/projects/${id}`),
  createProject: (projectData) => api.post('/api/projects', projectData),
  updateProject: (id, projectData) => api.put(`/api/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/api/projects/${id}`),
  
  // Collaborator management
  addCollaborator: (projectId, userData) => api.post(`/api/projects/${projectId}/collaborators`, userData),
  removeCollaborator: (projectId, userId) => api.delete(`/api/projects/${projectId}/collaborators/${userId}`),
  
  // Version management
  getVersions: (projectId) => api.get(`/api/projects/${projectId}/versions`),
  getVersion: (projectId, versionNumber) => api.get(`/api/projects/${projectId}/versions/${versionNumber}`)
};

const apiUtils = {
  authAPI,
  projectAPI
};

export default apiUtils;
