import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';

export const globalSearch = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
        return res.status(200).json({
            success: true,
            data: { projects: [], tasks: [], members: [] }
        });
    }

    const searchRegex = new RegExp(q, 'i');

    const [projects, tasks, members] = await Promise.all([
        Project.find({
            $or: [
                { title: searchRegex },
                { description: searchRegex }
            ]
        }).limit(5).select('title _id'),

        Task.find({
            $or: [
                { title: searchRegex },
                { description: searchRegex }
            ]
        }).limit(5).select('title _id status'),

        User.find({
            $or: [
                { name: searchRegex },
                { email: searchRegex }
            ]
        }).limit(5).select('name _id email role')
    ]);

    res.status(200).json({
        success: true,
        data: {
            projects,
            tasks,
            members
        }
    });
});
