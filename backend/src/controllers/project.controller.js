import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import mongoose from 'mongoose';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = asyncHandler(async (req, res, next) => {
    const { title, description, members } = req.body;

    if (!title || !description) {
        return next(new ApiError(400, 'Title and description are required'));
    }

    let uniqueMembers = [];
    if (members && Array.isArray(members)) {
        // Validate Mongo ObjectIds
        const validMembers = members.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validMembers.length !== members.length) {
            return next(new ApiError(400, 'One or more member IDs are invalid'));
        }

        // Prevent duplicates
        uniqueMembers = [...new Set(members)];

        // Ensure all users exist
        const users = await User.find({ _id: { $in: uniqueMembers } });
        if (users.length !== uniqueMembers.length) {
            return next(new ApiError(400, 'One or more assigned members do not exist'));
        }
    }

    const project = await Project.create({
        title,
        description,
        createdBy: req.user.userId,
        members: uniqueMembers
    });

    const populatedProject = await Project.findById(project._id)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');

    res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: populatedProject
    });
});

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = asyncHandler(async (req, res, next) => {
    let query = {};

    if (req.user.role === 'admin') {
        // Admin gets own projects
        query.createdBy = req.user.userId;
    } else if (req.user.role === 'member') {
        // Member gets projects where they are in the members array
        query.members = req.user.userId;
    }

    const projects = await Project.find(query)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully',
        data: projects
    });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getSingleProject = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid project ID'));
    }

    const project = await Project.findById(id)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');

    if (!project) {
        return next(new ApiError(404, 'Project not found'));
    }

    // Access control check
    if (req.user.role === 'admin') {
        if (project.createdBy._id.toString() !== req.user.userId) {
            return next(new ApiError(403, 'Not authorized to access this project'));
        }
    } else if (req.user.role === 'member') {
        const isMember = project.members.some(
            member => member._id.toString() === req.user.userId
        );
        if (!isMember) {
            return next(new ApiError(403, 'Not authorized to access this project'));
        }
    }

    res.status(200).json({
        success: true,
        message: 'Project retrieved successfully',
        data: project
    });
});

// @desc    Add members to an existing project
// @route   PATCH /api/projects/:id/members
// @access  Private/Admin
export const addMembersToProject = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { members } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid project ID'));
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
        return next(new ApiError(400, 'Please provide an array of member IDs'));
    }

    const project = await Project.findById(id);
    if (!project) {
        return next(new ApiError(404, 'Project not found'));
    }

    if (project.createdBy.toString() !== req.user.userId) {
        return next(new ApiError(403, 'Not authorized to modify this project'));
    }

    const validMembers = members.filter(mid => mongoose.Types.ObjectId.isValid(mid));
    if (validMembers.length !== members.length) {
        return next(new ApiError(400, 'One or more member IDs are invalid'));
    }

    // Check if users exist and have 'member' role
    const users = await User.find({ _id: { $in: validMembers } });
    if (users.length !== validMembers.length) {
        return next(new ApiError(400, 'One or more users do not exist'));
    }

    const hasAdmins = users.some(u => u.role === 'admin');
    if (hasAdmins) {
        return next(new ApiError(400, 'Cannot add admins as project members'));
    }

    // Prevent duplicates
    const newMembers = validMembers.filter(mid => !project.members.includes(mid));
    const uniqueNewMembers = [...new Set(newMembers)];

    if (uniqueNewMembers.length > 0) {
        project.members.push(...uniqueNewMembers);
        await project.save();
    }

    const updatedProject = await Project.findById(id)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');

    res.status(200).json({
        success: true,
        message: 'Members added successfully',
        data: updatedProject
    });
});

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:memberId
// @access  Private/Admin
export const removeMemberFromProject = asyncHandler(async (req, res, next) => {
    const { id, memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(memberId)) {
        return next(new ApiError(400, 'Invalid project or member ID'));
    }

    const project = await Project.findById(id);
    if (!project) {
        return next(new ApiError(404, 'Project not found'));
    }

    if (project.createdBy.toString() !== req.user.userId) {
        return next(new ApiError(403, 'Not authorized to modify this project'));
    }

    if (!project.members.includes(memberId)) {
        return next(new ApiError(404, 'Member not found in this project'));
    }

    project.members = project.members.filter(mid => mid.toString() !== memberId);
    await project.save();

    const updatedProject = await Project.findById(id)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');

    res.status(200).json({
        success: true,
        message: 'Member removed successfully',
        data: updatedProject
    });
});
