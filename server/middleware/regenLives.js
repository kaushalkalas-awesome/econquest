/**
 * Regenerate lives: +1 per full 30 minutes since last incorrect challenge attempt (max 5).
 */
const pool = require('../config/db');

async function regenLivesIfNeeded(userId) {
  const [users] = await pool.query(
    `SELECT id, lives FROM users WHERE id = ?`,
    [userId]
  );
  if (!users.length) return;
  let lives = users[0].lives;
  if (lives >= 5) return;

  const [wrong] = await pool.query(
    `SELECT MAX(attempted_at) AS last_wrong
     FROM challenge_attempts
     WHERE user_id = ? AND is_correct = FALSE`,
    [userId]
  );
  const lastWrong = wrong[0]?.last_wrong;
  if (!lastWrong) return;

  const ms = Date.now() - new Date(lastWrong).getTime();
  if (ms < 0) return;
  const gained = Math.floor(ms / (30 * 60 * 1000));
  if (gained <= 0) return;
  const newLives = Math.min(5, lives + gained);
  if (newLives !== lives) {
    await pool.query(`UPDATE users SET lives = ? WHERE id = ?`, [newLives, userId]);
  }
}

module.exports = { regenLivesIfNeeded };
