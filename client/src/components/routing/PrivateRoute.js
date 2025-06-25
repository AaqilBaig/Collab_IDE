import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
