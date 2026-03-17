const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models/index');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const columnRoutes = require('./routes/columns');
const uploadRoutes = require('./routes/upload');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/upload', uploadRoutes);

// Socket.io — real-time collaboration
const activeUsers = new Map(); // socketId -> { userId, userName, boardId }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-board', ({ userId, userName, boardId }) => {
    socket.join(boardId);
    activeUsers.set(socket.id, { userId, userName, boardId });
    // Notify others in board
    socket.to(boardId).emit('user-joined', { userId, userName });
    // Send current active users list
    const boardUsers = [...activeUsers.values()].filter(u => u.boardId === boardId);
    io.to(boardId).emit('active-users', boardUsers);
  });

  socket.on('task-created', (data) => {
    socket.to(data.boardId).emit('task-created', data.task);
  });

  socket.on('task-updated', (data) => {
    socket.to(data.boardId).emit('task-updated', data.task);
  });

  socket.on('task-moved', (data) => {
    socket.to(data.boardId).emit('task-moved', data);
  });

  socket.on('task-deleted', (data) => {
    socket.to(data.boardId).emit('task-deleted', data);
  });

  socket.on('column-created', (data) => {
    socket.to(data.boardId).emit('column-created', data.column);
  });

  socket.on('user-typing', (data) => {
    socket.to(data.boardId).emit('user-typing', data);
  });

  socket.on('cursor-move', (data) => {
    socket.to(data.boardId).emit('cursor-move', data);
  });

  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.to(user.boardId).emit('user-left', { userId: user.userId });
      activeUsers.delete(socket.id);
      const boardUsers = [...activeUsers.values()].filter(u => u.boardId === user.boardId);
      io.to(user.boardId).emit('active-users', boardUsers);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('DB sync failed:', err));