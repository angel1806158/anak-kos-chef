const express  = require('express');
const router   = express.Router();
const { Comment, User } = require('../models');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET /api/comments/:recipeId - ambil semua komentar resep (public)
router.get('/:recipeId', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { recipeId: parseInt(req.params.recipeId) },
      include: [{ model: User, attributes: ['name'], required: false }],
      order: [['createdAt', 'DESC']],
    });
    const result = comments.map((c) => ({
      id:         c.id,
      content:    c.content,
      adminReply: c.adminReply,
      guestName:  c.guestName,
      userName:   c.User?.name || c.guestName || 'Tamu',
      createdAt:  c.createdAt,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/comments/:recipeId - kirim komentar (public, tamu boleh)
router.post('/:recipeId', async (req, res) => {
  try {
    const { content, guestName } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Komentar tidak boleh kosong' });

    // Coba ambil userId dari token jika ada
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded.id;
      } catch {}
    }

    const comment = await Comment.create({
      recipeId:  parseInt(req.params.recipeId),
      userId,
      guestName: userId ? null : (guestName?.trim() || 'Tamu'),
      content:   content.trim(),
    });

    // Fetch with user
    const full = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['name'], required: false }],
    });

    res.status(201).json({
      id:         full.id,
      content:    full.content,
      adminReply: full.adminReply,
      guestName:  full.guestName,
      userName:   full.User?.name || full.guestName || 'Tamu',
      createdAt:  full.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/comments/:id/reply - admin reply
router.put('/:id/reply', authMiddleware, adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Komentar tidak ditemukan' });
    await comment.update({ adminReply: req.body.reply });
    res.json({ ok: true, adminReply: req.body.reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/comments/:id - admin delete
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Komentar tidak ditemukan' });
    await comment.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
