const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/brands', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM gpu_brands ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/models', async (req, res) => {
  const { brand_id } = req.query;

  try {
    if (!brand_id) {
      return res.json([]);
    }

    const result = await pool.query(
      'SELECT id, name FROM gpu_models WHERE brand_id = $1 ORDER BY name ASC',
      [brand_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/vendors', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM gpu_vendors ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/cards', async (req, res) => {
  const { brand_id, model_id, vendor_id, sort } = req.query;

  try {
    let sql = `
      SELECT
        vc.id,
        vc.brand_id,
        vc.model_id,
        vc.vendor_id,
        vc.image_url,
        vc.memory_capacity,
        vc.memory_type,
        vc.interface_type,
        vc.core_clock_ghz,
        vc.price,
        vc.stock_quantity,
        vc.is_active,
        vc.sku,
        vc.created_at,
        vc.updated_at,
        b.name AS brand_name,
        m.name AS model_name,
        v.name AS vendor_name
      FROM videocards vc
      JOIN gpu_brands b ON vc.brand_id = b.id
      JOIN gpu_models m ON vc.model_id = m.id
      JOIN gpu_vendors v ON vc.vendor_id = v.id
      WHERE vc.is_active = true
    `;

    const params = [];
    let index = 1;

    if (brand_id) {
      sql += ` AND vc.brand_id = $${index++}`;
      params.push(brand_id);
    }

    if (model_id) {
      sql += ` AND vc.model_id = $${index++}`;
      params.push(model_id);
    }

    if (vendor_id) {
      const vendorIds = vendor_id.split(',').map(Number).filter(Boolean);
      if (vendorIds.length > 0) {
        sql += ` AND vc.vendor_id = ANY($${index++})`;
        params.push(vendorIds);
      }
    }

    if (sort === 'asc') {
      sql += ' ORDER BY vc.price ASC';
    } else if (sort === 'desc') {
      sql += ' ORDER BY vc.price DESC';
    } else {
      sql += ' ORDER BY vc.id DESC';
    }

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/cards/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        vc.id,
        vc.brand_id,
        vc.model_id,
        vc.vendor_id,
        vc.image_url,
        vc.memory_capacity,
        vc.memory_type,
        vc.interface_type,
        vc.core_clock_ghz,
        vc.price,
        vc.stock_quantity,
        vc.is_active,
        vc.sku,
        vc.created_at,
        vc.updated_at,
        b.name AS brand_name,
        m.name AS model_name,
        v.name AS vendor_name
      FROM videocards vc
      JOIN gpu_brands b ON vc.brand_id = b.id
      JOIN gpu_models m ON vc.model_id = m.id
      JOIN gpu_vendors v ON vc.vendor_id = v.id
      WHERE vc.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Videocard not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching card by id:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;