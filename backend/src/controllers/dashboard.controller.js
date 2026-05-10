import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAdminDashboard = asyncHandler(async (req, res, next) => {
    const userId = req.user.userId;

    const totalProjects = await Project.countDocuments({ createdBy: userId });
    const adminProjects = await Project.find({ createdBy: userId }).select('_id');
    const projectIds = adminProjects.map(p => p._id);
    const taskQuery = { project: { $in: projectIds } };

    const totalMembers = await User.countDocuments();
    const totalTasks = await Task.countDocuments(taskQuery);
    const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ ...taskQuery, status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'in-progress' });
    const overdueTasks = await Task.countDocuments({
        ...taskQuery,
        deadline: { $lt: new Date() },
        status: { $ne: 'completed' }
    });

    const activeProjectsData = await Project.find({ createdBy: userId })
        .populate('members', 'name email role')
        .sort({ updatedAt: -1 })
        .limit(3);

    const activeProjects = await Promise.all(activeProjectsData.map(async (project) => {
        const total = await Task.countDocuments({ project: project._id });
        const completed = await Task.countDocuments({ project: project._id, status: 'completed' });
        return {
            ...project._doc,
            taskStats: {
                total,
                completed,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0
            }
        };
    }));

    const recentTasks = await Task.find(taskQuery)
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .limit(8);

    const upcomingDeadlines = await Task.find({
        ...taskQuery,
        status: { $ne: 'completed' },
        deadline: { $gte: new Date() }
    })
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .sort({ deadline: 1 })
        .limit(5);

    const teamMembers = await User.find({ role: 'member' })
        .select('name email role')
        .sort({ createdAt: -1 })
        .limit(5);

    res.status(200).json({
        success: true,
        message: 'Admin dashboard data retrieved successfully',
        data: {
            stats: {
                totalProjects,
                totalTasks,
                completedTasks,
                pendingTasks,
                inProgressTasks,
                overdueTasks,
                totalMembers
            },
            activeProjects,
            recentTasks,
            upcomingDeadlines,
            teamMembers
        }
    });
});

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

    const activeProjectsData = await Project.find({ members: userId })
        .populate('members', 'name email role')
        .sort({ updatedAt: -1 })
        .limit(3);

    const activeProjects = await Promise.all(activeProjectsData.map(async (project) => {
        const total = await Task.countDocuments({ project: project._id, assignedTo: userId });
        const completed = await Task.countDocuments({ project: project._id, assignedTo: userId, status: 'completed' });
        return {
            ...project._doc,
            taskStats: {
                total,
                completed,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0
            }
        };
    }));

    const recentTasks = await Task.find(taskQuery)
        .populate('project', 'title')
        .sort({ updatedAt: -1 })
        .limit(8);

    const upcomingDeadlines = await Task.find({
        ...taskQuery,
        status: { $ne: 'completed' },
        deadline: { $gte: new Date() }
    })
        .populate('project', 'title')
        .sort({ deadline: 1 })
        .limit(5);

    res.status(200).json({
        success: true,
        message: 'Member dashboard data retrieved successfully',
        data: {
            stats: {
                assignedProjectsCount,
                totalAssignedTasks,
                completedTasks,
                pendingTasks,
                inProgressTasks,
                overdueTasks
            },
            activeProjects,
            recentTasks,
            upcomingDeadlines
        }
    });
});
