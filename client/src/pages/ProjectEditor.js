import React, { useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,  Alert,
  Snackbar,
  Avatar,
  AvatarGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import ShareIcon from '@mui/icons-material/Share';
import PeopleIcon from '@mui/icons-material/People';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

import { ProjectContext } from '../context/ProjectContext';
import { AuthContext } from '../context/AuthContext';
import CodeEditor from '../components/editor/CodeEditor';
import { initiateSocket, joinProject, leaveProject, sendCodeChange, sendTypingIndicator, sendCursorUpdate, disconnectSocket, getSocket } from '../utils/socket';

const ProjectEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { 
    currentProject, 
    loading, 
    error, 
    getProject, 
    updateProject, 
    addCollaborator,
    updateCodeContent
  } = useContext(ProjectContext);
  const { user, token } = useContext(AuthContext); // Get token separately
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [collaborators, setCollaborators] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState('');  // Refs for real-time collaboration
  const lastSentContentRef = useRef('');
  const isReceivingUpdateRef = useRef(false);
  const typingTimeoutRef = useRef(null);
  const currentEditorContentRef = useRef('');
    // Cache user ID to avoid re-renders
  const userId = useMemo(() => user?.id || user?._id, [user]);// Instant function for real-time code sync with minimal debounce for performance
  const debouncedSendChange = useMemo(() => {
    let timeoutId;
    return (content, cursorPos) => {
      console.log('⏱️ debouncedSendChange called, setting timeout');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('🎯 debouncedSendChange timeout fired');
        console.log('🎯 Content different from last sent:', content !== lastSentContentRef.current);
        console.log('🎯 Project ID:', id);
        console.log('🎯 User:', user);
          if (content !== lastSentContentRef.current && id && user) {
          console.log('📡 Sending code change via socket');
          console.log('📡 User object:', user);
          console.log('📡 User ID:', user.id || user._id);
          lastSentContentRef.current = content;
          sendCodeChange(id, content, cursorPos, user.id || user._id, user.name);
        } else {
          console.log('❌ Not sending - conditions not met');
        }
      }, 50); // Reduced from 200ms to 50ms for near-instant updates
    };
  }, [id, user]);  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 Socket initialization effect - user:', !!user, 'token:', !!token);
    
    if (user && token) {
      console.log('🔌 Initializing socket with token');
      // Initialize socket with user token for authentication
      initiateSocket(token);
      
      return () => {
        console.log('🔌 Cleaning up socket connection');
        disconnectSocket();
      };
    } else {
      console.log('🔌 Not initializing socket - missing user or token');
    }
  }, [user, token]);  // Join project room when project ID is available
  useEffect(() => {
    console.log('🏠 Project room join effect - id:', id, 'user:', !!user, 'userId:', userId);
    
    if (!id || !user || !userId) {
      console.log('🏠 Not joining project room - missing requirements');
      return; // Don't proceed if we don't have necessary data
    }
    
    // Wait a bit for socket to be fully connected
    const joinWithDelay = setTimeout(() => {
      console.log('🏠 Attempting to join project room:', id);
      // Join the project room
      joinProject(id);
      
      // Get socket instance
      const socket = getSocket();
      console.log('🏠 Socket instance:', !!socket);
      
      if (socket) {      // Store event handlers for later cleanup
      const handleCodeUpdate = (data) => {
        console.log('📥 Received code update:', data);
        console.log('📥 From user:', data.username, 'My user:', user?.name);
        console.log('📥 Is from different user:', data.userId !== userId);
        
        if (data.userId !== userId && data.content) {
          // Prevent infinite loops by checking if we're receiving an update
          if (!isReceivingUpdateRef.current) {
            console.log('✅ Processing received code update');
            isReceivingUpdateRef.current = true;
            
            // Update both the project state and our editor content ref
            updateCodeContent(data.content);
            currentEditorContentRef.current = data.content;
            
            showCollaboratorActivity(`${data.username || 'Someone'} is editing`);
            
            // Reset the flag after a short delay
            setTimeout(() => {
              isReceivingUpdateRef.current = false;
            }, 100);
          } else {
            console.log('⚠️ Skipping code update - currently receiving');
          }
        } else {
          console.log('⚠️ Skipping code update - from same user or no content');
        }
      };const handleCursorPosition = (data) => {
        if (data.userId !== userId) {
          // Update collaborator cursor position
          setCollaborators(prev => {
            const existing = prev.find(c => c.userId === data.userId);
            if (existing) {
              return prev.map(c => 
                c.userId === data.userId 
                  ? { ...c, position: data.position } 
                  : c
              );
            } else {
              return [
                ...prev, 
                { 
                  userId: data.userId, 
                  username: data.username || 'Anonymous', 
                  position: data.position,
                  color: getRandomColor(data.userId)
                }
              ];
            }
          });
        }
      };
        const handleTypingIndicator = (data) => {
        if (data.userId !== userId) {
          setTypingUsers(prev => {
            if (data.isTyping) {
              // Add to typing users if not already there
              const isAlreadyTyping = prev.some(u => u.userId === data.userId);
              if (!isAlreadyTyping) {
                return [...prev, { userId: data.userId, username: data.username }];
              }
            } else {
              // Remove from typing users
              return prev.filter(u => u.userId !== data.userId);
            }
            return prev;
          });
        }
      };
        const handleOnlineUsers = (data) => {
        setOnlineUsers(data || []);
      };
      
      const handleUserJoined = (data) => {
        setOnlineUsers(prev => {
          const isAlreadyOnline = prev.some(u => u.userId === data.userId);
          if (!isAlreadyOnline) {
            return [...prev, { userId: data.userId, username: data.username }];
          }
          return prev;
        });
        showCollaboratorActivity(`${data.username} joined the project`);
      };
      
      const handleUserLeft = (data) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
        showCollaboratorActivity(`${data.username} left the project`);
      };
      
      // Set up listeners
      socket.on('code-update', handleCodeUpdate);      socket.on('cursor-position', handleCursorPosition);
      socket.on('typing-indicator', handleTypingIndicator);
      socket.on('online-users', handleOnlineUsers);
      socket.on('user-joined', handleUserJoined);
      socket.on('user-left', handleUserLeft);        // Clean up
        return () => {
          socket.off('code-update', handleCodeUpdate);
          socket.off('cursor-position', handleCursorPosition);
          socket.off('typing-indicator', handleTypingIndicator);
          socket.off('online-users', handleOnlineUsers);
          socket.off('user-joined', handleUserJoined);
          socket.off('user-left', handleUserLeft);
          leaveProject(id);
        };
      } else {
        console.log('🏠 No socket available for project room setup');
      }
    }, 500); // Wait 500ms for socket to connect
    
    return () => {
      clearTimeout(joinWithDelay);
    };
  }, [id, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load project data - use useCallback to memoize the effect logic
  const loadProject = useCallback(() => {
    if (id && (!currentProject || currentProject._id !== id)) {
      getProject(id);
    }
  }, [id, currentProject, getProject]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);
  
  useEffect(() => {
    if (error) {
      setAlertMessage(error);
    }
  }, [error]);
  
  const getRandomColor = (userId) => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8',
      '#33FFF6', '#F6FF33', '#FF9833', '#9833FF', '#33FFD4'
    ];
    
    // Handle the case where userId is undefined
    if (!userId) {
      // Return a default color or a random one
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Use user ID to deterministically pick a color
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };
  
  const showCollaboratorActivity = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  
  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  
  const handleInviteDialogOpen = () => {
    setInviteDialog(true);
  };
    const handleInviteDialogClose = () => {
    setInviteDialog(false);
    setInviteEmail('');
    setInviteRole('editor');
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };
    const handleSaveProject = async () => {
    try {
      if (currentProject && currentProject._id) {
        // Use current editor content instead of the potentially stale project content
        const contentToSave = currentEditorContentRef.current || currentProject.content;
        
        await updateProject(currentProject._id, { 
          content: contentToSave
        });
        
        // Update the local project state to match what we saved
        updateCodeContent(contentToSave);
        
        setSnackbarMessage('Project saved successfully');
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Error saving project:', err);
      setAlertMessage('Error saving project');
    }
  };
    const handleInviteSubmit = async () => {
    if (!inviteEmail.trim()) {
      setAlertMessage('Please enter an email address');
      return;
    }
    
    try {
      if (currentProject && currentProject._id) {
        await addCollaborator(currentProject._id, inviteEmail, inviteRole);
        
        setSnackbarMessage(`Invitation sent to ${inviteEmail}`);
        setSnackbarOpen(true);
        setInviteEmail('');
        setInviteRole('editor');
        handleInviteDialogClose();
      }
    } catch (err) {
      console.error('Error inviting collaborator:', err);
      setAlertMessage('Error inviting collaborator: ' + (err.response?.data?.message || err.message));
    }
  };  const handleCodeChange = useCallback((content) => {
    console.log('🔄 handleCodeChange called with content length:', content?.length);
    console.log('🔄 isReceivingUpdate:', isReceivingUpdateRef.current);
    console.log('🔄 currentProject exists:', !!currentProject);
    console.log('🔄 user exists:', !!user);
    console.log('🔄 content different from current:', content !== currentProject?.content);
    
    // Store current editor content for saving later
    currentEditorContentRef.current = content;
    
    // Only proceed if we're not currently receiving an update from another user
    if (!isReceivingUpdateRef.current && currentProject && user && content !== currentProject.content) {
      console.log('✅ Proceeding with code change');
      
      // DON'T update local state immediately - let the editor handle its own state
      // Only update when saving or receiving from other users
      // updateCodeContent(content); // REMOVED - this was causing the focus issue
        // Send typing indicator immediately
      console.log('📝 Sending typing indicator');
      sendTypingIndicator(id, true, user.id || user._id, user.name);
      
      // Clear any existing typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
        // Set a new timeout to stop typing indicator after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Stopping typing indicator');
        sendTypingIndicator(id, false, user.id || user._id, user.name);
      }, 1000);
      
      // Send real-time updates to other collaborators with minimal debouncing
      console.log('🚀 Calling debouncedSendChange');
      debouncedSendChange(content, null);
    } else {
      console.log('❌ Skipping code change - conditions not met');
    }
  }, [currentProject, user, debouncedSendChange, id]);const handleCursorChange = useCallback((position) => {
    if (id && user && !isReceivingUpdateRef.current) {
      // Send cursor updates immediately for live cursor tracking
      sendCursorUpdate(
        id, 
        position, 
        user.id || user._id,
        user.name
      );
    }
  }, [id, user]);

  // Cleanup effect for typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentProject) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Project not found
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGoBack}
            startIcon={<ArrowBackIcon />}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <IconButton 
            color="inherit" 
            onClick={handleGoBack} 
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {currentProject.name}
          </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            {!isMobile && (
              <>
                <AvatarGroup max={3} sx={{ mx: 2 }}>                  {/* Current user avatar */}
                  {user && (
                    <Tooltip title={`${user.name || 'You'} (You)`}>
                      <Avatar 
                        alt={user.name || 'User'} 
                        sx={{ 
                          bgcolor: getRandomColor(userId),
                          border: '2px solid #4caf50' // Green border for current user
                        }}
                      >
                        {(user.name || 'U').charAt(0)}
                      </Avatar>
                    </Tooltip>
                  )}
                  
                  {/* Online collaborators */}
                  {onlineUsers.filter(u => u.userId !== userId).map(collab => (
                    <Tooltip key={collab.userId} title={`${collab.username} (Online)`}>
                      <Avatar 
                        alt={collab.username || 'Collaborator'} 
                        sx={{ 
                          bgcolor: getRandomColor(collab.userId),
                          border: '2px solid #2196f3' // Blue border for online users
                        }}
                      >
                        {(collab.username || 'C').charAt(0)}
                      </Avatar>
                    </Tooltip>
                  ))}
                  
                  {/* Offline collaborators (in project but not currently online) */}
                  {collaborators.filter(collab => 
                    !onlineUsers.some(online => online.userId === collab.userId) && 
                    collab.userId !== userId
                  ).map(collab => (
                    <Tooltip key={collab.userId} title={`${collab.username} (Offline)`}>
                      <Avatar 
                        alt={collab.username || 'Collaborator'} 
                        sx={{ 
                          bgcolor: getRandomColor(collab.userId),
                          opacity: 0.6, // Lower opacity for offline users
                          border: '2px solid #757575' // Gray border for offline users
                        }}
                      >
                        {(collab.username || 'C').charAt(0)}
                      </Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>
                
                {/* Typing Indicators */}
                {typingUsers.length > 0 && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      fontSize: '0.7rem',
                      fontStyle: 'italic',
                      mt: 0.5
                    }}
                  >
                    {typingUsers.length === 1 
                      ? `${typingUsers[0].username} is typing...`
                      : typingUsers.length === 2
                      ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
                      : `${typingUsers.length} people are typing...`
                    }
                  </Typography>
                )}
              </>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Save Project">
                <IconButton color="inherit" onClick={handleSaveProject}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Invite Collaborators">
                <IconButton color="inherit" onClick={handleInviteDialogOpen}>
                  <PersonAddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={handleDrawerToggle}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={handleDrawerToggle}
        >
          <List>
            <ListItem button onClick={handleGoBack}>
              <ListItemIcon>
                <ArrowBackIcon />
              </ListItemIcon>
              <ListItemText primary="Back to Dashboard" />
            </ListItem>
            
            <Divider />
            
            <ListItem button onClick={handleInviteDialogOpen}>
              <ListItemIcon>
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Invite Collaborators" />
            </ListItem>
            
            <ListItem button>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Collaborators" />
            </ListItem>
            
            <ListItem button>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Project Settings" />
            </ListItem>
            
            <ListItem button>
              <ListItemIcon>
                <ShareIcon />
              </ListItemIcon>
              <ListItemText primary="Share Project" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      
      {alertMessage && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setAlertMessage('')}
        >
          {alertMessage}
        </Alert>
      )}
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <Paper 
          sx={{ 
            height: '100%', 
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <CodeEditor 
            content={currentProject.content || ''}
            language={currentProject.language || 'javascript'}
            onChange={handleCodeChange}
            onCursorChange={handleCursorChange}
            collaborators={collaborators}
          />
        </Paper>
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
        <Dialog open={inviteDialog} onClose={handleInviteDialogClose}>
        <DialogTitle>Invite Collaborator</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the email address of the person you want to collaborate with.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              value={inviteRole}
              label="Role"
              onChange={(e) => setInviteRole(e.target.value)}
            >
              <MenuItem value="viewer">Viewer - Can view code only</MenuItem>
              <MenuItem value="editor">Editor - Can view and edit code</MenuItem>
              <MenuItem value="admin">Admin - Can manage project and collaborators</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInviteDialogClose}>Cancel</Button>
          <Button onClick={handleInviteSubmit} variant="contained">Invite</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectEditor;
