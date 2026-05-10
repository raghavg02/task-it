import Task from '../models/task.model.js';
import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import mongoose from 'mongoose';

const populateTaskOptions = [
    { path: 'assignedTo', select: 'name email role' },
    { path: 'project', select: 'title description createdBy' },
    { path: 'createdBy', select: 'name email role' }
];

export const createTask = asyncHandler(async (req, res, next) => {
    const { title, description, priority, deadline, assignedTo, project } = req.body;

    if (!title || !description || !deadline || !assignedTo || !project) {
        return next(new ApiError(400, 'Please provide all required fields'));
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo) || !mongoose.Types.ObjectId.isValid(project)) {
        return next(new ApiError(400, 'Invalid Object ID for assignedTo or project'));
    }

    const proj = await Project.findById(project);
    if (!proj) {
        return next(new ApiError(404, 'Project not found'));
    }

    if (proj.createdBy.toString() !== req.user.userId) {
        return next(new ApiError(403, 'Not authorized to add tasks to this project'));
    }

    const user = await User.findById(assignedTo);
    if (!user) {
        return next(new ApiError(404, 'Assigned user not found'));
    }

    if (!proj.members.includes(assignedTo)) {
        return next(new ApiError(400, 'Assigned user is not a member of this project'));
    }

    const task = await Task.create({
        title,
        description,
        priority: priority || 'medium',
        deadline,
        assignedTo,
        project,
        createdBy: req.user.userId
    });

    const populatedTask = await Task.findById(task._id).populate(populateTaskOptions);

    await mongoose.model('Notification').create({
        recipient: assignedTo,
        sender: req.user.userId,
        type: 'task_assigned',
        message: `New task assigned: "${title}" in project "${proj.title}"`,
        link: `/tasks`
    });

    res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: populatedTask
    });
});

export const getAllTasks = asyncHandler(async (req, res, next) => {
    let query = {};

    if (req.user.role === 'admin') {
        const projects = await Project.find({ createdBy: req.user.userId }).select('_id');
        const projectIds = projects.map(p => p._id);
        query.project = { $in: projectIds };
    } else if (req.user.role === 'member') {
        query.assignedTo = req.user.userId;
    }

    const tasks = await Task.find(query)
        .populate(populateTaskOptions)
        .sort({ deadline: 1 });

    res.status(200).json({
        success: true,
        message: 'All tasks retrieved successfully',
        data: tasks
    });
});

export const getProjectTasks = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return next(new ApiError(400, 'Invalid project ID'));
    }

    const project = await Project.findById(projectId);
    if (!project) {
        return next(new ApiError(404, 'Project not found'));
    }

    let query = { project: projectId };

    if (req.user.role === 'admin') {
        if (project.createdBy.toString() !== req.user.userId) {
            return next(new ApiError(403, 'Not authorized to view tasks for this project'));
        }
    } else if (req.user.role === 'member') {
        query.assignedTo = req.user.userId;
    }

    const tasks = await Task.find(query)
        .populate(populateTaskOptions)
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: 'Project tasks retrieved successfully',
        data: tasks
    });
});

export const getSingleTask = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid task ID'));
    }

    const task = await Task.findById(id).populate(populateTaskOptions);

    if (!task) {
        return next(new ApiError(404, 'Task not found'));
    }

    if (req.user.role === 'admin') {
        if (task.project.createdBy.toString() !== req.user.userId) {
            return next(new ApiError(403, 'Not authorized to view this task'));
        }
    } else if (req.user.role === 'member') {
        if (task.assignedTo._id.toString() !== req.user.userId) {
            return next(new ApiError(403, 'Not authorized to view this task'));
        }
    }

    res.status(200).json({
        success: true,
        message: 'Task retrieved successfully',
        data: task
    });
});

export const updateTaskStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid task ID'));
    }

    if (!['todo', 'in-progress', 'review', 'completed'].includes(status)) {
        return next(new ApiError(400, 'Invalid status value'));
    }

    const task = await Task.findById(id);

    if (!task) {
        return next(new ApiError(404, 'Task not found'));
    }

    if (req.user.role === 'member') {
        if (task.assignedTo.toString() !== req.user.userId) {
            return next(new ApiError(403, 'Not authorized to update this task'));
        }
    } else if (req.user.role === 'admin') {
        const proj = await Project.findById(task.project);
        if (proj.createdBy.toString() !== req.user.userId) {
            return next(new ApiError(403, 'Not authorized to update status of this task'));
        }
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(id).populate(populateTaskOptions);

    if (status === 'completed') {
        const proj = await Project.findById(task.project);
        await mongoose.model('Notification').create({
            recipient: proj.createdBy,
            sender: req.user.userId,
            type: 'task_completed',
            message: `Task completed: "${task.title}" by ${req.user.name}`,
            link: `/projects/${task.project}`
        });
    }

    res.status(200).json({
        success: true,
        message: 'Task status updated successfully',
        data: updatedTask
    });
});

export const updateTask = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, priority, deadline, assignedTo, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid task ID'));
    }

    const task = await Task.findById(id);
    if (!task) {
        return next(new ApiError(404, 'Task not found'));
    }

    const proj = await Project.findById(task.project);
    if (proj.createdBy.toString() !== req.user.userId) {
        return next(new ApiError(403, 'Not authorized to update this task'));
    }

    if (assignedTo) {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
            return next(new ApiError(400, 'Invalid assignedTo user ID'));
        }
        const user = await User.findById(assignedTo);
        if (!user) {
            return next(new ApiError(404, 'Assigned user not found'));
        }
        if (!proj.members.includes(assignedTo)) {
            return next(new ApiError(400, 'Assigned user is not a member of this project'));
        }
        task.assignedTo = assignedTo;
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) {
        if (!['low', 'medium', 'high'].includes(priority)) {
            return next(new ApiError(400, 'Invalid priority value'));
        }
        task.priority = priority;
    }
    if (deadline) task.deadline = deadline;
    if (status) {
        if (!['todo', 'in-progress', 'review', 'completed'].includes(status)) {
            return next(new ApiError(400, 'Invalid status value'));
        }
        task.status = status;
    }

    await task.save();

    const updatedTask = await Task.findById(id).populate(populateTaskOptions);

    res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask
    });
});

export const deleteTask = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid task ID'));
    }

    const task = await Task.findById(id);
    if (!task) {
        return next(new ApiError(404, 'Task not found'));
    }

    const proj = await Project.findById(task.project);
    if (proj.createdBy.toString() !== req.user.userId) {
        return next(new ApiError(403, 'Not authorized to delete this task'));
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: null
    });
});
