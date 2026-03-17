const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  avatar: { type: DataTypes.STRING, defaultValue: null },
  color: { type: DataTypes.STRING, defaultValue: '#7c5cfc' },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = User;