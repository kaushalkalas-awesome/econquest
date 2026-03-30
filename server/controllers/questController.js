/**
 * Quests list, detail, start, lesson progress, complete.
 */
const pool = require('../config/db');
const { regenLivesIfNeeded } = require('../middleware/regenLives');
const { addXpToUser, starsFromAccuracy, updateStreakOnActivity } = require('../utils/game');
const { runAchievementCheck } = require('./achievementController');

function stripChallenge(c) {
  const { correct_answer, ...rest } = c;
  let options = rest.options;
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options || 'null');
    } catch {
      options = null;
    }
  }
  return { ...rest, options };
}

async function listQuests(req, res, next) {
  try {
    await regenLivesIfNeeded(req.user.userId);
    const [quests] = await pool.query(
      `SELECT q.*,
        qp.status AS progress_status,
        qp.lessons_completed,
        qp.challenges_completed,
        qp.best_score,
        qp.stars,
        qp.started_at,
        qp.completed_at
      FROM quests q
      LEFT JOIN quest_progress qp ON qp.quest_id = q.id AND qp.user_id = ?
      WHERE q.is_active = TRUE
      ORDER BY q.order_index`,
      [req.user.userId]
    );

    const [lessonCounts] = await pool.query(
      `SELECT quest_id, COUNT(*) AS n FROM lessons GROUP BY quest_id`
    );
    const [chalCounts] = await pool.query(
      `SELECT quest_id, COUNT(*) AS n FROM challenges GROUP BY quest_id`
    );
    const lm = Object.fromEntries(lessonCounts.map((r) => [r.quest_id, r.n]));
    const cm = Object.fromEntries(chalCounts.map((r) => [r.quest_id, r.n]));

    const [preTitles] = await pool.query(`SELECT id, title FROM quests`);
    const titleById = Object.fromEntries(preTitles.map((p) => [p.id, p.title]));

    const questsOut = quests.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      difficulty: q.difficulty,
      orderIndex: q.order_index,
      xpReward: q.xp_reward,
      coinReward: q.coin_reward,
      iconEmoji: q.icon_emoji,
      prerequisiteId: q.prerequisite_id,
      prerequisiteTitle: q.prerequisite_id ? titleById[q.prerequisite_id] : null,
      lessonCount: lm[q.id] || 0,
      challengeCount: cm[q.id] || 0,
      progress: {
        status: q.progress_status || 'LOCKED',
        lessonsCompleted: q.lessons_completed || 0,
        challengesCompleted: q.challenges_completed || 0,
        bestScore: q.best_score || 0,
        stars: q.stars || 0,
        startedAt: q.started_at,
        completedAt: q.completed_at,
      },
    }));

    res.json({ quests: questsOut });
  } catch (e) {
    next(e);
  }
}

async function getQuest(req, res, next) {
  try {
    await regenLivesIfNeeded(req.user.userId);
    const questId = Number(req.params.id);
    const [[quest]] = await pool.query(`SELECT * FROM quests WHERE id = ? AND is_active = TRUE`, [
      questId,
    ]);
    if (!quest) {
      const err = new Error('Quest not found');
      err.status = 404;
      throw err;
    }

    const [lessons] = await pool.query(
      `SELECT id, quest_id, title, content, key_terms, fun_fact, real_world_example, order_index
       FROM lessons WHERE quest_id = ? ORDER BY order_index`,
      [questId]
    );
    const [challenges] = await pool.query(
      `SELECT id, quest_id, type, question, options, explanation, hint, difficulty, time_limit, xp_reward, order_index
       FROM challenges WHERE quest_id = ? ORDER BY order_index`,
      [questId]
    );

    const [qpRows] = await pool.query(
      `SELECT * FROM quest_progress WHERE user_id = ? AND quest_id = ?`,
      [req.user.userId, questId]
    );
    const progress = qpRows[0] || null;

    const lessonsOut = lessons.map((l) => {
      let kt = l.key_terms;
      if (typeof kt === 'string') {
        try {
          kt = JSON.parse(kt || '[]');
        } catch {
          kt = [];
        }
      }
      return { ...l, key_terms: kt };
    });

    res.json({
      quest: {
        ...quest,
        lessons: lessonsOut,
        challenges: challenges.map(stripChallenge),
        progress,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function startQuest(req, res, next) {
  try {
    await regenLivesIfNeeded(req.user.userId);
    const questId = Number(req.params.id);
    const [rows] = await pool.query(
      `SELECT * FROM quest_progress WHERE user_id = ? AND quest_id = ?`,
      [req.user.userId, questId]
    );
    if (!rows.length) {
      const err = new Error('Progress not found');
      err.status = 400;
      throw err;
    }
    const p = rows[0];
    if (p.status === 'LOCKED') {
      const err = new Error('Quest is locked. Complete the prerequisite first.');
      err.status = 400;
      throw err;
    }
    if (p.status === 'COMPLETED') {
      return res.json({ progress: p });
    }
    await pool.query(
      `UPDATE quest_progress SET status = 'IN_PROGRESS', started_at = COALESCE(started_at, NOW()) WHERE id = ?`,
      [p.id]
    );
    const [updated] = await pool.query(`SELECT * FROM quest_progress WHERE id = ?`, [p.id]);
    res.json({ progress: updated[0] });
  } catch (e) {
    next(e);
  }
}

/** Persist lesson progress while user reads (resume support). */
async function lessonComplete(req, res, next) {
  try {
    const questId = Number(req.params.id);
    const { lessonsCompleted } = req.body;
    const n = Math.max(0, Number(lessonsCompleted) || 0);
    const [rows] = await pool.query(
      `SELECT qp.* FROM quest_progress qp WHERE qp.user_id = ? AND qp.quest_id = ?`,
      [req.user.userId, questId]
    );
    if (!rows.length) {
      const err = new Error('Progress not found');
      err.status = 400;
      throw err;
    }
    const [[{ maxL }]] = await pool.query(
      `SELECT COUNT(*) AS maxL FROM lessons WHERE quest_id = ?`,
      [questId]
    );
    const capped = Math.min(n, maxL);
    await pool.query(
      `UPDATE quest_progress SET lessons_completed = GREATEST(lessons_completed, ?) WHERE id = ?`,
      [capped, rows[0].id]
    );
    const [u] = await pool.query(`SELECT * FROM quest_progress WHERE id = ?`, [rows[0].id]);
    res.json({ progress: u[0] });
  } catch (e) {
    next(e);
  }
}

async function completeQuest(req, res, next) {
  try {
    await regenLivesIfNeeded(req.user.userId);
    const questId = Number(req.params.id);
    const { correctAnswers, totalChallenges } = req.body;
    const correct = Number(correctAnswers) || 0;
    const total = Number(totalChallenges) || 1;
    const pct = Math.round((correct / total) * 100);
    const stars = starsFromAccuracy(pct);

    const [[quest]] = await pool.query(`SELECT * FROM quests WHERE id = ?`, [questId]);
    if (!quest) {
      const err = new Error('Quest not found');
      err.status = 404;
      throw err;
    }

    const [qpRows] = await pool.query(
      `SELECT * FROM quest_progress WHERE user_id = ? AND quest_id = ?`,
      [req.user.userId, questId]
    );
    if (!qpRows.length) {
      const err = new Error('Progress not found');
      err.status = 400;
      throw err;
    }
    const qp = qpRows[0];

    const bonusXp = Math.round((pct / 100) * 50);
    const totalXpGain = quest.xp_reward + bonusXp;
    const coinsEarned = quest.coin_reward;

    const conn = await pool.getConnection();
    let newAchievements = [];
    let levelInfo = { previousLevel: 0, newLevel: 1, leveledUp: false };
    try {
      await conn.beginTransaction();
      const [[{ maxL }]] = await conn.query(
        `SELECT COUNT(*) AS maxL FROM lessons WHERE quest_id = ?`,
        [questId]
      );
      await conn.query(
        `UPDATE quest_progress SET
          status = 'COMPLETED',
          stars = ?,
          best_score = ?,
          completed_at = NOW(),
          challenges_completed = ?,
          lessons_completed = GREATEST(lessons_completed, ?)
        WHERE id = ?`,
        [stars, pct, correct, maxL, qp.id]
      );

      await conn.query(
        `UPDATE users SET coins = coins + ? WHERE id = ?`,
        [coinsEarned, req.user.userId]
      );

      levelInfo = await addXpToUser(conn, req.user.userId, totalXpGain);
      await updateStreakOnActivity(conn, req.user.userId);

      await conn.query(
        `UPDATE quest_progress qp
         INNER JOIN quests q ON q.id = qp.quest_id
         SET qp.status = 'AVAILABLE'
         WHERE qp.user_id = ? AND q.prerequisite_id = ? AND qp.status = 'LOCKED'`,
        [req.user.userId, questId]
      );

      await conn.commit();

      newAchievements = await runAchievementCheck(req.user.userId);
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    const [[user]] = await pool.query(`SELECT level, current_xp FROM users WHERE id = ?`, [
      req.user.userId,
    ]);

    res.json({
      progress: { status: 'COMPLETED', stars, bestScore: pct },
      xpEarned: totalXpGain,
      coinsEarned,
      newLevel: user.level,
      leveledUp: levelInfo.leveledUp,
      newAchievements,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listQuests,
  getQuest,
  startQuest,
  lessonComplete,
  completeQuest,
};
