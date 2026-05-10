import express from 'express';
import {
    createTask,
    getProjectTasks,
    getSingleTask,
    updateTaskStatus,
    updateTask,
    deleteTask
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('admin'), createTask);
router.get('/project/:projectId', getProjectTasks);
router.get('/:id', getSingleTask);
router.patch('/:id/status', authorizeRoles('member'), updateTaskStatus);
router.put('/:id', authorizeRoles('admin'), updateTask);
router.delete('/:id', authorizeRoles('admin'), deleteTask);

export default router;
