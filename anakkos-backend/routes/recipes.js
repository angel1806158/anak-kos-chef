const express = require('express');
const router  = express.Router();
const { Recipe } = require('../models');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.category)    where.category    = req.query.category;
    if (req.query.subCategory) where.subCategory = req.query.subCategory;
    if (req.query.level)       where.level       = req.query.level;
    if (req.query.budget)      where.budget      = req.query.budget;
    const recipes = await Recipe.findAll({ where, order: [['id', 'ASC']] });
    res.json(recipes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Resep tidak ditemukan' });
    res.json(recipe);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const {
      title, image, prepTime, prepTimeMinutes,
      category, subCategory, level, budget, cost, priceLabel,
      ingredients, instructions,
    } = req.body;
    if (!title) return res.status(400).json({ error: 'Nama resep wajib diisi' });
    const recipe = await Recipe.create({
      title, image, prepTime, prepTimeMinutes,
      category, subCategory, level, budget, cost, priceLabel,
      ingredients, instructions,
    });
    res.status(201).json(recipe);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Resep tidak ditemukan' });
    const {
      title, image, prepTime, prepTimeMinutes,
      category, subCategory, level, budget, cost, priceLabel,
      ingredients, instructions,
    } = req.body;
    await recipe.update({
      title, image, prepTime, prepTimeMinutes,
      category, subCategory, level, budget, cost, priceLabel,
      ingredients, instructions,
    });
    res.json(recipe);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Resep tidak ditemukan' });
    await recipe.destroy();
    res.json({ ok: true, message: 'Resep berhasil dihapus' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
