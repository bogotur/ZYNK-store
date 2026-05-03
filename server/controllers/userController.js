const pool = require('../db');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, name, email, phone, city, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const user = result.rows[0];

    return res.json({
      profile: {
        id: user.id,
        firstName: user.name,
        email: user.email,
        phone: user.phone || '',
        city: user.city || '',
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        addresses: [],
      },
      orders: [],
      savedItems: [],
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, city } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET name = $1,
           phone = $2,
           city = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, phone, city, created_at, updated_at`,
      [
        name?.trim() || '',
        phone?.trim() || '',
        city?.trim() || '',
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const user = result.rows[0];

    return res.json({
      message: 'Профіль оновлено',
      profile: {
        id: user.id,
        firstName: user.name,
        email: user.email,
        phone: user.phone || '',
        city: user.city || '',
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};