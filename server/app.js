/**
 * EconQuest API entry point.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pool = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const questRoutes = require('./routes/questRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const shopRoutes = require('./routes/shopRoutes');
const achievementRoutes = require('./routes/achievementRoutes');

const app = express();
const PORT = process.env.PORT || 3001;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/achievements', achievementRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use(errorHandler);

async function start() {
  try {
    await pool.query('SELECT 1');
    // eslint-disable-next-line no-console
    console.log('MySQL connected');
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`EconQuest API listening on http://localhost:${PORT}`);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Database connection failed. Check server/.env and MySQL.', e.message);
    process.exit(1);
  }
}

start();
