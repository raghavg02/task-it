import express from 'express';
import { 
    getAllMembers, 
    updateProfile, 
    changePassword, 
    getNotifications, 
    markNotificationRead,
    removeMember,
    inviteMember
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/members', authorizeRoles('admin'), getAllMembers);
router.post('/invite', authorizeRoles('admin'), inviteMember);
router.patch('/profile', updateProfile);
router.patch('/change-password', changePassword);
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.delete('/:id', authorizeRoles('admin'), removeMember);

export default router;
