const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendTaskAssignedEmail } = require('../utils/email');

router.get('/', auth, async (req, res) => {
  const { boardId = 'main' } = req.query;
  const tasks = await Task.findAll({ where: { boardId }, order: [['order','ASC']] });
  res.json(tasks);
});

router.post('/', auth, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, boardId: req.body.boardId || 'main' });
    // Email notification for assignee
    if (req.body.assigneeId && req.body.assigneeId !== req.user.id) {
      try {
        const assignee = await User.findByPk(req.body.assigneeId);
        const assigner = await User.findByPk(req.user.id);
        if (assignee) {
          await sendTaskAssignedEmail({
            toEmail: assignee.email, toName: assignee.name,
            taskTitle: task.title, assignerName: assigner.name,
            boardUrl: process.env.CLIENT_URL
          });
        }
      } catch (e) { console.log('Email failed:', e.message); }
    }
    req.app.get('io').to(task.boardId).emit('task-created', task);
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.update(req.body);
    req.app.get('io').to(task.boardId).emit('task-updated', task);
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/move', auth, async (req, res) => {
  try {
    const { columnId, order, boardId } = req.body;
    const task = await Task.findByPk(req.params.id);
    await task.update({ columnId, order });
    req.app.get('io').to(boardId || 'main').emit('task-moved', { taskId: task.id, columnId, order });
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/comment', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    const comment = { id: Date.now(), userId: req.user.id, userName: req.user.name, text: req.body.text, createdAt: new Date() };
    const comments = [...(task.comments || []), comment];
    await task.update({ comments });
    req.app.get('io').to(task.boardId).emit('task-updated', { ...task.toJSON(), comments });
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    const boardId = task.boardId;
    await task.destroy();
    req.app.get('io').to(boardId).emit('task-deleted', { taskId: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;