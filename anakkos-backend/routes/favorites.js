const express  = require('express');
const router   = express.Router();
const { Favorite } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// ─── GET /api/favorites — ambil semua favorit user ───────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rows = await Favorite.findAll({
      where:      { userId: req.user.id },
      attributes: ['recipeId'],
    });
    res.json(rows.map((r) => r.recipeId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/favorites/:recipeId — toggle favorit ──────────
router.post('/:recipeId', authMiddleware, async (req, res) => {
  try {
    const userId   = req.user.id;
    const recipeId = parseInt(req.params.recipeId);

    const existing = await Favorite.findOne({ where: { userId, recipeId } });

    if (existing) {
      await existing.destroy();
      res.json({ added: false, recipeId });
    } else {
      await Favorite.create({ userId, recipeId });
      res.json({ added: true, recipeId });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
