/**
 * Current user profile and stats.
 */
const pool = require('../config/db');
const { regenLivesIfNeeded } = require('../middleware/regenLives');
const { formatUser } = require('./authController');

async function getMe(req, res, next) {
  try {
    await regenLivesIfNeeded(req.user.userId);
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [req.user.userId]);
    if (!rows.length) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    const u = rows[0];
    delete u.password_hash;

    const stats = await fetchUserStats(req.user.userId);
    res.json({ user: { ...formatUser(u), ...stats } });
  } catch (e) {
    next(e);
  }
}

async function patchMe(req, res, next) {
  try {
    const { displayName, avatar, title } = req.body;
    const updates = [];
    const vals = [];
    if (displayName !== undefined) {
      updates.push('display_name = ?');
      vals.push(displayName);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      vals.push(avatar);
    }
    if (title !== undefined) {
      updates.push('title = ?');
      vals.push(title);
    }
    if (!updates.length) {
      return getMe(req, res, next);
    }
    vals.push(req.user.userId);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, vals);
    return getMe(req, res, next);
  } catch (e) {
    next(e);
  }
}

async function getStats(req, res, next) {
  try {
    await regenLivesIfNeeded(req.user.userId);
    const stats = await fetchUserStats(req.user.userId);
    res.json(stats);
  } catch (e) {
    next(e);
  }
}

async function fetchUserStats(userId) {
  const [[u]] = await pool.query(`SELECT * FROM users WHERE id = ?`, [userId]);
  const [[{ qc }]] = await pool.query(
    `SELECT COUNT(*) AS qc FROM quest_progress WHERE user_id = ? AND status = 'COMPLETED'`,
    [userId]
  );
  const [[{ cc }]] = await pool.query(
    `SELECT COUNT(*) AS cc FROM challenge_attempts WHERE user_id = ? AND is_correct = TRUE`,
    [userId]
  );
  const [[{ att }]] = await pool.query(
    `SELECT COUNT(*) AS att FROM challenge_attempts WHERE user_id = ?`,
    [userId]
  );
  const accuracy = att > 0 ? Math.round((cc / att) * 100) : 0;
  const [[{ ac }]] = await pool.query(
    `SELECT COUNT(*) AS ac FROM user_achievements WHERE user_id = ?`,
    [userId]
  );

  const categoryProgress = {};
  const cats = [
    'MICROECONOMICS',
    'MACROECONOMICS',
    'PERSONAL_FINANCE',
    'BEHAVIORAL_ECONOMICS',
  ];
  for (const c of cats) {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM quests WHERE category = ? AND is_active = TRUE`,
      [c]
    );
    const [[{ done }]] = await pool.query(
      `SELECT COUNT(*) AS done FROM quest_progress qp
       JOIN quests q ON q.id = qp.quest_id
       WHERE qp.user_id = ? AND qp.status = 'COMPLETED' AND q.category = ?`,
      [userId, c]
    );
    const key =
      c === 'MICROECONOMICS'
        ? 'micro'
        : c === 'MACROECONOMICS'
          ? 'macro'
          : c === 'PERSONAL_FINANCE'
            ? 'personalFinance'
            : 'behavioral';
    categoryProgress[key] = total > 0 ? Math.round((done / total) * 100) : 0;
  }

  return {
    totalXp: u.total_xp,
    questsCompleted: qc,
    challengesSolved: cc,
    accuracy,
    currentStreak: u.streak,
    achievementsUnlocked: ac,
    categoryProgress,
  };
}

/**
 * Recent activity feed for dashboard (quests completed + achievements).
 */
async function getActivity(req, res, next) {
  try {
    const userId = req.user.userId;
    const [quests] = await pool.query(
      `SELECT q.title, qp.stars, qp.completed_at AS ts
       FROM quest_progress qp
       JOIN quests q ON q.id = qp.quest_id
       WHERE qp.user_id = ? AND qp.status = 'COMPLETED' AND qp.completed_at IS NOT NULL
       ORDER BY qp.completed_at DESC
       LIMIT 8`,
      [userId]
    );
    const [ach] = await pool.query(
      `SELECT a.name, a.icon, ua.unlocked_at AS ts
       FROM user_achievements ua
       JOIN achievements a ON a.id = ua.achievement_id
       WHERE ua.user_id = ?
       ORDER BY ua.unlocked_at DESC
       LIMIT 8`,
      [userId]
    );
    const items = [
      ...quests.map((r) => ({
        type: 'quest',
        title: r.title,
        stars: r.stars,
        ts: r.ts,
      })),
      ...ach.map((r) => ({
        type: 'achievement',
        name: r.name,
        icon: r.icon,
        ts: r.ts,
      })),
    ]
      .sort((a, b) => new Date(b.ts) - new Date(a.ts))
      .slice(0, 5);
    res.json({ activity: items });
  } catch (e) {
    next(e);
  }
}

module.exports = { getMe, patchMe, getStats, fetchUserStats, getActivity };
