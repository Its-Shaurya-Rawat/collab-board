const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Column = sequelize.define('Column', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  icon: { type: DataTypes.STRING, defaultValue: '○' },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  boardId: { type: DataTypes.STRING, defaultValue: 'main' },
});

module.exports = Column;