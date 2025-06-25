import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import { AuthContext } from '../context/AuthContext';
import { ProjectContext } from '../context/ProjectContext';

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const { 
    projects, 
    loading, 
    error,
    getProjects, 
    createProject, 
    deleteProject,
    clearErrors
  } = useContext(ProjectContext);
  const navigate = useNavigate();
  // Debug authentication state
  useEffect(() => {
    if (user) {
      const userId = user._id || user.id;
      console.log('Dashboard Component Initialized:', {
        isAuthenticated,
        authLoading,
        hasUser: !!user,
        userData: `User ID: ${userId || 'undefined'}, Name: ${user.name}`
      });
    } else {
      console.log('Dashboard Component Initialized:', {
        isAuthenticated,
        authLoading,
        hasUser: false,
        userData: 'No user data'
      });
    }
  }, [isAuthenticated, authLoading, user]);

  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    language: 'javascript'
  });
  const [formErrors, setFormErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState('');  
  
  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!authLoading && !isAuthenticated) {
      console.log('Dashboard: Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
  }, [authLoading, isAuthenticated, navigate]);
    
  // Separate useEffect for project fetching to avoid dependency cycles
  useEffect(() => {
    // Track loading state to prevent multiple calls
    let isMounted = true;
    
    // Only fetch if we have a user and we're authenticated
    if (isAuthenticated && user) {
      // Try to get user ID from either _id or id properties
      const userId = user._id || user.id;
      
      console.log('Dashboard: User authenticated, fetching projects for:', user.name, 'with ID:', userId);
      console.log('Dashboard: Current projects state:', { 
        projectsCount: projects.length, 
        isLoading: loading, 
        hasError: !!error 
      });
      
      const fetchProjects = async () => {
        try {
          console.log('Dashboard: Fetching projects...');
          await getProjects();
          if (isMounted) {
            console.log('Dashboard: Projects fetched successfully');
            // Clear error message on success
            setAlertMessage('');
          }
        } catch (err) {
          console.error('Dashboard: Error in getProjects effect:', err);
          if (isMounted) {
            setAlertMessage('Failed to fetch projects. Please try again.');
          }
        }
      };
      
      // Call fetchProjects only once when component mounts
      fetchProjects();
    } else if (isAuthenticated && !user) {
      console.log('Dashboard: Authenticated but no user data, waiting...');
    } else {
      console.log('Dashboard: Authentication status:', { isAuthenticated, authLoading, hasUser: !!user });
    }
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, error, projects.length]);

  useEffect(() => {
    if (error) {
      console.log('Project error detected:', error);
      setAlertMessage(error);
      
      // Only clear errors after displaying them
      setTimeout(() => {
        clearErrors();
      }, 5000); // Clear after 5 seconds
    }
  }, [error, clearErrors]);

  const handleCreateProjectOpen = () => {
    setNewProject({
      name: '',
      description: '',
      language: 'javascript'
    });
    setFormErrors({});
    setNewProjectDialog(true);
  };

  const handleCreateProjectClose = () => {
    setNewProjectDialog(false);
  };

  const handleDeleteDialogOpen = (project) => {
    setSelectedProject(project);
    setConfirmDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setSelectedProject(null);
    setConfirmDeleteDialog(false);
  };

  const handleDeleteProject = () => {
    if (selectedProject) {
      deleteProject(selectedProject._id);
      handleDeleteDialogClose();
    }
  };

  const handleNewProjectChange = (e) => {
    const { name, value } = e.target;
    
    setNewProject((prev) => ({
      ...prev,
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

  const validateNewProjectForm = () => {
    const errors = {};
    
    if (!newProject.name.trim()) {
      errors.name = 'Project name is required';
    }
    
    if (!newProject.language) {
      errors.language = 'Programming language is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitNewProject = async (e) => {
    e.preventDefault();
    
    if (validateNewProjectForm()) {
      const createdProject = await createProject({
        name: newProject.name,
        description: newProject.description,
        language: newProject.language,
        content: ''
      });
      
      if (createdProject) {
        handleCreateProjectClose();
        navigate(`/projects/${createdProject._id}`);
      }
    }
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: '#f0db4f',
      python: '#306998',
      html: '#e34c26',
      css: '#264de4',
      typescript: '#007acc',
      java: '#f89820',
      c: '#5c6bc0',
      cpp: '#659ad2',
      csharp: '#68217a',
      php: '#8993be',
      ruby: '#cc342d',
      go: '#00add8',
      rust: '#dea584',
      swift: '#f05138'
    };
    
    return colors[language] || '#777';
  };
  // Only show full-screen loading if we're in the initial loading state
  // and authentication is confirmed but we're waiting for data
  if (loading && isAuthenticated && !authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateProjectOpen}
        >
          New Project
        </Button>
      </Box>

      {alertMessage && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setAlertMessage('')}
        >
          {alertMessage}
        </Alert>
      )}      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
            Loading projects...
          </Typography>
        </Box>
      ) : projects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You don't have any projects yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create your first project to start coding collaboratively
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProjectOpen}
            sx={{ mt: 2 }}
          >
            Create Project
          </Button>
        </Paper>
      ) : (<Grid container spacing={3}>
          {projects.map(project => (
            <Grid key={project._id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="h2" noWrap>
                      {project.name}
                    </Typography>
                    <Chip 
                      label={project.language}
                      size="small"
                      sx={{ 
                        bgcolor: getLanguageColor(project.language), 
                        color: '#000',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description || 'No description'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.collaborators?.length || 0} collaborators
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/projects/${project._id}`}
                    startIcon={<CodeIcon />}
                  >
                    Open Editor
                  </Button>
                  <Box sx={{ ml: 'auto', display: 'flex' }}>
                    <Tooltip title="Edit Project Details">
                      <IconButton 
                        size="small" 
                        component={Link} 
                        to={`/projects/${project._id}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {project.owner === user?.id && (
                      <Tooltip title="Delete Project">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteDialogOpen(project)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* New Project Dialog */}
      <Dialog open={newProjectDialog} onClose={handleCreateProjectClose}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the details for your new project.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={handleNewProjectChange}
            error={Boolean(formErrors.name)}
            helperText={formErrors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Description (optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newProject.description}
            onChange={handleNewProjectChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" error={Boolean(formErrors.language)}>
            <InputLabel id="language-label">Programming Language</InputLabel>
            <Select
              labelId="language-label"
              id="language"
              name="language"
              value={newProject.language}
              onChange={handleNewProjectChange}
              label="Programming Language"
            >
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="html">HTML</MenuItem>
              <MenuItem value="css">CSS</MenuItem>
              <MenuItem value="typescript">TypeScript</MenuItem>
              <MenuItem value="java">Java</MenuItem>
              <MenuItem value="c">C</MenuItem>
              <MenuItem value="cpp">C++</MenuItem>
              <MenuItem value="csharp">C#</MenuItem>
              <MenuItem value="php">PHP</MenuItem>
              <MenuItem value="ruby">Ruby</MenuItem>
              <MenuItem value="go">Go</MenuItem>
              <MenuItem value="rust">Rust</MenuItem>
              <MenuItem value="swift">Swift</MenuItem>
            </Select>
            {formErrors.language && (
              <Typography variant="caption" color="error">
                {formErrors.language}
              </Typography>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateProjectClose}>Cancel</Button>
          <Button onClick={handleSubmitNewProject} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete project "{selectedProject?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
