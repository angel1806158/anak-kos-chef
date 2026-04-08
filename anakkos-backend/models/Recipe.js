const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const Recipe = sequelize.define('Recipe', {
  id:              { type: DataTypes.INTEGER,  primaryKey: true, autoIncrement: true },
  title:           { type: DataTypes.STRING,   allowNull: false },
  image:           { type: DataTypes.STRING },
  prepTime:        { type: DataTypes.STRING },
  prepTimeMinutes: { type: DataTypes.INTEGER },
  category:        { type: DataTypes.STRING },
  subCategory:     { type: DataTypes.STRING },
  level:           { type: DataTypes.STRING },
  budget:          { type: DataTypes.STRING },
  cost:            { type: DataTypes.STRING },
  priceLabel:      { type: DataTypes.STRING, defaultValue: 'tidak ditentukan' },
  ingredients:     { type: DataTypes.JSONB },
  instructions:    { type: DataTypes.JSONB },
}, {
  tableName:  'recipes',
  timestamps: true,
});

module.exports = Recipe;
