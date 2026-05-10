import express from 'express';
import { createProject, getProjects, getSingleProject, updateProject, deleteProject, addMembersToProject, removeMemberFromProject } from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('admin'), createProject);
router.get('/', getProjects);
router.get('/:id', getSingleProject);
router.put('/:id', authorizeRoles('admin'), updateProject);
router.delete('/:id', authorizeRoles('admin'), deleteProject);
router.patch('/:id/members', authorizeRoles('admin'), addMembersToProject);
router.delete('/:id/members/:memberId', authorizeRoles('admin'), removeMemberFromProject);

export default router;
