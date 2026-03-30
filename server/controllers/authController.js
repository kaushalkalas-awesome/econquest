/**
 * Auth: register, login, me.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');
const pool = require('../config/db');
const { updateStreakOnActivity } = require('../utils/game');
const { regenLivesIfNeeded } = require('../middleware/regenLives');

const registerValidators = [
  body('username').trim().isLength({ min: 3, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').trim().notEmpty(),
  body('avatar').optional().isString(),
];

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error(errors.array()[0].msg);
      err.status = 400;
      throw err;
    }

    const { username, email, password, displayName, avatar } = req.body;
    const avatarVal = avatar || 'avatar1';

    const [existing] = await pool.query(
      `SELECT id FROM users WHERE username = ? OR email = ?`,
      [username, email]
    );
    if (existing.length) {
      const err = new Error('Username or email already taken');
      err.status = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let userId;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        `INSERT INTO users (username, email, password_hash, display_name, avatar, title, level, current_xp, total_xp, coins, gems, streak, longest_streak, lives)
         VALUES (?, ?, ?, ?, ?, 'Economics Novice', 1, 0, 0, 100, 5, 0, 0, 5)`,
        [username, email, passwordHash, displayName, avatarVal]
      );
      userId = result.insertId;

      await conn.query(
        `INSERT INTO quest_progress (user_id, quest_id, status)
         SELECT ?, q.id,
           CASE WHEN q.prerequisite_id IS NULL THEN 'AVAILABLE' ELSE 'LOCKED' END
         FROM quests q WHERE q.is_active = TRUE`,
        [userId]
      );

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [userId]);
    const user = rows[0];
    delete user.password_hash;

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: formatUser(user) });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }
    const { email, password } = req.body;
    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!rows.length) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    await regenLivesIfNeeded(user.id);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await updateStreakOnActivity(conn, user.id);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    const [fresh] = await pool.query(`SELECT * FROM users WHERE id = ?`, [user.id]);
    const u = fresh[0];
    delete u.password_hash;
    const token = jwt.sign({ userId: u.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: formatUser(u) });
  } catch (e) {
    next(e);
  }
}

async function me(req, res, next) {
  try {
    await regenLivesIfNeeded(req.user.userId);
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [req.user.userId]);
    if (!rows.length) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    const user = rows[0];
    delete user.password_hash;
    res.json({ user: formatUser(user) });
  } catch (e) {
    next(e);
  }
}

function formatUser(u) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    displayName: u.display_name,
    display_name: u.display_name,
    avatar: u.avatar,
    title: u.title,
    level: u.level,
    currentXp: u.current_xp,
    current_xp: u.current_xp,
    totalXp: u.total_xp,
    total_xp: u.total_xp,
    coins: u.coins,
    gems: u.gems,
    streak: u.streak,
    longestStreak: u.longest_streak,
    longest_streak: u.longest_streak,
    lastActiveDate: u.last_active_date,
    lives: u.lives,
    createdAt: u.created_at,
  };
}

const loginValidators = [body('email').isEmail().normalizeEmail(), body('password').notEmpty()];

module.exports = {
  register,
  login,
  me,
  registerValidators,
  loginValidators,
  formatUser,
};
