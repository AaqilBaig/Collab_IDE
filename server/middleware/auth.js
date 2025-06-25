const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;
  console.log('Auth middleware: Checking authentication');
  
  // Get token from authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    console.log('Auth middleware: Token found in authorization header');
  } 
  // Set token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
    console.log('Auth middleware: Token found in cookies');
  }

  // Make sure token exists
  if (!token) {
    console.log('Auth middleware: No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    console.log('Auth middleware: Verifying token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware: Token verified, user ID:', decoded.id);    // Add user to request
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('Auth middleware: User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('Auth middleware: User found:', user.name, 'with ID:', user._id);
      // Set the user object with both _id and id properties for consistency
    const userObject = user.toObject();
    req.user = {
      ...userObject,
      id: userObject._id.toString(), // Ensure id is available for code that expects it
      _id: userObject._id // Make sure _id is properly included
    };

    next();
  } catch (err) {
    console.error('Auth middleware: Token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: err.message
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
