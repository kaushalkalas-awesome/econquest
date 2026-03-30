/**
 * Achievements list and server-side progress check.
 */
const pool = require('../config/db');
const { addXpToUser } = require('../utils/game');

const REQ = {
  QUESTS_COMPLETED: 'quests_completed',
  CHALLENGES_COMPLETED: 'challenges_completed',
  STREAK: 'streak',
  COINS: 'coins',
  ITEMS_PURCHASED: 'items_purchased',
  ACHIEVEMENTS_UNLOCKED: 'achievements_unlocked',
  PERFECT_QUEST: 'perfect_quest',
  THREE_STAR_QUEST: 'three_star_quest',
  CORRECT_STREAK: 'correct_streak',
  FAST_ANSWER: 'fast_answer',
};

async function getUserAchievementStats(userId) {
  const [[u]] = await pool.query(`SELECT coins, streak FROM users WHERE id = ?`, [userId]);
  const [[{ qc }]] = await pool.query(
    `SELECT COUNT(*) AS qc FROM quest_progress WHERE user_id = ? AND status = 'COMPLETED'`,
    [userId]
  );
  const [[{ cc }]] = await pool.query(
    `SELECT COUNT(*) AS cc FROM challenge_attempts WHERE user_id = ? AND is_correct = TRUE`,
    [userId]
  );
  const [[{ ip }]] = await pool.query(
    `SELECT COUNT(*) AS ip FROM user_inventory WHERE user_id = ?`,
    [userId]
  );
  const [[{ au }]] = await pool.query(
    `SELECT COUNT(*) AS au FROM user_achievements WHERE user_id = ?`,
    [userId]
  );
  const [[{ pq }]] = await pool.query(
    `SELECT COUNT(*) AS pq FROM quest_progress WHERE user_id = ? AND status = 'COMPLETED' AND best_score >= 100`,
    [userId]
  );
  const [[{ tq }]] = await pool.query(
    `SELECT COUNT(*) AS tq FROM quest_progress WHERE user_id = ? AND stars = 3`,
    [userId]
  );

  const [attempts] = await pool.query(
    `SELECT is_correct FROM challenge_attempts WHERE user_id = ? ORDER BY id ASC`,
    [userId]
  );
  let maxRun = 0;
  let run = 0;
  for (const a of attempts) {
    if (a.is_correct) {
      run += 1;
      maxRun = Math.max(maxRun, run);
    } else {
      run = 0;
    }
  }

  const [[{ fa }]] = await pool.query(
    `SELECT COUNT(*) AS fa FROM challenge_attempts WHERE user_id = ? AND is_correct = TRUE AND time_spent < 5`,
    [userId]
  );

  const [[{ totalQuests }]] = await pool.query(`SELECT COUNT(*) AS totalQuests FROM quests`);

  return {
    quests_completed: qc,
    challenges_completed: cc,
    streak: u.streak,
    coins: u.coins,
    items_purchased: ip,
    achievements_unlocked: au,
    perfect_quest: pq,
    three_star_quest: tq,
    correct_streak: maxRun,
    fast_answer: fa,
    total_quests: totalQuests,
  };
}

function meetsRequirement(stats, requirementType, requirementValue) {
  const v = requirementValue;
  switch (requirementType) {
    case REQ.QUESTS_COMPLETED:
      return stats.quests_completed >= v;
    case REQ.CHALLENGES_COMPLETED:
      return stats.challenges_completed >= v;
    case REQ.STREAK:
      return stats.streak >= v;
    case REQ.COINS:
      return stats.coins >= v;
    case REQ.ITEMS_PURCHASED:
      return stats.items_purchased >= v;
    case REQ.ACHIEVEMENTS_UNLOCKED:
      return stats.achievements_unlocked >= v;
    case REQ.PERFECT_QUEST:
      return stats.perfect_quest >= v;
    case REQ.THREE_STAR_QUEST:
      return stats.three_star_quest >= v;
    case REQ.CORRECT_STREAK:
      return stats.correct_streak >= v;
    case REQ.FAST_ANSWER:
      return stats.fast_answer >= v;
    default:
      return false;
  }
}

/**
 * Unlock new achievements; grant/rewards. Uses pool (new connection each call).
 */
async function runAchievementCheck(userId) {
  const stats = await getUserAchievementStats(userId);
  const [all] = await pool.query(`SELECT * FROM achievements ORDER BY id`);
  const [have] = await pool.query(
    `SELECT achievement_id FROM user_achievements WHERE user_id = ?`,
    [userId]
  );
  const haveSet = new Set(have.map((h) => h.achievement_id));

  const unlocked = [];
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const a of all) {
      if (haveSet.has(a.id)) continue;
      let ok = meetsRequirement(stats, a.requirement_type, a.requirement_value);

      if (a.name === 'Professor' && a.requirement_type === REQ.QUESTS_COMPLETED) {
        ok = stats.quests_completed >= stats.total_quests && stats.total_quests > 0;
      }

      if (ok) {
        await conn.query(
          `INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)`,
          [userId, a.id]
        );
        await conn.query(`UPDATE users SET coins = coins + ? WHERE id = ?`, [a.coin_reward, userId]);
        if (a.xp_reward > 0) {
          await addXpToUser(conn, userId, a.xp_reward);
        }
        haveSet.add(a.id);
        unlocked.push({
          id: a.id,
          name: a.name,
          icon: a.icon,
          xpReward: a.xp_reward,
          coinReward: a.coin_reward,
        });
      }
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  return unlocked;
}

async function listAchievements(req, res, next) {
  try {
    const userId = req.user.userId;
    const stats = await getUserAchievementStats(userId);
    const [all] = await pool.query(`SELECT * FROM achievements ORDER BY id`);
    const [ua] = await pool.query(
      `SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ?`,
      [userId]
    );
    const uaMap = Object.fromEntries(ua.map((x) => [x.achievement_id, x.unlocked_at]));

    const achievements = all.map((a) => {
      const unlocked = !!uaMap[a.id];
      let progress = null;
      if (!unlocked) {
        const cur =
          a.requirement_type === REQ.QUESTS_COMPLETED
            ? stats.quests_completed
            : a.requirement_type === REQ.CHALLENGES_COMPLETED
              ? stats.challenges_completed
              : a.requirement_type === REQ.STREAK
                ? stats.streak
                : a.requirement_type === REQ.COINS
                  ? stats.coins
                  : a.requirement_type === REQ.ITEMS_PURCHASED
                    ? stats.items_purchased
                    : a.requirement_type === REQ.ACHIEVEMENTS_UNLOCKED
                      ? stats.achievements_unlocked
                      : a.requirement_type === REQ.THREE_STAR_QUEST
                        ? stats.three_star_quest
                        : a.requirement_type === REQ.CORRECT_STREAK
                          ? stats.correct_streak
                          : a.requirement_type === REQ.FAST_ANSWER
                            ? stats.fast_answer
                            : null;
        if (cur !== null && a.requirement_value > 0) {
          progress = Math.min(100, Math.round((cur / a.requirement_value) * 100));
        }
      }
      return {
        ...a,
        unlocked,
        unlockedAt: uaMap[a.id] || null,
        progress,
      };
    });

    res.json({ achievements });
  } catch (e) {
    next(e);
  }
}

async function checkEndpoint(req, res, next) {
  try {
    const newAchievements = await runAchievementCheck(req.user.userId);
    res.json({ newAchievements });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listAchievements,
  checkEndpoint,
  runAchievementCheck,
  getUserAchievementStats,
  REQ,
};
