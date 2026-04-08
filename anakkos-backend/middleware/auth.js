const jwt = require('jsonwebtoken');

// ─── Verifikasi JWT ──────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan. Silakan login.' });
  }
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
};

// ─── Hanya admin ─────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang diizinkan.' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };
