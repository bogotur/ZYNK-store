const pool = require('../db');

const allowedStatuses = [
  'В очікуванні',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
];

const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.*,
        u.name AS user_name,
        u.email AS user_email,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'product_type', oi.product_type,
              'product_price', oi.product_price,
              'quantity', oi.quantity,
              'total_amount', oi.total_amount
            )
            ORDER BY oi.id ASC
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
    `);

    return res.json(result.rows);
  } catch (error) {
    console.error('getAllOrders error:', error);
    return res.status(500).json({ message: 'Помилка сервера при отриманні замовлень' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Некоректний статус' });
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, phone, city, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const makeUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id == id) {
      return res.status(400).json({ message: 'Не можна змінити себе' });
    }

    const result = await pool.query(
      `UPDATE users
       SET role = 'admin', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Користувач не знайдений' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    if (req.user.id == id) {
      return res.status(400).json({ message: 'Не можна видалити себе' });
    }

    await client.query('BEGIN');

    await client.query(
      `UPDATE orders SET user_id = NULL WHERE user_id = $1`,
      [id]
    );

    const result = await client.query(
      `DELETE FROM users WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Користувач не знайдений' });
    }

    await client.query('COMMIT');

    res.json({ message: 'Користувача видалено' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getUserOrders,
  makeUserAdmin,
  deleteUser,
};