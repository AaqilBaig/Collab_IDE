const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addCollaborator,
  removeCollaborator
} = require('../controllers/projects');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(createProject);

router
  .route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router
  .route('/:id/collaborators')
  .post(addCollaborator);

router
  .route('/:id/collaborators/:userId')
  .delete(removeCollaborator);

module.exports = router;
