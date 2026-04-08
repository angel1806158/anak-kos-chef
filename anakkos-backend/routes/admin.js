const express    = require('express');
const router     = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const { Recipe, User, Favorite, History, Rating } = require('../models');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Semua route admin wajib login + admin role
router.use(authMiddleware, adminOnly);

// ─── GET /api/admin/stats ─────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalRecipes, totalUsers, totalFavorites, totalViews] = await Promise.all([
      Recipe.count(),
      User.count(),
      Favorite.count(),
      History.count(),
    ]);

    const topVisited = await History.findAll({
      attributes: ['recipeId', [fn('COUNT', col('recipeId')), 'views']],
      group:      ['recipeId'],
      order:      [[literal('views'), 'DESC']],
      limit:      5,
      raw:        true,
    });

    const topFavorited = await Favorite.findAll({
      attributes: ['recipeId', [fn('COUNT', col('recipeId')), 'favorites']],
      group:      ['recipeId'],
      order:      [[literal('favorites'), 'DESC']],
      limit:      5,
      raw:        true,
    });

    const topIds     = topVisited.map((r) => r.recipeId);
    const topRecipes = await Recipe.findAll({
      where:      { id: topIds },
      attributes: ['id', 'title', 'image', 'category', 'level'],
    });

    const result = topRecipes.map((recipe) => ({
      id:        recipe.id,
      title:     recipe.title,
      image:     recipe.image,
      category:  recipe.category,
      level:     recipe.level,
      views:     parseInt(topVisited.find((r) => r.recipeId === recipe.id)?.views ?? 0),
      favorites: parseInt(topFavorited.find((r) => r.recipeId === recipe.id)?.favorites ?? 0),
    })).sort((a, b) => b.views - a.views);

    res.json({ totalRecipes, totalUsers, totalFavorites, totalViews, topRecipes: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/recipe-stats ─────────────────────────────
router.get('/recipe-stats', async (req, res) => {
  try {
    const [visitStats, favStats, ratingStats] = await Promise.all([
      History.findAll({
        attributes: ['recipeId', [fn('COUNT', col('recipeId')), 'views']],
        group: ['recipeId'],
        raw:   true,
      }),
      Favorite.findAll({
        attributes: ['recipeId', [fn('COUNT', col('recipeId')), 'favorites']],
        group: ['recipeId'],
        raw:   true,
      }),
      Rating.findAll({
        attributes: [
          'recipeId',
          [fn('AVG', col('star')), 'avgRating'],
          [fn('COUNT', col('star')), 'ratingCount'],
        ],
        group: ['recipeId'],
        raw:   true,
      }),
    ]);

    const totalViews     = visitStats.reduce((s, r) => s + parseInt(r.views),     0) || 1;
    const totalFavorites = favStats.reduce((s, r)   => s + parseInt(r.favorites), 0) || 1;

    const map = {};

    visitStats.forEach((r) => {
      const views = parseInt(r.views);
      map[r.recipeId] = { ...map[r.recipeId], views, visitPct: Math.round((views / totalViews) * 100) };
    });

    favStats.forEach((r) => {
      const fav = parseInt(r.favorites);
      map[r.recipeId] = { ...map[r.recipeId], favorites: fav, savedPct: Math.round((fav / totalFavorites) * 100) };
    });

    ratingStats.forEach((r) => {
      map[r.recipeId] = {
        ...map[r.recipeId],
        avgRating:   Math.round(parseFloat(r.avgRating) * 10) / 10,
        ratingCount: parseInt(r.ratingCount),
      };
    });

    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
