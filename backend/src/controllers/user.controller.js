import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all members
// @route   GET /api/users/members
// @access  Private/Admin
export const getAllMembers = asyncHandler(async (req, res, next) => {
    const members = await User.find({ role: 'member' })
        .select('_id name email role')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: 'Members retrieved successfully',
        data: members
    });
});
