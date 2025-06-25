import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: { xs: '4rem', md: '8rem' },
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2
          }}
        >
          404
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4,
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}
        >
          Page Not Found
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4, 
            maxWidth: '600px',
            color: 'text.secondary'
          }}
        >
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </Typography>
        <Button 
          component={RouterLink} 
          to="/" 
          variant="contained" 
          color="primary" 
          size="large"
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
