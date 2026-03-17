const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/email');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const colors = ['#7c5cfc','#22d3a5','#f59e0b','#ec4899','#3b82f6','#f87171'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const user = await User.create({ name, email, password: hashed, color });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, color: user.color }, process.env.JWT_SECRET, { expiresIn: '7d' });
    try { await sendWelcomeEmail({ toEmail: email, toName: name }); } catch (e) { console.log('Email failed:', e.message); }
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, color: user.color } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, color: user.color }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, color: user.color } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', require('../middleware/auth'), async (req, res) => {
  const users = await User.findAll({ attributes: ['id','name','email','color','avatar'] });
  res.json(users);
});

module.exports = router;