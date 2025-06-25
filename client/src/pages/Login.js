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

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState('');

  const { login, error, isAuthenticated, clearErrors } = useContext(AuthContext);
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
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
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
      login(formData);
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
          mt: 8
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
              Log In
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your credentials to access your account
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
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
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={Boolean(formErrors.password)}
              helperText={formErrors.password}
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
              Sign In
            </Button>            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Typography variant="body2" align="center">
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: 'inherit', fontWeight: 'bold' }}>
                    Register here
                  </Link>
                </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
