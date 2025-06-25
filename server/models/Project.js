const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: false,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  language: {
    type: String,
    required: [true, 'Please specify a programming language'],
    enum: ['javascript', 'python', 'html', 'css', 'typescript', 'java', 'c', 'cpp', 'csharp', 'php', 'ruby', 'go', 'rust', 'swift']
  },
  content: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'editor'
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  },
  history: [{
    content: String,
    modifiedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    version: Number
  }]
});

// Update lastModified timestamp before saving
ProjectSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.lastModified = Date.now();
    this.version += 1;
    
    // Save to history (limit to last 10 versions)
    this.history.push({
      content: this.content,
      modifiedBy: this.modifiedBy || this.owner,
      timestamp: this.lastModified,
      version: this.version
    });
    
    // Keep only the last 10 versions in history
    if (this.history.length > 10) {
      this.history = this.history.slice(-10);
    }
  }
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
