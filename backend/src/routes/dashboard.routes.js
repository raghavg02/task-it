import express from 'express';
import { getAdminDashboard, getMemberDashboard } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/admin', authorizeRoles('admin'), getAdminDashboard);
router.get('/member', authorizeRoles('member'), getMemberDashboard);

export default router;
