const router = require('express').Router();
const auth = require('../middleware/auth');
const Column = require('../models/Column');

router.get('/', auth, async (req, res) => {
  const { boardId = 'main' } = req.query;
  const columns = await Column.findAll({ where: { boardId }, order: [['order','ASC']] });
  if (columns.length === 0) {
    const defaults = [
      { title:'Backlog', icon:'○', order:0, boardId },
      { title:'To Do', icon:'◇', order:1, boardId },
      { title:'In Progress', icon:'◈', order:2, boardId },
      { title:'In Review', icon:'◉', order:3, boardId },
      { title:'Done', icon:'✦', order:4, boardId },
    ];
    const created = await Column.bulkCreate(defaults);
    return res.json(created);
  }
  res.json(columns);
});

router.post('/', auth, async (req, res) => {
  try {
    const column = await Column.create(req.body);
    req.app.get('io').to(column.boardId).emit('column-created', column);
    res.json(column);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  const column = await Column.findByPk(req.params.id);
  await column.update(req.body);
  res.json(column);
});

router.delete('/:id', auth, async (req, res) => {
  await Column.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;