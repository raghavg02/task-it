import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get admin dashboard statistics
// @route   GET /api/dashboard/admin
// @access  Private/Admin
export const getAdminDashboard = asyncHandler(async (req, res, next) => {
    const userId = req.user.userId;

    const totalProjects = await Project.countDocuments({ createdBy: userId });

    const adminProjects = await Project.find({ createdBy: userId }).select('_id');
    const projectIds = adminProjects.map(p => p._id);

    const taskQuery = { project: { $in: projectIds } };

    const totalTasks = await Task.countDocuments(taskQuery);
    const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ ...taskQuery, status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'in-progress' });
    
    const overdueTasks = await Task.countDocuments({
        ...taskQuery,
        deadline: { $lt: new Date() },
        status: { $ne: 'completed' }
    });

    res.status(200).json({
        success: true,
        message: 'Admin dashboard statistics retrieved successfully',
        data: {
            totalProjects,
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            overdueTasks
        }
    });
});

// @desc    Get member dashboard statistics
// @route   GET /api/dashboard/member
// @access  Private/Member
export const getMemberDashboard = asyncHandler(async (req, res, next) => {
    const userId = req.user.userId;

    const assignedProjectsCount = await Project.countDocuments({ members: userId });

    const taskQuery = { assignedTo: userId };

    const totalAssignedTasks = await Task.countDocuments(taskQuery);
    const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ ...taskQuery, status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'in-progress' });
    
    const overdueTasks = await Task.countDocuments({
        ...taskQuery,
        deadline: { $lt: new Date() },
        status: { $ne: 'completed' }
    });

    res.status(200).json({
        success: true,
        message: 'Member dashboard statistics retrieved successfully',
        data: {
            assignedProjectsCount,
            totalAssignedTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            overdueTasks
        }
    });
});
