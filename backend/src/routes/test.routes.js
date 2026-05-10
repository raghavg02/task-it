import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/admin-only', authorizeRoles('admin'), (req, res) => {
    res.status(200).json({ success: true, message: 'Success! You have admin access.', data: null });
});

router.get('/member-only', authorizeRoles('admin', 'member'), (req, res) => {
    res.status(200).json({ success: true, message: 'Success! You have member/admin access.', data: null });
});

export default router;
