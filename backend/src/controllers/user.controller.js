import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import bcrypt from 'bcryptjs';

// @desc    Invite a new member
// @route   POST /api/users/invite
// @access  Private/Admin
export const inviteMember = asyncHandler(async (req, res, next) => {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        return next(new ApiError(400, 'Please provide all required fields'));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new ApiError(409, 'User already exists with this email'));
    }

    // Default password for invited members
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('TaskIt123!', salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'member',
        needsPasswordChange: true
    });

    res.status(201).json({
        success: true,
        message: 'Member invited successfully',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            needsPasswordChange: user.needsPasswordChange
        }
    });
});

// @desc    Get all members
// @route   GET /api/users/members
// @access  Private/Admin
export const getAllMembers = asyncHandler(async (req, res, next) => {
    const members = await User.find({})
        .select('_id name email role createdAt')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: 'Members retrieved successfully',
        data: members
    });
});

// @desc    Update user profile
// @route   PATCH /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
    const { name, email } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return next(new ApiError(404, 'User not found'));

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

// @desc    Change password
// @route   PATCH /api/users/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return next(new ApiError(404, 'User not found'));

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return next(new ApiError(401, 'Invalid current password'));

    user.password = await bcrypt.hash(newPassword, 10);
    user.needsPasswordChange = false;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            needsPasswordChange: user.needsPasswordChange,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    });
});

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.find({ recipient: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(20);

    res.status(200).json({
        success: true,
        data: notifications
    });
});

// @desc    Mark notification as read
// @route   PATCH /api/users/notifications/:id/read
// @access  Private
export const markNotificationRead = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) return next(new ApiError(404, 'Notification not found'));
    if (notification.recipient.toString() !== req.user.userId) {
        return next(new ApiError(403, 'Not authorized'));
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
        success: true,
        message: 'Notification marked as read'
    });
});

// @desc    Remove member (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const removeMember = asyncHandler(async (req, res, next) => {
    if (req.params.id === req.user.userId) {
        return next(new ApiError(400, 'Cannot remove yourself'));
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new ApiError(404, 'User not found'));

    res.status(200).json({
        success: true,
        message: 'Member removed successfully'
    });
});
