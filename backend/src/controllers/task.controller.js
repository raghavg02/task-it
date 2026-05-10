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

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
export const createTask = asyncHandler(async (req, res, next) => {
    const { title, description, priority, deadline, assignedTo, project } = req.body;

    // Validate required fields
    if (!title || !description || !deadline || !assignedTo || !project) {
        return next(new ApiError(400, 'Please provide all required fields'));
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo) || !mongoose.Types.ObjectId.isValid(project)) {
        return next(new ApiError(400, 'Invalid Object ID for assignedTo or project'));
    }

    // Validate project exists
    const proj = await Project.findById(project);
    if (!proj) {
        return next(new ApiError(404, 'Project not found'));
    }

    // Ensure logged in admin owns the project
    if (proj.createdBy.toString() !== req.user.userId) {
        return next(new ApiError(403, 'Not authorized to add tasks to this project'));
    }

    // Validate assigned user exists
    const user = await User.findById(assignedTo);
    if (!user) {
        return next(new ApiError(404, 'Assigned user not found'));
    }

    // Ensure assigned user is a member of the project
    if (!proj.members.includes(assignedTo)) {
        return next(new ApiError(400, 'Assigned user is not a member of this project'));
    }

    // Create task
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

    res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: populatedTask
    });
});

// @desc    Get project tasks
// @route   GET /api/tasks/project/:projectId
// @access  Private
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
        // Admin gets tasks if they own the project
        if (project.createdBy.toString() !== req.user.userId) {
            return next(new ApiError(403, 'Not authorized to view tasks for this project'));
        }
    } else if (req.user.role === 'member') {
        // Member gets ONLY tasks assigned to them within that project
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

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getSingleTask = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid task ID'));
    }

    const task = await Task.findById(id).populate(populateTaskOptions);

    if (!task) {
        return next(new ApiError(404, 'Task not found'));
    }

    // Access control
    if (req.user.role === 'admin') {
        // Admin can access tasks only from their own projects
        if (task.project.createdBy.toString() !== req.user.userId) {
            return next(new ApiError(403, 'Not authorized to view this task'));
        }
    } else if (req.user.role === 'member') {
        // Member can access only tasks assigned to them
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

// @desc    Update task status (Member only)
// @route   PATCH /api/tasks/:id/status
// @access  Private/Member
export const updateTaskStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid task ID'));
    }

    if (!['todo', 'in-progress', 'completed'].includes(status)) {
        return next(new ApiError(400, 'Invalid status value'));
    }

    const task = await Task.findById(id);

    if (!task) {
        return next(new ApiError(404, 'Task not found'));
    }

    // Member can update ONLY their own task
    if (task.assignedTo.toString() !== req.user.userId) {
        return next(new ApiError(403, 'Not authorized to update this task'));
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(id).populate(populateTaskOptions);

    res.status(200).json({
        success: true,
        message: 'Task status updated successfully',
        data: updatedTask
    });
});

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private/Admin
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

    // Admin can update ONLY tasks from their own projects
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
        if (!['todo', 'in-progress', 'completed'].includes(status)) {
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

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid task ID'));
    }

    const task = await Task.findById(id);
    if (!task) {
        return next(new ApiError(404, 'Task not found'));
    }

    // Admin can delete ONLY tasks from their own projects
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
