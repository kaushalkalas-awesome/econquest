/**
 * Shared game rules: streak, XP / level, challenge base XP.
 */
const MAX_LEVEL = 50;

/** XP reward by challenge difficulty (before speed bonus). */
function baseXpForDifficulty(difficulty) {
  if (difficulty === 'ADVANCED') return 25;
  if (difficulty === 'INTERMEDIATE') return 15;
  return 10;
}

/**
 * Apply XP gain; updates users.current_xp, total_xp, level.
 * Returns { newLevel, leveledUp }.
 */
async function addXpToUser(conn, userId, amount) {
  const [[u]] = await conn.query(
    `SELECT level, current_xp, total_xp FROM users WHERE id = ?`,
    [userId]
  );
  let level = u.level;
  let currentXp = u.current_xp + amount;
  let totalXp = u.total_xp + amount;
  let leveledUp = false;
  let newLevel = level;

  while (newLevel < MAX_LEVEL && currentXp >= newLevel * 100) {
    currentXp -= newLevel * 100;
    newLevel += 1;
    leveledUp = true;
  }
  if (newLevel >= MAX_LEVEL) {
    newLevel = MAX_LEVEL;
    const cap = (MAX_LEVEL - 1) * 100;
    if (currentXp > cap) currentXp = cap;
  }

  await conn.query(
    `UPDATE users SET level = ?, current_xp = ?, total_xp = ? WHERE id = ?`,
    [newLevel, currentXp, totalXp, userId]
  );
  return { newLevel, leveledUp, previousLevel: level };
}

/**
 * Update streak based on last_active_date.
 * Shifted to MySQL DATEDIFF to prevent timezone off-by-one errors from toISOString().
 */
async function updateStreakOnActivity(conn, userId) {
  const [[user]] = await conn.query(
    `SELECT last_active_date, streak, longest_streak, DATEDIFF(NOW(), last_active_date) as diffDays 
     FROM users WHERE id = ?`,
    [userId]
  );

  let streak = user.streak || 0;
  let longest = user.longest_streak || 0;
  const diffDays = user.diffDays;

  if (diffDays === null) {
    streak = 1; // First activity ever
  } else if (diffDays === 0) {
    // Same day: no change
  } else if (diffDays === 1) {
    // Consecutive day
    streak += 1;
  } else if (diffDays < 0) {
     // Safeguard for timezone shifts backwards
  } else {
    // Missed at least one day
    streak = 1;
  }

  if (streak > longest) longest = streak;

  await conn.query(
    `UPDATE users SET last_active_date = NOW(), streak = ?, longest_streak = ? WHERE id = ?`,
    [streak, longest, userId]
  );
}

/** Stars from accuracy percentage on challenges only. */
function starsFromAccuracy(pct) {
  if (pct >= 90) return 3;
  if (pct >= 75) return 2;
  if (pct >= 50) return 1;
  return 0;
}

module.exports = {
  MAX_LEVEL,
  baseXpForDifficulty,
  addXpToUser,
  updateStreakOnActivity,
  starsFromAccuracy,
};
