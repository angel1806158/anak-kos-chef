const express  = require('express');
const router   = express.Router();
const { Rating } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// GET ratings - hanya untuk user login
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rows = await Rating.findAll({
      where:      { userId: req.user.id },
      attributes: ['recipeId', 'star'],
    });
    const map = {};
    rows.forEach((r) => { map[r.recipeId] = r.star; });
    res.json(map);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST rating - user login wajib agar tersimpan, tamu => 200 tanpa simpan
router.post('/:recipeId', async (req, res) => {
  try {
    // Coba ambil user dari token
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded.id;
      } catch {}
    }

    const recipeId = parseInt(req.params.recipeId);
    const { star } = req.body;

    // Jika tamu, kembalikan success tanpa simpan ke DB
    if (!userId) {
      return res.json({ ok: true, star, guest: true });
    }

    if (star === 0 || star === null) {
      await Rating.destroy({ where: { userId, recipeId } });
      return res.json({ ok: true, removed: true });
    }

    if (!star || star < 1 || star > 5)
      return res.status(400).json({ error: 'Star harus antara 1-5' });

    const [rating, created] = await Rating.findOrCreate({
      where:    { userId, recipeId },
      defaults: { star },
    });
    if (!created) await rating.update({ star });
    res.json({ ok: true, star });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
