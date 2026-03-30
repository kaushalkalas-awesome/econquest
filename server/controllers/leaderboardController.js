/**
 * Global / weekly leaderboard.
 */
const pool = require('../config/db');

async function getLeaderboard(req, res, next) {
  try {
    const type = (req.query.type || 'global').toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    let leaderboard;

    if (type === 'weekly') {
      const [rows] = await pool.query(
        `SELECT u.id AS userId, u.username, u.display_name AS displayName, u.avatar, u.level,
                u.streak,
                COALESCE(SUM(ca.xp_earned), 0) AS totalXp,
                (SELECT COUNT(*) FROM quest_progress qp WHERE qp.user_id = u.id AND qp.status = 'COMPLETED') AS questsCompleted
         FROM users u
         LEFT JOIN challenge_attempts ca ON ca.user_id = u.id AND ca.attempted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         GROUP BY u.id, u.username, u.display_name, u.avatar, u.level, u.streak
         ORDER BY totalXp DESC
         LIMIT ?`,
        [limit]
      );
      leaderboard = rows.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        username: r.username,
        displayName: r.displayName,
        avatar: r.avatar,
        level: r.level,
        totalXp: Number(r.totalXp),
        questsCompleted: r.questsCompleted,
        streak: r.streak,
      }));
    } else {
      const [rows] = await pool.query(
        `SELECT u.id AS userId, u.username, u.display_name AS displayName, u.avatar, u.level,
                u.total_xp AS totalXp, u.streak,
                (SELECT COUNT(*) FROM quest_progress qp WHERE qp.user_id = u.id AND qp.status = 'COMPLETED') AS questsCompleted
         FROM users u
         ORDER BY u.total_xp DESC
         LIMIT ?`,
        [limit]
      );
      leaderboard = rows.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        username: r.username,
        displayName: r.displayName,
        avatar: r.avatar,
        level: r.level,
        totalXp: r.totalXp,
        questsCompleted: r.questsCompleted,
        streak: r.streak,
      }));
    }

    const userId = req.user.userId;

    let currentUserRank = 1;
    if (type === 'weekly') {
      const [[myXp]] = await pool.query(
        `SELECT COALESCE(SUM(xp_earned), 0) AS xp FROM challenge_attempts
         WHERE user_id = ? AND attempted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
        [userId]
      );
      const [better] = await pool.query(
        `SELECT u.id FROM users u
         LEFT JOIN challenge_attempts ca ON ca.user_id = u.id AND ca.attempted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         GROUP BY u.id
         HAVING COALESCE(SUM(ca.xp_earned), 0) > ?`,
        [myXp.xp]
      );
      currentUserRank = better.length + 1;
    } else {
      const [[me]] = await pool.query(`SELECT total_xp FROM users WHERE id = ?`, [userId]);
      const [ranks] = await pool.query(
        `SELECT COUNT(*) + 1 AS rk FROM users WHERE total_xp > ?`,
        [me.total_xp]
      );
      currentUserRank = ranks[0]?.rk ?? 1;
    }

    res.json({ leaderboard, currentUserRank });
  } catch (e) {
    next(e);
  }
}

module.exports = { getLeaderboard };
