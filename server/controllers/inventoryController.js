const pool = require('../db');
const path = require('path');
const fs = require('fs');

const getInventoryItems = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        vc.*,
        'videocard' AS product_type,
        b.name AS brand_name,
        m.name AS model_name,
        v.name AS vendor_name
      FROM videocards vc
      JOIN gpu_brands b ON vc.brand_id = b.id
      JOIN gpu_models m ON vc.model_id = m.id
      JOIN gpu_vendors v ON vc.vendor_id = v.id
      ORDER BY vc.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('getInventoryItems error:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

const getInventoryMeta = async (req, res) => {
  try {
    const brands = await pool.query('SELECT * FROM gpu_brands ORDER BY name ASC');
    const vendors = await pool.query('SELECT * FROM gpu_vendors ORDER BY name ASC');

    res.json({
      brands: brands.rows,
      vendors: vendors.rows,
    });
  } catch (error) {
    console.error('getInventoryMeta error:', error);
    res.status(500).json({ message: 'Помилка' });
  }
};

const getModelsByBrand = async (req, res) => {
  try {
    const { brand_id } = req.query;

    if (!brand_id) {
      return res.status(400).json({ message: 'brand_id обовʼязковий' });
    }

    const result = await pool.query(
      'SELECT * FROM gpu_models WHERE brand_id = $1 ORDER BY name ASC',
      [brand_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('getModelsByBrand error:', error);
    res.status(500).json({ message: 'Помилка' });
  }
};

const createInventoryItem = async (req, res) => {
  try {
    const {
      brand_id,
      model_id,
      vendor_id,
      image_url,
      memory_capacity,
      memory_type,
      interface_type,
      core_clock_ghz,
      price,
      stock_quantity,
      is_active,
      sku,
    } = req.body;

    if (!brand_id || !model_id || !vendor_id || !price) {
      return res.status(400).json({
        message: 'Оберіть бренд, модель, виробника та вкажіть ціну',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO videocards (
        brand_id,
        model_id,
        vendor_id,
        image_url,
        memory_capacity,
        memory_type,
        interface_type,
        core_clock_ghz,
        price,
        stock_quantity,
        is_active,
        sku
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `,
      [
        brand_id,
        model_id,
        vendor_id,
        image_url || null,
        memory_capacity || null,
        memory_type || null,
        interface_type || null,
        core_clock_ghz || null,
        Number(price),
        Number(stock_quantity || 0),
        is_active ?? true,
        sku || null,
      ]
    );

    const created = await pool.query(
      `
      SELECT
        vc.*,
        'videocard' AS product_type,
        b.name AS brand_name,
        m.name AS model_name,
        v.name AS vendor_name
      FROM videocards vc
      JOIN gpu_brands b ON vc.brand_id = b.id
      JOIN gpu_models m ON vc.model_id = m.id
      JOIN gpu_vendors v ON vc.vendor_id = v.id
      WHERE vc.id = $1
      `,
      [result.rows[0].id]
    );

    res.status(201).json({
      message: 'Товар успішно створено',
      item: created.rows[0],
    });
  } catch (error) {
    console.error('createInventoryItem error:', error);
    res.status(500).json({ message: 'Помилка створення товару' });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      stock_quantity,
      price,
      is_active,
      sku,
      memory_capacity,
      memory_type,
      interface_type,
      core_clock_ghz,
      image_url,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE videocards
      SET
        stock_quantity = COALESCE($1, stock_quantity),
        price = COALESCE($2, price),
        is_active = COALESCE($3, is_active),
        sku = COALESCE($4, sku),
        memory_capacity = COALESCE($5, memory_capacity),
        memory_type = COALESCE($6, memory_type),
        interface_type = COALESCE($7, interface_type),
        core_clock_ghz = COALESCE($8, core_clock_ghz),
        image_url = COALESCE($9, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
      `,
      [
        stock_quantity !== undefined ? Number(stock_quantity) : null,
        price !== undefined ? Number(price) : null,
        is_active !== undefined ? Boolean(is_active) : null,
        sku || null,
        memory_capacity || null,
        memory_type || null,
        interface_type || null,
        core_clock_ghz || null,
        image_url || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Товар не знайдено' });
    }

    res.json({
      message: 'Товар оновлено',
      item: result.rows[0],
    });
  } catch (error) {
    console.error('updateInventoryItem error:', error);
    res.status(500).json({ message: 'Помилка оновлення' });
  }
};

const uploadInventoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не завантажено' });
    }

    res.json({ image_url: req.file.filename });
  } catch (error) {
    console.error('uploadInventoryImage error:', error);
    res.status(500).json({ message: 'Помилка завантаження зображення' });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await pool.query(
      'SELECT image_url FROM videocards WHERE id = $1',
      [id]
    );

    await pool.query('DELETE FROM videocards WHERE id = $1', [id]);

    if (item.rows[0]?.image_url) {
      const filePath = path.join(__dirname, '../images', item.rows[0].image_url);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Товар видалено' });
  } catch (error) {
    console.error('deleteInventoryItem error:', error);
    res.status(500).json({ message: 'Помилка видалення' });
  }
};

module.exports = {
  getInventoryItems,
  getInventoryMeta,
  getModelsByBrand,
  createInventoryItem,
  updateInventoryItem,
  uploadInventoryImage,
  deleteInventoryItem,
};