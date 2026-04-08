const express  = require('express');
const router   = express.Router();
const { History, Recipe } = require('../models');
const { authMiddleware }  = require('../middleware/auth');

// ─── GET /api/history — ambil riwayat kunjungan (max 20) ─────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rows = await History.findAll({
      where:   { userId: req.user.id },
      order:   [['visitedAt', 'DESC']],
      limit:   20,
      include: [{
        model:      Recipe,
        attributes: ['id', 'title', 'image'],
      }],
    });

    const result = rows.map((r) => ({
      id:        r.Recipe.id,
      title:     r.Recipe.title,
      image:     r.Recipe.image,
      visitedAt: new Date(r.visitedAt).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/history — catat kunjungan resep ───────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.user.id;

    if (!recipeId) return res.status(400).json({ error: 'recipeId wajib diisi' });

    // Hapus entry lama agar tidak duplikat
    await History.destroy({ where: { userId, recipeId } });

    // Buat entry baru
    await History.create({ userId, recipeId, visitedAt: new Date() });

    // Trim: hanya simpan 20 terbaru
    const all = await History.findAll({
      where:      { userId },
      order:      [['visitedAt', 'DESC']],
      attributes: ['id'],
    });
    if (all.length > 20) {
      const idsToDelete = all.slice(20).map((r) => r.id);
      await History.destroy({ where: { id: idsToDelete } });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/history — hapus semua riwayat user ──────────
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await History.destroy({ where: { userId: req.user.id } });
    res.json({ ok: true, message: 'Riwayat berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
