require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { sequelize } = require('./models');
const seedRecipes   = require('./seeders/recipes');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/recipes',  require('./routes/recipes'));
app.use('/api/favorites',require('./routes/favorites'));
app.use('/api/history',  require('./routes/history'));
app.use('/api/ratings',  require('./routes/ratings'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/comments', require('./routes/comments'));

// ─── Start ───────────────────────────────────────────────────
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ Database tersinkronisasi');
    await seedRecipes();
    app.listen(PORT, () => console.log(`✅ Server berjalan di http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Gagal koneksi database:', err.message);
    process.exit(1);
  });
