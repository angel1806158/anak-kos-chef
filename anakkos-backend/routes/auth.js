const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { User } = require('../models');

// ─── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, identifier, password } = req.body;

    if (!name || !identifier || !password)
      return res.status(400).json({ error: 'Semua kolom wajib diisi' });

    const existing = await User.findOne({ where: { identifier } });
    if (existing)
      return res.status(400).json({ error: 'Akun sudah terdaftar' });

    const hash     = await bcrypt.hash(password, 10);
    const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2);

    const user = await User.create({
      name,
      identifier,
      password:    hash,
      role:        'user',
      avatar:      initials,
      avatarColor: 'from-orange-400 to-rose-500',
    });

    const token = jwt.sign(
      { id: user.id, name: user.name, identifier: user.identifier, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id:          user.id,
        name:        user.name,
        identifier:  user.identifier,
        role:        user.role,
        avatar:      initials,
        avatarColor: user.avatarColor,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password)
      return res.status(400).json({ error: 'Email/No HP dan password wajib diisi' });

    const user = await User.findOne({ where: { identifier } });
    if (!user)
      return res.status(400).json({ error: 'Akun tidak ditemukan' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ error: 'Password salah' });

    const token = jwt.sign(
      { id: user.id, name: user.name, identifier: user.identifier, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id:          user.id,
        name:        user.name,
        identifier:  user.identifier,
        role:        user.role,
        avatar:      user.avatar,
        avatarColor: user.avatarColor,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
