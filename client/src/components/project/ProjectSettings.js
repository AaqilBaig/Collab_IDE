import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { ProjectContext } from '../../context/ProjectContext';

const ProjectSettings = ({ open, onClose, projectId }) => {
  const { currentProject, updateProject, loading } = useContext(ProjectContext);
  
  const [formData, setFormData] = useState({
    name: currentProject?.name || '',
    description: currentProject?.description || '',
    language: currentProject?.language || 'javascript',
    isPublic: currentProject?.isPublic || false,
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateProject(projectId, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update project settings:', error);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Project Settings</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Project Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            autoFocus
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            multiline
            rows={3}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              label="Language"
              disabled={loading}
            >
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="typescript">TypeScript</MenuItem>
              <MenuItem value="html">HTML</MenuItem>
              <MenuItem value="css">CSS</MenuItem>
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="java">Java</MenuItem>
              <MenuItem value="cpp">C++</MenuItem>
              <MenuItem value="csharp">C#</MenuItem>
              <MenuItem value="php">PHP</MenuItem>
              <MenuItem value="ruby">Ruby</MenuItem>
              <MenuItem value="go">Go</MenuItem>
              <MenuItem value="rust">Rust</MenuItem>
              <MenuItem value="swift">Swift</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={handleSwitchChange}
                  name="isPublic"
                  color="primary"
                  disabled={loading}
                />
              }
              label="Make project public"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Public projects can be viewed by anyone with the link
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectSettings;
