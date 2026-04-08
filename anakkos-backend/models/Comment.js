const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const Comment = sequelize.define('Comment', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  recipeId: { type: DataTypes.INTEGER, allowNull: false },
  userId:   { type: DataTypes.INTEGER, allowNull: true },  // null = tamu
  guestName:{ type: DataTypes.STRING,  allowNull: true },
  content:  { type: DataTypes.TEXT,    allowNull: false },
  adminReply:{ type: DataTypes.TEXT,   allowNull: true },
}, {
  tableName:  'comments',
  timestamps: true,
});

module.exports = Comment;
