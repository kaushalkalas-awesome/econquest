/**
 * Shop: list items, purchase, equip.
 */
const pool = require('../config/db');
const { runAchievementCheck } = require('./achievementController');

async function listItems(req, res, next) {
  try {
    const [items] = await pool.query(
      `SELECT s.*,
        CASE WHEN ui.id IS NOT NULL THEN TRUE ELSE FALSE END AS owned,
        COALESCE(ui.is_equipped, FALSE) AS equipped
       FROM shop_items s
       LEFT JOIN user_inventory ui ON ui.shop_item_id = s.id AND ui.user_id = ?
       WHERE s.is_active = TRUE
       ORDER BY s.type, s.price`,
      [req.user.userId]
    );
    const out = items.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      price: row.price,
      currency: row.currency,
      icon: row.icon,
      data: row.data,
      owned: !!row.owned,
      equipped: !!row.equipped,
    }));
    res.json({ items: out });
  } catch (e) {
    next(e);
  }
}

async function purchase(req, res, next) {
  try {
    const itemId = Number(req.params.itemId);
    const [[item]] = await pool.query(`SELECT * FROM shop_items WHERE id = ? AND is_active = TRUE`, [
      itemId,
    ]);
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }

    const [own] = await pool.query(
      `SELECT id FROM user_inventory WHERE user_id = ? AND shop_item_id = ?`,
      [req.user.userId, itemId]
    );
    if (own.length) {
      const err = new Error('Already owned');
      err.status = 400;
      throw err;
    }

    const [[user]] = await pool.query(`SELECT coins, gems, lives FROM users WHERE id = ?`, [
      req.user.userId,
    ]);
    const price = item.price;
    const curr = item.currency || 'COINS';
    if (curr === 'GEMS') {
      if (user.gems < price) {
        const err = new Error('Not enough coins');
        err.status = 400;
        throw err;
      }
    } else if (user.coins < price) {
      const err = new Error('Not enough coins');
      err.status = 400;
      throw err;
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      if (curr === 'GEMS') {
        await conn.query(`UPDATE users SET gems = gems - ? WHERE id = ?`, [price, req.user.userId]);
      } else {
        await conn.query(`UPDATE users SET coins = coins - ? WHERE id = ?`, [price, req.user.userId]);
      }

      await conn.query(
        `INSERT INTO user_inventory (user_id, shop_item_id, is_equipped) VALUES (?, ?, FALSE)`,
        [req.user.userId, itemId]
      );

      if (item.type === 'POWER_UP') {
        let data = item.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data || '{}');
          } catch {
            data = {};
          }
        }
        if (data.effect === 'extra_life' || item.name.includes('Extra Life')) {
          await conn.query(`UPDATE users SET lives = LEAST(5, lives + 1) WHERE id = ?`, [
            req.user.userId,
          ]);
        }
      }

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    await runAchievementCheck(req.user.userId);

    const [[fresh]] = await pool.query(`SELECT coins, gems FROM users WHERE id = ?`, [
      req.user.userId,
    ]);
    res.json({ success: true, newBalance: { coins: fresh.coins, gems: fresh.gems } });
  } catch (e) {
    next(e);
  }
}

async function equip(req, res, next) {
  try {
    const itemId = Number(req.params.itemId);
    const [[item]] = await pool.query(`SELECT * FROM shop_items WHERE id = ?`, [itemId]);
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }

    const [inv] = await pool.query(
      `SELECT * FROM user_inventory WHERE user_id = ? AND shop_item_id = ?`,
      [req.user.userId, itemId]
    );
    if (!inv.length) {
      const err = new Error('Not owned');
      err.status = 400;
      throw err;
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (item.type === 'AVATAR') {
        await conn.query(
          `UPDATE user_inventory ui
           JOIN shop_items si ON si.id = ui.shop_item_id
           SET ui.is_equipped = FALSE
           WHERE ui.user_id = ? AND si.type = 'AVATAR'`,
          [req.user.userId]
        );
        await conn.query(
          `UPDATE user_inventory SET is_equipped = TRUE WHERE user_id = ? AND shop_item_id = ?`,
          [req.user.userId, itemId]
        );
        await conn.query(`UPDATE users SET avatar = ? WHERE id = ?`, [item.icon, req.user.userId]);
      } else if (item.type === 'TITLE') {
        await conn.query(
          `UPDATE user_inventory ui
           JOIN shop_items si ON si.id = ui.shop_item_id
           SET ui.is_equipped = FALSE
           WHERE ui.user_id = ? AND si.type = 'TITLE'`,
          [req.user.userId]
        );
        await conn.query(
          `UPDATE user_inventory SET is_equipped = TRUE WHERE user_id = ? AND shop_item_id = ?`,
          [req.user.userId, itemId]
        );
        await conn.query(`UPDATE users SET title = ? WHERE id = ?`, [item.name, req.user.userId]);
      }

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

module.exports = { listItems, purchase, equip };
