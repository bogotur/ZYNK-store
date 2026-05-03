const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  getInventoryItems,
  getInventoryMeta,
  getModelsByBrand,
  createInventoryItem,
  updateInventoryItem,
  uploadInventoryImage,
  deleteInventoryItem,
} = require('../controllers/inventoryController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../images'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.get('/admin/inventory', getInventoryItems);
router.get('/admin/inventory/meta', getInventoryMeta);
router.get('/admin/inventory/models', getModelsByBrand);

router.post('/admin/inventory/upload-image', upload.single('image'), uploadInventoryImage);
router.post('/admin/inventory', createInventoryItem);
router.patch('/admin/inventory/:id', updateInventoryItem);
router.delete('/admin/inventory/:id', deleteInventoryItem);

module.exports = router;