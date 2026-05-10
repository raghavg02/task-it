import express from 'express';
import { getAllMembers } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/members', authorizeRoles('admin'), getAllMembers);

export default router;
