const pool = require('../db');
const path = require('path');
const fs = require('fs');

const getInventoryItems = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        vc.*,
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
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

const getInventoryMeta = async (req, res) => {
  try {
    const brands = await pool.query('SELECT * FROM gpu_brands');
    const vendors = await pool.query('SELECT * FROM gpu_vendors');

    res.json({
      brands: brands.rows,
      vendors: vendors.rows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка' });
  }
};

const getModelsByBrand = async (req, res) => {
  try {
    const { brand_id } = req.query;

    const result = await pool.query(
      'SELECT * FROM gpu_models WHERE brand_id = $1',
      [brand_id]
    );

    res.json(result.rows);
  } catch (error) {
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
      price,
      stock_quantity,
      is_active,
      sku,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO videocards 
      (brand_id, model_id, vendor_id, image_url, price, stock_quantity, is_active, sku)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        brand_id,
        model_id,
        vendor_id,
        image_url,
        price,
        stock_quantity,
        is_active,
        sku,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Помилка створення' });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity, price, is_active } = req.body;

    const result = await pool.query(
      `UPDATE videocards
       SET stock_quantity=$1, price=$2, is_active=$3
       WHERE id=$4 RETURNING *`,
      [stock_quantity, price, is_active, id]
    );

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Помилка оновлення' });
  }
};

const uploadInventoryImage = async (req, res) => {
  res.json({ image_url: req.file.filename });
};

const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await pool.query(
      'SELECT image_url FROM videocards WHERE id=$1',
      [id]
    );

    await pool.query('DELETE FROM videocards WHERE id=$1', [id]);

    if (item.rows[0]?.image_url) {
      const filePath = path.join(__dirname, '../images', item.rows[0].image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: 'Deleted' });
  } catch {
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