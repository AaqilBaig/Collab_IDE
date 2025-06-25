const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const userRoutes = require('./routes/users');

// Import error handler middleware
const errorHandler = require('./middleware/error');

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '..', '.env') });


// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS to allow requests from the frontend
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Authorization", "Content-Type", "Cache-Control", "Pragma"]
};
console.log('Setting up CORS with options:', corsOptions);
app.use(cors(corsOptions));

app.use(cookieParser());
// Configure Helmet but allow React app to connect
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());

// Logging in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);

// Error handler middleware (place after routes)
app.use(errorHandler);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);  
  // Join a project room
  socket.on('join-project', (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.username} (${socket.id}) joined project: ${projectId}`);
    
    // Notify other users in the room that someone joined
    socket.to(projectId).emit('user-joined', {
      userId: socket.userId,
      username: socket.username,
      socketId: socket.id
    });
    
    // Send current online users to the new joiner
    const room = io.sockets.adapter.rooms.get(projectId);
    if (room) {
      const onlineUsers = [];
      room.forEach(socketId => {
        const userSocket = io.sockets.sockets.get(socketId);
        if (userSocket && userSocket.userId !== socket.userId) {
          onlineUsers.push({
            userId: userSocket.userId,
            username: userSocket.username
          });
        }
      });
      socket.emit('online-users', onlineUsers);
    }
  });
  
  // Handle leaving project room
  socket.on('leave-project', (projectId) => {
    socket.leave(projectId);
    socket.to(projectId).emit('user-left', {
      userId: socket.userId,
      username: socket.username
    });
    console.log(`User ${socket.username} left project: ${projectId}`);
  });
  
  // Handle real-time code changes
  socket.on('code-change', (data) => {
    // Add timestamp for conflict resolution
    const updateData = {
      content: data.content,
      cursorPosition: data.cursorPosition,
      userId: data.userId,
      username: data.username,
      timestamp: Date.now()
    };
    
    // Broadcast immediately to all clients in the project room except sender
    socket.to(data.projectId).emit('code-update', updateData);
    console.log(`Code change from ${data.username} in project ${data.projectId}`);
  });
  
  // Handle real-time cursor position updates
  socket.on('cursor-update', (data) => {
    // Broadcast cursor position immediately (no debouncing on server)
    socket.to(data.projectId).emit('cursor-position', {
      position: data.position,
      userId: data.userId,
      username: data.username
    });
  });
    // Handle typing indicators
  socket.on('typing-indicator', (data) => {
    // Broadcast typing indicator to all other users in the project room
    socket.to(data.projectId).emit('typing-indicator', {
      projectId: data.projectId,
      isTyping: data.isTyping,
      userId: data.userId,
      username: data.username,
      timestamp: Date.now()
    });
  });
  
  // Legacy typing events (keeping for compatibility)
  socket.on('typing-start', (data) => {
    socket.to(data.projectId).emit('user-typing', {
      userId: data.userId,
      username: data.username
    });
  });
  
  socket.on('typing-stop', (data) => {
    socket.to(data.projectId).emit('user-stopped-typing', {
      userId: data.userId,
      username: data.username
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.username} (${socket.id}) disconnected`);
    
    // Notify all rooms this user was in
    socket.rooms.forEach(room => {
      if (room !== socket.id) { // Skip the default room
        socket.to(room).emit('user-left', {
          userId: socket.userId,
          username: socket.username
        });
      }
    });
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Handle unhandled routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
