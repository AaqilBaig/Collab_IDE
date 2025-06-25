import io from 'socket.io-client';
import { useState, useEffect } from 'react';

// Create Socket instance
const SOCKET_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
let socket;

// Function to get or initialize socket connection
export const initiateSocket = (token) => {
  console.log('🔌 initiateSocket called with token:', !!token);
  
  if (!socket) {
    console.log('🔌 Creating new socket connection to:', SOCKET_URL);
    socket = io(SOCKET_URL, {
      auth: {
        token
      }
    });
    
    socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
    
    console.log('Connecting to socket...');
  } else {
    console.log('🔌 Using existing socket connection');
  }
  return socket;
};

// Join a project room
export const joinProject = (projectId) => {
  if (socket && projectId) {
    socket.emit('join-project', projectId);
  }
};

// Leave a project room
export const leaveProject = (projectId) => {
  if (socket && projectId) {
    socket.emit('leave-project', projectId);
  }
};

// Send code change event
export const sendCodeChange = (projectId, content, cursorPosition, userId, username) => {
  console.log('🔌 sendCodeChange called:', { projectId, contentLength: content?.length, userId, username });
  
  if (socket) {
    console.log('🔌 Socket exists, emitting code-change event');
    socket.emit('code-change', {
      projectId,
      content,
      cursorPosition,
      userId,
      username
    });
    console.log('✅ code-change event emitted');
  } else {
    console.error('❌ Socket not available when trying to send code change');
  }
};

// Send typing indicator
export const sendTypingIndicator = (projectId, isTyping, userId, username) => {
  if (socket) {
    socket.emit('typing-indicator', {
      projectId,
      isTyping,
      userId,
      username
    });
  }
};

// Send cursor update event
export const sendCursorUpdate = (projectId, position, userId, username) => {
  if (socket) {
    socket.emit('cursor-update', {
      projectId,
      position,
      userId,
      username
    });
  }
};

// Export socket instance getter
export const getSocket = () => socket;

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Custom hook for using socket
export const useSocket = (token) => {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const socketInstance = initiateSocket(token);
    
    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });
    
    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });
    
    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
    };
  }, [token]);
  
  return { socket, isConnected };
};

const socketUtils = {
  socket,
  initiateSocket,
  joinProject,
  leaveProject,
  sendCodeChange,
  sendTypingIndicator,
  sendCursorUpdate,
  disconnectSocket,
  useSocket
};

export default socketUtils;
