import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Alert,
  Grid,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState('');

  const { register, error, isAuthenticated, clearErrors } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // Set error alert if there's an error from context
    if (error) {
      setAlertMessage(error);
      clearErrors();
    }
  }, [isAuthenticated, error, navigate, clearErrors]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear any previous alerts
    setAlertMessage('');
    
    if (validateForm()) {
      const { name, email, password } = formData;
      
      // Log the data being sent (mask password for security)
      console.log('Submitting registration with:', { 
        name, 
        email, 
        passwordLength: password ? password.length : 0
      });
      
      register({ name, email, password });
    } else {
      console.log('Form validation failed. Errors:', formErrors);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8,
          mb: 8
        }}
      >
        <Paper
          elevation={3}
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 2
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Register to start collaborating in real-time
            </Typography>
          </Box>

          {alertMessage && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setAlertMessage('')}
            >
              {alertMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={Boolean(formErrors.name)}
              helperText={formErrors.name}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={handleChange}
              error={Boolean(formErrors.password)}
              helperText={formErrors.password}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={Boolean(formErrors.confirmPassword)}
              helperText={formErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Register
            </Button>            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Typography variant="body2" align="center">
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'inherit', fontWeight: 'bold' }}>
                    Sign in
                  </Link>
                </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
