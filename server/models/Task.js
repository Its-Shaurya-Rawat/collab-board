const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
  label: { type: DataTypes.STRING },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 },
  dueDate: { type: DataTypes.STRING },
  assigneeId: { type: DataTypes.UUID },
  columnId: { type: DataTypes.UUID, allowNull: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  boardId: { type: DataTypes.STRING, defaultValue: 'main' },
  attachments: { type: DataTypes.JSONB, defaultValue: [] },
  comments: { type: DataTypes.JSONB, defaultValue: [] },
});

module.exports = Task;