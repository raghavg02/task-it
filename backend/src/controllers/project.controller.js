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
        // Admin gets all projects in the system (or filtered by creator if needed)
        // For now, let's allow admins to see all projects they created
        query.createdBy = req.user.userId;
    } else if (req.user.role === 'member') {
        // Member gets projects where they are in the members array
        query.members = req.user.userId;
    }

    // Convert ID strings to ObjectIds for aggregation
    const matchQuery = { ...query };
    if (matchQuery.createdBy) matchQuery.createdBy = new mongoose.Types.ObjectId(matchQuery.createdBy);
    if (matchQuery.members) matchQuery.members = new mongoose.Types.ObjectId(matchQuery.members);

    const projectsWithStats = await Project.aggregate([
        { $match: matchQuery },
        {
            $lookup: {
                from: 'tasks',
                localField: '_id',
                foreignField: 'project',
                as: 'tasks'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'members',
                foreignField: '_id',
                as: 'members'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy'
            }
        },
        {
            $addFields: {
                taskStats: {
                    total: { $size: '$tasks' },
                    completed: {
                        $size: {
                            $filter: {
                                input: '$tasks',
                                as: 'task',
                                cond: { $eq: ['$$task.status', 'completed'] }
                            }
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                'taskStats.progress': {
                    $cond: [
                        { $gt: ['$taskStats.total', 0] },
                        { $round: [{ $multiply: [{ $divide: ['$taskStats.completed', '$taskStats.total'] }, 100] }] },
                        0
                    ]
                }
            }
        },
        {
            $project: {
                tasks: 0,
                'members.password': 0,
                'createdBy.password': 0
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    // Format createdBy back to a single object (aggregation lookup returns an array)
    const formattedProjects = projectsWithStats.map(p => ({
        ...p,
        createdBy: p.createdBy[0],
    }));

    res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully',
        data: formattedProjects
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

    const total = await mongoose.model('Task').countDocuments({ project: id });
    const completed = await mongoose.model('Task').countDocuments({ project: id, status: 'completed' });

    const data = {
        ...project._doc,
        taskStats: {
            total,
            completed,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0
        }
    };

    res.status(200).json({
        success: true,
        message: 'Project retrieved successfully',
        data
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
// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, members } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid project ID'));
    }

    let project = await Project.findById(id);
    if (!project) return next(new ApiError(404, 'Project not found'));

    if (project.createdBy.toString() !== req.user.userId) {
        return next(new ApiError(403, 'Not authorized to update this project'));
    }

    if (title) project.title = title;
    if (description) project.description = description;
    if (members && Array.isArray(members)) {
        project.members = members;
    }

    await project.save();

    const updatedProject = await Project.findById(id)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');

    res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: updatedProject
    });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid project ID'));
    }

    const project = await Project.findById(id);
    if (!project) return next(new ApiError(404, 'Project not found'));

    if (project.createdBy.toString() !== req.user.userId) {
        return next(new ApiError(403, 'Not authorized to delete this project'));
    }

    // Delete all tasks associated with this project
    await mongoose.model('Task').deleteMany({ project: id });
    await Project.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: 'Project and associated tasks deleted successfully'
    });
});
