/**
 * Challenge submit + daily challenge.
 */
const pool = require('../config/db');
const { regenLivesIfNeeded } = require('../middleware/regenLives');
const { baseXpForDifficulty, addXpToUser, updateStreakOnActivity } = require('../utils/game');
const { runAchievementCheck } = require('./achievementController');

function answersMatch(type, userAns, correct) {
  const u = String(userAns ?? '').trim().toLowerCase();
  const c = String(correct ?? '').trim().toLowerCase();
  if (type === 'FILL_BLANK') {
    if (u === c) return true;
    const norm = (s) =>
      s
        .replace(/\s+/g, ' ')
        .replace(/-/g, ' to ')
        .replace(/\s+to\s+/g, ' to ');
    return norm(u) === norm(c);
  }
  return u === c;
}

async function submitChallenge(req, res, next) {
  try {
    await regenLivesIfNeeded(req.user.userId);
    const challengeId = Number(req.params.id);
    const { answer, timeSpent } = req.body;
    const ts = Number(timeSpent) || 0;

    const [[ch]] = await pool.query(`SELECT * FROM challenges WHERE id = ?`, [challengeId]);
    if (!ch) {
      const err = new Error('Challenge not found');
      err.status = 404;
      throw err;
    }

    const isCorrect = answersMatch(ch.type, answer, ch.correct_answer);
    let xpEarned = 0;

    if (isCorrect) {
      let base = baseXpForDifficulty(ch.difficulty);
      const half = (ch.time_limit || 30) / 2;
      if (ts > 0 && ts < half) {
        base = Math.round(base * 1.5);
      }
      xpEarned = base;
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `INSERT INTO challenge_attempts (user_id, challenge_id, user_answer, is_correct, time_spent, xp_earned)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.userId, challengeId, String(answer), isCorrect, ts, xpEarned]
      );

      if (!isCorrect) {
        await conn.query(
          `UPDATE users SET lives = GREATEST(0, lives - 1) WHERE id = ? AND lives > 0`,
          [req.user.userId]
        );
      } else {
        await addXpToUser(conn, req.user.userId, xpEarned);
        await conn.query(
          `UPDATE quest_progress SET challenges_completed = challenges_completed + 1
           WHERE user_id = ? AND quest_id = ? AND status = 'IN_PROGRESS'`,
          [req.user.userId, ch.quest_id]
        );
      }

      await updateStreakOnActivity(conn, req.user.userId);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    await runAchievementCheck(req.user.userId);

    const [[u]] = await pool.query(`SELECT lives FROM users WHERE id = ?`, [req.user.userId]);

    res.json({
      isCorrect,
      correctAnswer: ch.correct_answer,
      explanation: ch.explanation,
      xpEarned,
      livesRemaining: u.lives,
    });
  } catch (e) {
    next(e);
  }
}

async function getDaily(req, res, next) {
  try {
    console.log(req.url)
    await regenLivesIfNeeded(req.user.userId);
    const today = new Date().toISOString().slice(0, 10);
    const [existing] = await pool.query(
      `SELECT * FROM daily_challenges WHERE user_id = ? AND challenge_date = ?`,
      [req.user.userId, today]
    );

    if (existing.length) {
      const row = existing[0];
      if (row.completed) {
        return res.json({ completed: true, score: row.score });
      }
      let options = row.options;
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options);
        } catch {
          options = [];
        }
      }
      return res.json({
        completed: false,
        challenge: {
          id: row.id,
          question: row.question,
          options,
          type: 'MULTIPLE_CHOICE',
        },
      });
    }

    const [poolCh] = await pool.query(
      `SELECT * FROM challenges WHERE type = 'MULTIPLE_CHOICE' ORDER BY RAND() LIMIT 1`
    );
    if (!poolCh.length) {
      return res.json({ completed: false, challenge: null });
    }
    const src = poolCh[0];
    let options = src.options;
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options || '[]');
      } catch {
        options = [];
      }
    }

    await pool.query(
      `INSERT INTO daily_challenges (user_id, challenge_date, question, options, correct_answer, completed, score)
       VALUES (?, ?, ?, ?, ?, FALSE, 0)`,
      [req.user.userId, today, src.question, JSON.stringify(options), src.correct_answer]
    );
    const [ins] = await pool.query(
      `SELECT * FROM daily_challenges WHERE user_id = ? AND challenge_date = ?`,
      [req.user.userId, today]
    );

    res.json({
      completed: false,
      challenge: {
        id: ins[0].id,
        question: ins[0].question,
        options,
        type: 'MULTIPLE_CHOICE',
      },
    });
  } catch (e) {
    next(e);
  }
}

async function submitDaily(req, res, next) {
  try {
    const { answer } = req.body;
    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
      `SELECT * FROM daily_challenges WHERE user_id = ? AND challenge_date = ?`,
      [req.user.userId, today]
    );
    if (!rows.length) {
      const err = new Error('No daily challenge today');
      err.status = 400;
      throw err;
    }
    const row = rows[0];
    if (row.completed) {
      return res.json({ isCorrect: false, xpEarned: 0, alreadyDone: true });
    }

    const isCorrect = answersMatch('MULTIPLE_CHOICE', answer, row.correct_answer);
    let xpEarned = 0;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      if (isCorrect) {
        xpEarned = 50;
        await conn.query(
          `UPDATE daily_challenges SET completed = TRUE, score = 100 WHERE id = ?`,
          [row.id]
        );
        await addXpToUser(conn, req.user.userId, xpEarned);
        await conn.query(
          `UPDATE users SET coins = coins + 25 WHERE id = ?`,
          [req.user.userId]
        );
      } else {
        await conn.query(`UPDATE daily_challenges SET completed = TRUE, score = 0 WHERE id = ?`, [
          row.id,
        ]);
      }
      await updateStreakOnActivity(conn, req.user.userId);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    await runAchievementCheck(req.user.userId);

    res.json({
      isCorrect,
      correctAnswer: row.correct_answer,
      xpEarned,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { submitChallenge, getDaily, submitDaily };
