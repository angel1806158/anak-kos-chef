const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('Rating', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:   { type: DataTypes.INTEGER, allowNull: false },
  recipeId: { type: DataTypes.INTEGER, allowNull: false },
  star:     { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
}, {
  tableName: 'ratings',
  timestamps: true,
  indexes: [{ unique: true, fields: ['userId', 'recipeId'] }],
});

module.exports = Rating;
