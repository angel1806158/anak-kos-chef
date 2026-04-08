const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const User = sequelize.define('User', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING,  allowNull: false },
  identifier:  { type: DataTypes.STRING,  allowNull: false, unique: true },
  password:    { type: DataTypes.STRING,  allowNull: false },
  role:        { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  avatar:      { type: DataTypes.STRING },
  avatarColor: { type: DataTypes.STRING },
}, {
  tableName:  'users',
  timestamps: true,
});

module.exports = User;
