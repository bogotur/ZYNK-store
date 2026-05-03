const pool = require('../db');

const placeOrder = async (req, res) => {
  try {
    const {
      product_id,
      product_name,
      product_type,
      product_price,
      quantity,
      total_amount,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      payment_method,
      card_last4,
      card_holder,
    } = req.body;

    const user_id = req.user.id;

    if (
      !product_id ||
      !product_name ||
      !quantity ||
      !total_amount ||
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !delivery_address ||
      !payment_method
    ) {
      return res.status(400).json({ message: 'Заповніть усі обов’язкові поля' });
    }

    const result = await pool.query(
      `INSERT INTO orders (
        user_id, product_id, product_name, product_type, product_price,
        quantity, total_amount, customer_name, customer_email, customer_phone,
        delivery_address, payment_method, card_last4, card_holder, status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        user_id,
        product_id,
        product_name,
        product_type || null,
        product_price || 0,
        quantity,
        total_amount,
        customer_name.trim(),
        customer_email.trim().toLowerCase(),
        customer_phone.trim(),
        delivery_address.trim(),
        payment_method,
        payment_method === 'card' ? String(card_last4).trim() : null,
        payment_method === 'card' ? card_holder?.trim() || null : null,
        payment_method === 'card' ? 'paid' : 'pending',
      ]
    );

    return res.status(201).json({
      message: 'Замовлення успішно створено',
      order: result.rows[0],
    });
  } catch (error) {
    console.error('placeOrder error:', error);
    return res.status(500).json({ message: 'Помилка сервера при створенні замовлення' });
  }
};

const placeOrderMulti = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      items,
      total_amount,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      payment_method,
      card_last4,
      card_holder,
    } = req.body;

    const user_id = req.user.id;

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !total_amount ||
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !delivery_address ||
      !payment_method
    ) {
      return res.status(400).json({ message: 'Заповніть усі обов’язкові поля' });
    }

    if (!['cash_on_delivery', 'card'].includes(payment_method)) {
      return res.status(400).json({ message: 'Некоректний спосіб оплати' });
    }

    const totalQuantity = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    await client.query('BEGIN');

    const firstItem = items[0];

    const orderResult = await client.query(
      `INSERT INTO orders (
        user_id,
        product_id,
        product_name,
        product_type,
        product_price,
        quantity,
        total_amount,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        payment_method,
        card_last4,
        card_holder,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        user_id,
        firstItem.product_id,
        `Замовлення з ${items.length} товарів`,
        'multi',
        0,
        totalQuantity,
        total_amount,
        customer_name.trim(),
        customer_email.trim().toLowerCase(),
        customer_phone.trim(),
        delivery_address.trim(),
        payment_method,
        payment_method === 'card' ? String(card_last4).trim() : null,
        payment_method === 'card' ? card_holder?.trim() || null : null,
        payment_method === 'card' ? 'paid' : 'pending',
      ]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          product_type,
          product_price,
          quantity,
          total_amount
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          order.id,
          item.product_id,
          item.product_name,
          item.product_type || null,
          item.product_price,
          item.quantity,
          item.total_amount,
        ]
      );

      if (item.product_type === 'videocard') {
        await client.query(
          `UPDATE videocards
           SET stock_quantity = GREATEST(stock_quantity - $1, 0),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Замовлення успішно створено',
      order,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('placeOrderMulti error:', error);
    return res.status(500).json({ message: 'Помилка сервера при створенні замовлення' });
  } finally {
    client.release();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT
        o.*,
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
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [user_id]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('getMyOrders error:', error);
    return res.status(500).json({ message: 'Помилка сервера при отриманні замовлень' });
  }
};

module.exports = {
  placeOrder,
  placeOrderMulti,
  getMyOrders,
};