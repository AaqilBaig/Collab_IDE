const Project = require('../models/Project');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    // Add user to body
    req.body.owner = req.user.id;

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Get all projects for logged in user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    console.log('Project Controller: Getting projects for user:', req.user.id);
    console.log('Project Controller: Full user object:', req.user);
    
    // Use both id and _id properties to be safe
    const userId = req.user.id || req.user._id;
    
    const query = {
      $or: [
        { owner: userId },
        { 'collaborators.user': userId },
        { isPublic: true }
      ]
    };
    
    console.log('Project Controller: Using query:', JSON.stringify(query));

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');
      
    console.log('Project Controller: Found', projects.length, 'projects');
    
    if (projects.length > 0) {
      console.log('Project Controller: First project name:', projects[0].name);
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private/Public (depending on project settings)
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email')
      .populate('history.modifiedBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Make sure user is project owner or collaborator or project is public
    if (
      !project.isPublic && 
      project.owner.id.toString() !== req.user.id && 
      !project.collaborators.some(collab => collab.user.id.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Make sure user is project owner or has editor role
    const isOwner = project.owner.toString() === req.user.id;
    const isEditor = project.collaborators.some(
      collab => collab.user.toString() === req.user.id && collab.role === 'editor'
    );

    if (!isOwner && !isEditor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // If content is being updated, add modifiedBy field
    if (req.body.content) {
      req.body.modifiedBy = req.user.id;
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Make sure user is project owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await project.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Add collaborator to project
// @route   POST /api/projects/:id/collaborators
// @access  Private
exports.addCollaborator = async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both userId and role'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Make sure user is project owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add collaborators'
      });
    }

    // Check if collaborator already exists
    if (project.collaborators.some(collab => collab.user.toString() === userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a collaborator'
      });
    }

    // Add collaborator
    project.collaborators.push({
      user: userId,
      role
    });

    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Remove collaborator from project
// @route   DELETE /api/projects/:id/collaborators/:userId
// @access  Private
exports.removeCollaborator = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Make sure user is project owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove collaborators'
      });
    }

    // Remove collaborator
    project.collaborators = project.collaborators.filter(
      collab => collab.user.toString() !== req.params.userId
    );

    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};
