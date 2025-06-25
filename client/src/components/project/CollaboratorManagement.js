import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,

  Divider,
  Tooltip,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ProjectContext } from '../../context/ProjectContext';
import projectUtils from '../../utils/projectUtils';

const CollaboratorManagement = ({ open, onClose, projectId }) => {  const { 
    currentProject, 
    addCollaborator, 
    removeCollaborator, 
    loading
  } = useContext(ProjectContext);
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Reset messages when dialog opens/closes
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
  }, [open]);
  
  const handleInvite = async () => {
    if (!email) {
      setErrorMessage('Email is required');
      return;
    }
    
    try {
      await addCollaborator(projectId, email, role);
      setSuccessMessage(`Invitation sent to ${email}`);
      setEmail('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add collaborator');
    }
  };
  
  const handleRemove = async (userId) => {
    try {
      await removeCollaborator(projectId, userId);
      setSuccessMessage('Collaborator removed');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to remove collaborator');
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Collaborators</DialogTitle>
      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Invite a collaborator
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              disabled={loading}
            />
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 100 }}>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                label="Role"
                disabled={loading}
              >
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleInvite}
              disabled={loading || !email}
            >
              Invite
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Current Collaborators
          </Typography>
          
          {currentProject?.collaborators?.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No collaborators yet
            </Typography>
          ) : (
            <List>
              {currentProject?.collaborators?.map((collab) => (
                <ListItem key={collab.user?._id || collab.user}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{ 
                        bgcolor: projectUtils.getUserColor(collab.user?._id || collab.user) 
                      }}
                    >
                      {(collab.user?.name || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={collab.user?.name || collab.user}
                    secondary={`Role: ${collab.role.charAt(0).toUpperCase() + collab.role.slice(1)}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Remove collaborator">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemove(collab.user?._id || collab.user)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CollaboratorManagement;
