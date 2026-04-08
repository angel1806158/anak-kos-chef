const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const History = sequelize.define('History', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:    { type: DataTypes.INTEGER, allowNull: false },
  recipeId:  { type: DataTypes.INTEGER, allowNull: false },
  visitedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'histories',
  timestamps: false,
});

module.exports = History;
