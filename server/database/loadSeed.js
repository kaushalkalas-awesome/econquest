/**
 * Load seed data into MySQL (quests, lessons, challenges, achievements, shop, demo users).
 * Run: cd server && node database/loadSeed.js
 * Requires: schema applied, .env configured.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { QUESTS_SEED } = require('./seedQuests');

const DEMO_HASH = bcrypt.hashSync('password123', 10);

const ACHIEVEMENTS = [
  ['First Steps', 'Complete your first quest', '🎓', 'LEARNING', 'quests_completed', 1, 25, 10, 'COMMON'],
  ['Bookworm', 'Complete 5 quests', '📚', 'LEARNING', 'quests_completed', 5, 50, 25, 'UNCOMMON'],
  ['Scholar', 'Complete 10 quests', '📖', 'LEARNING', 'quests_completed', 10, 100, 50, 'RARE'],
  [
    'Professor',
    'Complete all quests',
    '🎓',
    'LEARNING',
    'quests_completed',
    6,
    500,
    200,
    'LEGENDARY',
  ],
  [
    'Quick Learner',
    'Complete 25 challenges',
    '✅',
    'LEARNING',
    'challenges_completed',
    25,
    25,
    10,
    'COMMON',
  ],
  ['Warming Up', '3-day streak', '🔥', 'STREAK', 'streak', 3, 25, 10, 'COMMON'],
  ['On Fire', '7-day streak', '🔥', 'STREAK', 'streak', 7, 50, 25, 'UNCOMMON'],
  ['Blazing', '14-day streak', '🔥', 'STREAK', 'streak', 14, 100, 50, 'RARE'],
  ['Inferno', '30-day streak', '🔥', 'STREAK', 'streak', 30, 200, 100, 'EPIC'],
  ['Eternal Flame', '100-day streak', '🔥', 'STREAK', 'streak', 100, 500, 250, 'LEGENDARY'],
  [
    'Big Brain',
    'Get 100% on any quest',
    '🧠',
    'MASTERY',
    'perfect_quest',
    1,
    100,
    50,
    'RARE',
  ],
  [
    'Three Stars',
    'Get 3 stars on any quest',
    '⭐',
    'MASTERY',
    'three_star_quest',
    1,
    50,
    25,
    'UNCOMMON',
  ],
  [
    'Star Collector',
    'Get 3 stars on 5 quests',
    '🌟',
    'MASTERY',
    'three_star_quest',
    5,
    200,
    100,
    'EPIC',
  ],
  [
    'Sharpshooter',
    'Answer 10 challenges in a row correctly',
    '🎯',
    'MASTERY',
    'correct_streak',
    10,
    100,
    50,
    'RARE',
  ],
  [
    'Speed Demon',
    'Answer a challenge correctly in under 5 seconds',
    '⚡',
    'MASTERY',
    'fast_answer',
    1,
    75,
    30,
    'RARE',
  ],
  ['Penny Pincher', 'Accumulate 500 coins', '🪙', 'COLLECTION', 'coins', 500, 25, 0, 'COMMON'],
  ['Money Bags', 'Accumulate 2000 coins', '💰', 'COLLECTION', 'coins', 2000, 50, 0, 'UNCOMMON'],
  ['High Roller', 'Accumulate 5000 coins', '💎', 'COLLECTION', 'coins', 5000, 100, 0, 'RARE'],
  [
    'Shopaholic',
    'Purchase 5 items from shop',
    '🛍️',
    'COLLECTION',
    'items_purchased',
    5,
    50,
    25,
    'UNCOMMON',
  ],
  [
    'Completionist',
    'Unlock 15 achievements',
    '🏆',
    'COLLECTION',
    'achievements_unlocked',
    15,
    200,
    100,
    'EPIC',
  ],
];

const SHOP = [
  ['Fox Scholar', 'A clever avatar', 'AVATAR', 100, 'COINS', '🦊', null],
  ['Wolf Trader', 'Market hunter', 'AVATAR', 100, 'COINS', '🐺', null],
  ['Owl Professor', 'Wise economist', 'AVATAR', 150, 'COINS', '🦉', null],
  ['Dragon Economist', 'Rare legendary look', 'AVATAR', 200, 'COINS', '🐉', null],
  ['Lion Leader', 'Command the market', 'AVATAR', 200, 'COINS', '🦁', null],
  ['Penguin Analyst', 'Cool under pressure', 'AVATAR', 150, 'COINS', '🐧', null],
  ['Market Wizard', 'Show your skill', 'TITLE', 75, 'COINS', '🧙', null],
  ['GDP Guru', 'Macro master', 'TITLE', 100, 'COINS', '🏛️', null],
  ['Budget Boss', 'Personal finance pro', 'TITLE', 100, 'COINS', '💼', null],
  ['Wall Street Wolf', 'Bold investor', 'TITLE', 150, 'COINS', '🐺', null],
  ['Economic Eagle', 'See the big picture', 'TITLE', 200, 'COINS', '🦅', null],
  ['Finance Phoenix', 'Rise from any dip', 'TITLE', 300, 'COINS', '🔥', null],
  ['Extra Life', 'Restore 1 life', 'POWER_UP', 50, 'COINS', '❤️', JSON.stringify({ effect: 'extra_life' })],
  ['XP Boost', 'Bonus energy', 'POWER_UP', 100, 'COINS', '⚡', JSON.stringify({ effect: 'xp_boost' })],
  ['Streak Freeze', 'Protect your streak', 'POWER_UP', 150, 'COINS', '🛡️', JSON.stringify({ effect: 'streak_freeze' })],
  ['Hint Pack', '3 free hints', 'POWER_UP', 75, 'COINS', '💡', JSON.stringify({ effect: 'hints' })],
];

async function main() {
  const conn = await mysql.createConnection(process.env.MYSQL_URL || {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    multipleStatements: true,
  });

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of [
    'daily_challenges',
    'challenge_attempts',
    'user_inventory',
    'user_achievements',
    'quest_progress',
    'lessons',
    'challenges',
    'achievements',
    'shop_items',
    'quests',
    'users',
  ]) {
    await conn.query(`TRUNCATE TABLE ${t}`);
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  for (const a of ACHIEVEMENTS) {
    await conn.query(
      `INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward, coin_reward, rarity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      a
    );
  }

  for (const s of SHOP) {
    await conn.query(
      `INSERT INTO shop_items (name, description, type, price, currency, icon, data, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      s
    );
  }

  const questIdByKey = {};
  for (const q of QUESTS_SEED) {
    const [r] = await conn.query(
      `INSERT INTO quests (title, description, category, difficulty, order_index, xp_reward, coin_reward, icon_emoji, prerequisite_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        q.title,
        q.description,
        q.category,
        q.difficulty,
        q.order_index,
        q.xp_reward,
        q.coin_reward,
        q.icon_emoji,
        q.prerequisite_key ? questIdByKey[q.prerequisite_key] : null,
      ]
    );
    questIdByKey[q.key] = r.insertId;
    const questId = r.insertId;

    let li = 1;
    for (const lesson of q.lessons) {
      await conn.query(
        `INSERT INTO lessons (quest_id, title, content, key_terms, fun_fact, real_world_example, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          questId,
          lesson.title,
          lesson.content,
          JSON.stringify(lesson.key_terms || []),
          lesson.fun_fact || null,
          lesson.real_world_example || null,
          li++,
        ]
      );
    }

    let ci = 1;
    for (const ch of q.challenges) {
      await conn.query(
        `INSERT INTO challenges (quest_id, type, question, options, correct_answer, explanation, hint, difficulty, time_limit, xp_reward, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          questId,
          ch.type,
          ch.question,
          ch.options ? JSON.stringify(ch.options) : null,
          ch.correct_answer,
          ch.explanation,
          ch.hint || null,
          ch.difficulty,
          ch.time_limit ?? 30,
          ch.xp_reward ?? 10,
          ci++,
        ]
      );
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  const [ur1] = await conn.query(
    `INSERT INTO users (username, email, password_hash, display_name, avatar, title, level, current_xp, total_xp, coins, gems, streak, longest_streak, lives, last_active_date)
     VALUES ('econ_master', 'demo@econquest.com', ?, 'Alex Johnson', '🧑‍💼', 'Economics Novice', 7, 450, 2950, 875, 5, 12, 12, 5, ?)`,
    [DEMO_HASH, today]
  );
  const u1 = ur1.insertId;

  const [ur2] = await conn.query(
    `INSERT INTO users (username, email, password_hash, display_name, avatar, title, level, current_xp, total_xp, coins, gems, streak, longest_streak, lives, last_active_date)
     VALUES ('market_wiz', 'market@econquest.com', ?, 'Sarah Chen', '👩‍🎓', 'Economics Novice', 5, 200, 1400, 540, 5, 5, 5, 5, ?)`,
    [DEMO_HASH, today]
  );
  const u2 = ur2.insertId;

  const [ur3] = await conn.query(
    `INSERT INTO users (username, email, password_hash, display_name, avatar, title, level, current_xp, total_xp, coins, gems, streak, longest_streak, lives, last_active_date)
     VALUES ('finance_rookie', 'rookie@econquest.com', ?, 'Mike Torres', '🧑‍💻', 'Economics Novice', 3, 80, 580, 230, 5, 2, 2, 5, ?)`,
    [DEMO_HASH, today]
  );
  const u3 = ur3.insertId;

  async function seedProgressForUser(uid, overrides) {
    const [allQuests] = await conn.query(`SELECT id, prerequisite_id FROM quests ORDER BY id`);
    for (const q of allQuests) {
      const status = q.prerequisite_id ? 'LOCKED' : 'AVAILABLE';
      await conn.query(
        `INSERT INTO quest_progress (user_id, quest_id, status, lessons_completed, challenges_completed, best_score, stars, started_at, completed_at)
         VALUES (?, ?, ?, 0, 0, 0, 0, NULL, NULL)`,
        [uid, q.id, status]
      );
    }
    for (const row of overrides || []) {
      await conn.query(
        `UPDATE quest_progress SET status = ?, lessons_completed = ?, challenges_completed = ?, best_score = ?, stars = ?, started_at = NOW(), completed_at = ?
         WHERE user_id = ? AND quest_id = ?`,
        [
          row.status,
          row.lessons_completed ?? 0,
          row.challenges_completed ?? 0,
          row.best_score ?? 0,
          row.stars ?? 0,
          row.completed_at ?? null,
          uid,
          row.quest_id,
        ]
      );
    }
  }

  /** Unlock quests whose prerequisite is completed (run after progress overrides). */
  async function unlockByPrereqs(uid) {
    for (let i = 0; i < 6; i += 1) {
      await conn.query(
        `UPDATE quest_progress qp
         JOIN quests q ON q.id = qp.quest_id
         SET qp.status = 'AVAILABLE'
         WHERE qp.user_id = ? AND qp.status = 'LOCKED' AND q.prerequisite_id IS NOT NULL
         AND EXISTS (
           SELECT 1 FROM quest_progress p2
           WHERE p2.user_id = qp.user_id AND p2.quest_id = q.prerequisite_id AND p2.status = 'COMPLETED'
         )`,
        [uid]
      );
    }
  }

  const qid = (k) => questIdByKey[k];

  await seedProgressForUser(u1, [
    {
      quest_id: qid('q1'),
      status: 'COMPLETED',
      lessons_completed: 4,
      challenges_completed: 8,
      best_score: 95,
      stars: 3,
      completed_at: new Date(),
    },
    {
      quest_id: qid('q2'),
      status: 'COMPLETED',
      lessons_completed: 4,
      challenges_completed: 8,
      best_score: 88,
      stars: 3,
      completed_at: new Date(),
    },
    {
      quest_id: qid('q3'),
      status: 'COMPLETED',
      lessons_completed: 4,
      challenges_completed: 8,
      best_score: 80,
      stars: 2,
      completed_at: new Date(),
    },
    {
      quest_id: qid('q4'),
      status: 'IN_PROGRESS',
      lessons_completed: 2,
      challenges_completed: 3,
      best_score: 0,
      stars: 0,
      completed_at: null,
    },
  ]);
  await unlockByPrereqs(u1);

  await seedProgressForUser(u2, [
    {
      quest_id: qid('q1'),
      status: 'COMPLETED',
      lessons_completed: 4,
      challenges_completed: 8,
      best_score: 90,
      stars: 3,
      completed_at: new Date(),
    },
    {
      quest_id: qid('q2'),
      status: 'IN_PROGRESS',
      lessons_completed: 1,
      challenges_completed: 0,
      best_score: 0,
      stars: 0,
      completed_at: null,
    },
  ]);
  await unlockByPrereqs(u2);

  await seedProgressForUser(u3, []);
  await unlockByPrereqs(u3);

  const [firstCh] = await conn.query(`SELECT id FROM challenges WHERE quest_id = ? LIMIT 1`, [qid('q1')]);
  if (firstCh.length) {
    await conn.query(
      `INSERT INTO challenge_attempts (user_id, challenge_id, user_answer, is_correct, time_spent, xp_earned)
       VALUES (?, ?, 'It decreases', TRUE, 8, 10)`,
      [u1, firstCh[0].id]
    );
  }

  const [achRows] = await conn.query(
    `SELECT id FROM achievements WHERE name IN ('First Steps', 'Warming Up')`
  );
  for (const ar of achRows) {
    await conn.query(`INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)`, [
      u1,
      ar.id,
    ]);
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete. Demo: demo@econquest.com / password123');
  await conn.end();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
