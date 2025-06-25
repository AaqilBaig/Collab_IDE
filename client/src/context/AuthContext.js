import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import authReducer from '../reducers/authReducer';
import { authAPI } from '../utils/apiUtils';

// Create context
export const AuthContext = createContext();

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);  // Load user on initial mount
  useEffect(() => {
    // Check for token in storage
    const token = localStorage.getItem('token');
    console.log('AuthContext Initial Check: Token exists?', !!token);
    
    if (token) {
      // Set token to axios headers
      setAuthToken(token);
      
      console.log('AuthContext: Attempting to load user with stored token');
      // Make a direct call to the backend
      axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 30000 // Extended to 30 second timeout
      })
        .then(res => {
          console.log('AuthContext: User loaded successfully from stored token', res.data.data);
          dispatch({
            type: 'USER_LOADED',
            payload: res.data.data
          });
        })
        .catch(err => {
          console.error('AuthContext: Load user from storage error:', err.message);
          
          // Check if the token might be invalid
          if (err.response && err.response.status === 401) {
            console.log('AuthContext: Token invalid, removing from storage');
            localStorage.removeItem('token');
          }
          
          dispatch({ type: 'USER_LOADED_FAIL' });
        });
    } else {
      console.log('AuthContext: No token in storage, considering as not authenticated');
      dispatch({ type: 'USER_LOADED_FAIL' });
    }
    // No dependencies needed as this only runs on initial mount
  }, []);  
  
  const loadUser = async () => {
    console.log('AuthContext: Attempting to load user data');
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('AuthContext: No token available for loadUser');
      dispatch({ type: 'USER_LOADED_FAIL' });
      return null;
    }
    
    // Set token in global header
    setAuthToken(token);

    try {
      console.log('AuthContext: Fetching user data from API');
      // Use direct URL to the backend server with enhanced configuration
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 30000 // Extended to 30 second timeout
      });
      
      console.log('AuthContext: User data loaded successfully', res.data.data);
      
      // Ensure both id and _id properties are available in the user object
      const userData = res.data.data;
      const enhancedUserData = {
        ...userData,
        id: userData._id || userData.id,
        _id: userData._id || userData.id
      };
      
      console.log('AuthContext: Enhanced user data with consistent IDs', {
        id: enhancedUserData.id,
        _id: enhancedUserData._id
      });
      
      dispatch({
        type: 'USER_LOADED',
        payload: enhancedUserData
      });
      
      return enhancedUserData; // Return the enhanced user data
    } catch (err) {
      console.error('AuthContext: Load user error:', err.message);
      
      // Handle timeout errors specifically
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        console.error('AuthContext: User data request timed out. Server may be slow or unresponsive.');
      }
      
      if (err.response) {
        console.error('AuthContext: Server responded with status', err.response.status);
        console.error('AuthContext: Response data:', err.response.data);
        
        // If token is invalid, clear it
        if (err.response.status === 401) {
          console.log('AuthContext: Token invalid, clearing authentication');
          localStorage.removeItem('token');
        }
      } else if (err.request) {
        console.error('AuthContext: No response received from server');
      }
      
      dispatch({ type: 'USER_LOADED_FAIL' });
      return null;
    }
  };
    // Register user
  const register = async (userData) => {
    try {
      console.log('Registering user with data:', { 
        ...userData, 
        password: userData.password ? '****' : undefined 
      });
      
      // Validate data before sending
      if (!userData.name || !userData.email || !userData.password) {
        console.error('Missing required fields:', { 
          name: !!userData.name, 
          email: !!userData.email, 
          password: !!userData.password 
        });
        
        dispatch({
          type: 'REGISTER_FAIL',
          payload: 'Please provide name, email and password'
        });
        return;
      }
      
      // Use direct URL to the backend server to avoid proxy issues
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      console.log('Registration successful:', res.data);
      
      // Save token to local storage
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });

      // Call loadUser with the new token
      loadUser();    } catch (err) {
      console.error('Registration error:', err);
      console.log('Error response:', err.response?.data);
      
      let errorMessage = 'Registration failed';
      
      // Get detailed error message if available
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.log('Registration failed with message:', errorMessage);
      
      dispatch({
        type: 'REGISTER_FAIL',
        payload: errorMessage
      });
    }
  };
  // Login user
  const login = async (userData) => {
    try {
      console.log('AuthContext: Attempting login with:', { email: userData.email, password: '******' });
      
      // Set request config with headers and extended timeout
      const config = {
        headers: {
          'Content-Type': 'application/json',
          // Add cache control headers to prevent blocking
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 30000 // Extended to 30 second timeout
      };
      
      // Use direct URL to the backend server with explicit configuration
      console.log('AuthContext: Making login request to http://localhost:5000/api/auth/login');
      console.log('AuthContext: Login request timeout set to 30 seconds');
      
      const res = await axios.post('http://localhost:5000/api/auth/login', userData, config);
      
      console.log('AuthContext: Login successful, token received');
      
      // Save token to local storage
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        console.log('AuthContext: Token saved to localStorage');
      } else {
        console.error('AuthContext: No token received in response');
      }      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });

      // Call loadUser with the new token
      loadUser();
    } catch (err) {
      console.error('AuthContext: Login error details:', {
        message: err.message,
        code: err.code,
        isAxiosError: err.isAxiosError,
        response: err.response,
        request: err.request ? 'Request object exists' : 'No request object'
      });
      
      // Special handling for different error types
      if (err.message === 'Network Error') {
        console.error('AuthContext: Network error detected. Server might be down or CORS issue.');
        dispatch({
          type: 'LOGIN_FAIL',
          payload: 'Cannot connect to server. Please check your connection or try again later.'
        });
      } 
      // Handle timeout errors specifically
      else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        console.error('AuthContext: Request timed out. Server may be slow or unresponsive.');
        dispatch({
          type: 'LOGIN_FAIL',
          payload: 'Request timed out. Server may be slow or unresponsive. Please try again later.'
        });
      }
      else {
        dispatch({
          type: 'LOGIN_FAIL',
          payload: err.response?.data?.message || 'Login failed. Please try again.'
        });
      }
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await authAPI.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (err) {
      console.error('Logout error:', err);
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear errors
  const clearErrors = () => dispatch({ type: 'CLEAR_ERRORS' });  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      console.log('AuthContext: Setting global auth token');
      
      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.headers.common['Content-Type'] = 'application/json';
      axios.defaults.headers.common['Cache-Control'] = 'no-cache';
      
      // Also set the token in apiUtils if being used elsewhere
      if (authAPI && authAPI.setToken) {
        authAPI.setToken(token);
      }
      
      // Store token in localStorage as backup
      localStorage.setItem('token', token);
      
      console.log('AuthContext: Auth token set successfully');
    } else {
      console.log('AuthContext: Removing auth token');
      delete axios.defaults.headers.common['Authorization'];
      
      // Remove from localStorage
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        clearErrors,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
