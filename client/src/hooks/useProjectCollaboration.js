import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ProjectContext } from '../context/ProjectContext';
import socketUtils from '../utils/socket';
import projectUtils from '../utils/projectUtils';

/**
 * Custom hook for handling project collaboration
 */
const useProjectCollaboration = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { currentProject, updateCodeContent } = useContext(ProjectContext);
  
  const [collaborators, setCollaborators] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activityMessage, setActivityMessage] = useState('');

  // Initialize socket connection and join project room
  useEffect(() => {
    if (user && user.token) {
      // Initialize socket with authentication
      const socket = socketUtils.initiateSocket(user.token);
      
      // Set connection state
      socket.on('connect', () => {
        setIsConnected(true);
        setActivityMessage('Connected to collaboration server');
      });
      
      socket.on('disconnect', () => {
        setIsConnected(false);
        setActivityMessage('Disconnected from collaboration server');
      });
      
      return () => {
        socketUtils.disconnectSocket();
      };
    }
  }, [user]);
  
  // Join project room and listen for events
  useEffect(() => {
    if (id && user && isConnected) {
      // Join the project room
      socketUtils.joinProject(id);
      setActivityMessage(`Joined project: ${currentProject?.name || id}`);
      
      const socket = socketUtils.socket;
      
      // Listen for code updates
      socket.on('code-update', (data) => {
        if (data.userId !== user.id) {
          updateCodeContent(data.content);
          setActivityMessage(`${data.username || 'Someone'} is editing`);
        }
      });
      
      // Listen for cursor updates
      socket.on('cursor-position', (data) => {
        if (data.userId !== user.id) {
          updateCollaboratorCursor(data);
        }
      });
      
      // Listen for collaborator joined event
      socket.on('collaborator-joined', (data) => {
        setActivityMessage(`${data.username} joined the project`);
        addCollaborator(data);
      });
      
      // Listen for collaborator left event
      socket.on('collaborator-left', (data) => {
        setActivityMessage(`${data.username} left the project`);
        removeCollaborator(data.userId);
      });
      
      return () => {
        socket.off('code-update');
        socket.off('cursor-position');
        socket.off('collaborator-joined');
        socket.off('collaborator-left');
        socketUtils.leaveProject(id);
      };
    }
  }, [id, user, isConnected, currentProject, updateCodeContent]);
  
  // Update collaborator cursor position
  const updateCollaboratorCursor = (data) => {
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
            color: projectUtils.getUserColor(data.userId)
          }
        ];
      }
    });
  };
  
  // Add new collaborator to the list
  const addCollaborator = (data) => {
    setCollaborators(prev => {
      // Check if collaborator already exists
      if (prev.some(c => c.userId === data.userId)) {
        return prev;
      }
      
      // Add new collaborator
      return [
        ...prev,
        {
          userId: data.userId,
          username: data.username || 'Anonymous',
          position: data.position || null,
          color: projectUtils.getUserColor(data.userId)
        }
      ];
    });
  };
  
  // Remove collaborator from the list
  const removeCollaborator = (userId) => {
    setCollaborators(prev => prev.filter(c => c.userId !== userId));
  };
  
  // Send code change to other collaborators
  const sendCodeChange = (content) => {
    if (id && user && isConnected) {
      socketUtils.sendCodeChange(
        id,
        content,
        null, // cursor position is handled separately
        user.id,
        user.name
      );
    }
  };
  
  // Send cursor position update to other collaborators
  const sendCursorUpdate = (position) => {
    if (id && user && isConnected) {
      socketUtils.sendCursorUpdate(
        id,
        position,
        user.id,
        user.name
      );
    }
  };
  
  return {
    collaborators,
    isConnected,
    activityMessage,
    sendCodeChange,
    sendCursorUpdate
  };
};

export default useProjectCollaboration;
