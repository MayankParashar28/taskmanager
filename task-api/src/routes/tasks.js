const express = require('express');
const router = express.Router();
const taskService = require('../services/taskService');
const {
  validateAssignee,
  validateCreateTask,
  validatePagination,
  validateStatus,
  validateUpdateTask,
} = require('../utils/validators');

router.get('/stats', (req, res) => {
  const stats = taskService.getStats();
  res.json(stats);
});

router.get('/', (req, res) => {
  const { status, page, limit } = req.query;

  if (status) {
    const statusError = validateStatus(status);
    if (statusError) {
      return res.status(400).json({ error: statusError });
    }

    const tasks = taskService.getByStatus(status);
    return res.json(tasks);
  }

  if (page !== undefined || limit !== undefined) {
    const paginationError = validatePagination(page, limit);
    if (paginationError) {
      return res.status(400).json({ error: paginationError });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const tasks = taskService.getPaginated(pageNum, limitNum);
    return res.json(tasks);
  }

  const tasks = taskService.getAll();
  res.json(tasks);
});

router.post('/', (req, res) => {
  const error = validateCreateTask(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  if (taskService.existsDuplicate(req.body)) {
    return res.status(409).json({ error: 'Task already exists' });
  }

  const task = taskService.create(req.body);
  res.status(201).json(task);
});

router.get('/:id', (req, res) => {
  const task = taskService.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

router.put('/:id', (req, res) => {
  const error = validateUpdateTask(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const existingTask = taskService.findById(req.params.id);
  if (!existingTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (existingTask.status === 'done') {
    return res.status(409).json({ error: 'Completed tasks cannot be updated' });
  }

  const task = taskService.update(req.params.id, req.body);
  res.json(task);
});

router.delete('/:id', (req, res) => {
  const deleted = taskService.remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(204).send();
});

router.patch('/:id/complete', (req, res) => {
  const task = taskService.completeTask(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

router.patch('/:id/assign', (req, res) => {
  const error = validateAssignee(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const task = taskService.assignTask(req.params.id, req.body.assignee.trim());
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

module.exports = router;
