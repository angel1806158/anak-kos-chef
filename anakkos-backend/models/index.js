const sequelize = require('../config/database');
const User      = require('./User');
const Recipe    = require('./Recipe');
const Favorite  = require('./Favorite');
const History   = require('./History');
const Rating    = require('./Rating');
const Comment   = require('./Comment');

// ─── Associations ────────────────────────────────────────────

// Favorite: User ↔ Recipe
User.hasMany(Favorite,   { foreignKey: 'userId',   onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

Recipe.hasMany(Favorite,   { foreignKey: 'recipeId', onDelete: 'CASCADE' });
Favorite.belongsTo(Recipe, { foreignKey: 'recipeId' });

// History: User → Recipe
User.hasMany(History,   { foreignKey: 'userId',   onDelete: 'CASCADE' });
History.belongsTo(User, { foreignKey: 'userId' });

Recipe.hasMany(History,   { foreignKey: 'recipeId', onDelete: 'CASCADE' });
History.belongsTo(Recipe, { foreignKey: 'recipeId' });

// Rating: User → Recipe
User.hasMany(Rating,   { foreignKey: 'userId',   onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'userId' });

Recipe.hasMany(Rating,   { foreignKey: 'recipeId', onDelete: 'CASCADE' });
Rating.belongsTo(Recipe, { foreignKey: 'recipeId' });

// Comment: User → Recipe (nullable userId for guests)
Recipe.hasMany(Comment,   { foreignKey: 'recipeId', onDelete: 'CASCADE' });
Comment.belongsTo(Recipe, { foreignKey: 'recipeId' });

User.hasMany(Comment,   { foreignKey: 'userId', onDelete: 'SET NULL' });
Comment.belongsTo(User, { foreignKey: 'userId', constraints: false });

module.exports = { sequelize, User, Recipe, Favorite, History, Rating, Comment };
