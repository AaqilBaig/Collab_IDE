import React, { createContext, useReducer, useCallback } from 'react';
import axios from 'axios';
import projectReducer from '../reducers/projectReducer';

// Create context
export const ProjectContext = createContext();

// Initial state
const initialState = {
  projects: [],
  currentProject: null,
  loading: true,
  error: null,
  currentCollaborators: []
};

// Project provider component
export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
    // Get all projects
  const getProjects = async () => {
    try {
      console.log('ProjectContext: Starting to fetch projects...');
      dispatch({ type: 'SET_LOADING' });
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('ProjectContext: No authentication token found');
        dispatch({
          type: 'PROJECT_ERROR',
          payload: 'Authentication required. Please login.'
        });
        return [];
      }
      
      console.log('ProjectContext: Fetching projects with token:', token.substring(0, 10) + '...');
      console.log('ProjectContext: Making request to http://localhost:5000/api/projects');
      
      // Use direct URL with explicit Authorization header
      console.log('ProjectContext: Starting API request...');
      const res = await axios.get('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('ProjectContext: API request completed');
      console.log('ProjectContext: Projects API response:', {
        status: res.status,
        success: res.data.success,
        count: res.data.count || 0,
        data: res.data.data ? 'Data received' : 'No data received'
      });
      
      if (Array.isArray(res.data.data)) {
        dispatch({
          type: 'GET_PROJECTS',
          payload: res.data.data
        });
        return res.data.data;
      } else {
        console.error('ProjectContext: Unexpected data format:', res.data);
        dispatch({
          type: 'GET_PROJECTS', // Default to empty array to prevent loading state
          payload: []
        });
        dispatch({
          type: 'PROJECT_ERROR',
          payload: 'Invalid data format received from server'
        });
        return [];
      }
    } catch (err) {
      console.error('ProjectContext: Error fetching projects:', err.message);
      
      // Check for network error
      if (!err.response) {
        console.error('ProjectContext: Network error - no response from server');
        dispatch({
          type: 'PROJECT_ERROR',
          payload: 'Network error. Please check your connection.'
        });
      }
      // Handle unauthorized errors specially
      else if (err.response?.status === 401) {
        localStorage.removeItem('token'); // Clear invalid token
        dispatch({
          type: 'PROJECT_ERROR',
          payload: 'Your session has expired. Please login again.'
        });
      } 
      // Handle rate limiting errors
      else if (err.response?.status === 429) {
        console.warn('ProjectContext: Rate limit hit. Too many requests.');
        dispatch({
          type: 'PROJECT_ERROR',
          payload: 'Too many requests. Please wait a moment before trying again.'
        });
        
        // Wait 2 seconds and retry automatically to recover from rate limiting
        setTimeout(() => {
          console.log('ProjectContext: Automatically retrying after rate limit cooldown');
          dispatch({ type: 'CLEAR_ERRORS' });
        }, 2000);
      }
      else {
        dispatch({
          type: 'PROJECT_ERROR',
          payload: err.response?.data?.message || 'Error fetching projects'
        });
      }
      
      // Always ensure projects is set to prevent infinite loading state
      dispatch({
        type: 'GET_PROJECTS',
        payload: []
      });
      
      return [];
    }  };
  // Get a single project
  const getProject = useCallback(async (id) => {
    try {
      // Check if we already have this project loaded to prevent unnecessary fetches
      if (state.currentProject && state.currentProject._id === id && !state.loading) {
        console.log(`Project ${id} already loaded, skipping fetch`);
        return;
      }

      dispatch({ type: 'SET_LOADING' });
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        dispatch({
          type: 'PROJECT_ERROR',
          payload: 'Authentication required. Please login.'
        });
        return;
      }
      
      // Use direct URL with explicit Authorization header
      const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        timeout: 10000 // 10 second timeout
      });

      dispatch({
        type: 'GET_PROJECT',
        payload: res.data.data
      });
    } catch (err) {
      console.error(`Error fetching project ${id}:`, err);
      console.error('Error response:', err.response?.data);
        dispatch({
        type: 'PROJECT_ERROR',
        payload: err.response?.data?.message || 'Error fetching project'
      });
    }
  }, [state.currentProject, state.loading]);

  // Create a new project
  const createProject = async (projectData) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        dispatch({
          type: 'PROJECT_ERROR',
          payload: 'Authentication required. Please login.'
        });
        return null;
      }
      
      console.log('Creating project:', projectData);
      
      // Use direct URL with explicit Authorization header
      const res = await axios.post('http://localhost:5000/api/projects', projectData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Project created successfully:', res.data);

      dispatch({
        type: 'CREATE_PROJECT',
        payload: res.data.data
      });

      return res.data.data;
    } catch (err) {
      console.error('Error creating project:', err);
      console.error('Error response:', err.response?.data);
      
      dispatch({
        type: 'PROJECT_ERROR',
        payload: err.response?.data?.message || 'Error creating project'
      });
      return null;
    }
  };

  // Update project
  const updateProject = async (id, projectData) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        dispatch({
          type: 'PROJECT_ERROR',
          payload: 'Authentication required. Please login.'
        });
        return;
      }
      
      // Use direct URL with explicit Authorization header
      const res = await axios.put(`http://localhost:5000/api/projects/${id}`, projectData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Project updated successfully:', res.data);

      dispatch({
        type: 'UPDATE_PROJECT',
        payload: res.data.data
      });
      
      return res.data.data;
    } catch (err) {
      console.error('Error updating project:', err);
      console.error('Error response:', err.response?.data);
      
      dispatch({
        type: 'PROJECT_ERROR',
        payload: err.response?.data?.message || 'Error updating project'
      });
      return null;
    }
  };

  // Delete project
  const deleteProject = async (id) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        dispatch({
          type: 'PROJECT_ERROR',
          payload: 'Authentication required. Please login.'
        });
        return;
      }
      
      // Use direct URL with explicit Authorization header
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Project deleted successfully');

      dispatch({
        type: 'DELETE_PROJECT',
        payload: id
      });
    } catch (err) {
      console.error('Error deleting project:', err);
      console.error('Error response:', err.response?.data);
      
      dispatch({
        type: 'PROJECT_ERROR',
        payload: err.response?.data?.message || 'Error deleting project'
      });
    }
  };
  // Add collaborator
  const addCollaborator = async (projectId, email, role = 'editor') => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        dispatch({
          type: 'PROJECT_ERROR',
          payload: 'Authentication required. Please login.'
        });
        return;
      }

      // First, find user by email
      console.log('Looking up user by email:', email);
      const userResponse = await axios.get(`http://localhost:5000/api/users/search?email=${email}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!userResponse.data.data) {
        throw new Error('User not found with that email address');
      }

      const userId = userResponse.data.data._id;
      console.log('Found user ID:', userId);

      // Then add as collaborator
      const res = await axios.post(`http://localhost:5000/api/projects/${projectId}/collaborators`, 
        { userId, role },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Collaborator added successfully:', res.data);

      dispatch({
        type: 'UPDATE_PROJECT',
        payload: res.data.data
      });
      
      return res.data.data;
    } catch (err) {
      console.error('Error adding collaborator:', err);
      console.error('Error response:', err.response?.data);
      
      dispatch({
        type: 'PROJECT_ERROR',
        payload: err.response?.data?.message || err.message || 'Error adding collaborator'
      });
    }
  };
  // Remove collaborator
  const removeCollaborator = async (projectId, userId) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        dispatch({
          type: 'PROJECT_ERROR',
          payload: 'Authentication required. Please login.'
        });
        return;
      }
      
      // Use direct URL with explicit Authorization header
      const res = await axios.delete(`http://localhost:5000/api/projects/${projectId}/collaborators/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Collaborator removed successfully:', res.data);

      dispatch({
        type: 'UPDATE_PROJECT',
        payload: res.data.data
      });
      
      return res.data.data;
    } catch (err) {
      console.error('Error removing collaborator:', err);
      console.error('Error response:', err.response?.data);
      
      dispatch({
        type: 'PROJECT_ERROR',
        payload: err.response?.data?.message || 'Error removing collaborator'
      });
    }
  };
  // Update code content locally (for real-time editing)
  const updateCodeContent = useCallback((content) => {
    dispatch({
      type: 'UPDATE_CODE_CONTENT',
      payload: content
    });
  }, []);

  // Clear errors
  const clearErrors = () => dispatch({ type: 'CLEAR_ERRORS' });

  return (
    <ProjectContext.Provider
      value={{
        projects: state.projects,
        currentProject: state.currentProject,
        loading: state.loading,
        error: state.error,
        currentCollaborators: state.currentCollaborators,
        getProjects,
        getProject,
        createProject,
        updateProject,
        deleteProject,
        addCollaborator,
        removeCollaborator,
        updateCodeContent,
        clearErrors
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
