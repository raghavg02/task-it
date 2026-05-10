import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

// @route   GET /api/test/admin-only
// @desc    Test admin access
// @access  Private/Admin
router.get('/admin-only', protect, authorizeRoles('admin'), (req, res) => {
    res.status(200).json({ 
        success: true,
        message: 'Success! You have admin access.',
        data: null
    });
});

// @route   GET /api/test/member-only
// @desc    Test member access
// @access  Private/Member or Admin
router.get('/member-only', protect, authorizeRoles('admin', 'member'), (req, res) => {
    res.status(200).json({ 
        success: true,
        message: 'Success! You have member/admin access.',
        data: null
    });
});

export default router;
