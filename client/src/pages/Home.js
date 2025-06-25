import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  CardActions,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Hero Section */}
      <Box 
        sx={{
          backgroundColor: theme.palette.background.default,
          color: '#fff',
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant={isMobile ? "h3" : "h2"} 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Real-Time Collaborative IDE
          </Typography>
          <Typography 
            variant="h5" 
            component="p" 
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Code together in real-time, without the hassle.
            Share your projects and collaborate with your team instantly.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{ mr: 2, px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Get Started
            </Button>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              size="large"
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            component="h2" 
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 700 }}
          >
            Key Features
          </Typography>
            <Grid container spacing={4}>
            {/* Feature 1 */}
            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <CodeIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3" align="center">
                    Code Editor
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Powerful code editor with syntax highlighting for multiple languages, auto-completion, and more.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
              {/* Feature 2 */}
            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <GroupIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3" align="center">
                    Real-Time Collaboration
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    See changes in real-time as your team edits the code. Know who's typing what and where.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
              {/* Feature 3 */}
            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <SecurityIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3" align="center">
                    Secure Access Control
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Control who can view or edit your projects with fine-grained access permissions.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Feature 4 */}            <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <SpeedIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3" align="center">
                    Fast & Responsive
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Optimized for speed with minimal latency, works great on any device from mobile to desktop.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box 
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: '#fff',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to start coding together?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Join thousands of developers who are already using our platform to code better, together.
          </Typography>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            color="secondary"
            size="large"
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
          >
            Get Started for Free
          </Button>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          py: 6, 
          textAlign: 'center' 
        }}
      >
        <Container>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} CollabIDE. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
