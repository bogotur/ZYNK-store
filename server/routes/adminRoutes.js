const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

const {
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getUserOrders,
  makeUserAdmin,
  deleteUser,
} = require('../controllers/adminController');

router.get('/admin/orders', authenticateToken, isAdmin, getAllOrders);
router.patch('/admin/orders/:id/status', authenticateToken, isAdmin, updateOrderStatus);

router.get('/admin/users', authenticateToken, isAdmin, getAllUsers);
router.get('/admin/users/:id/orders', authenticateToken, isAdmin, getUserOrders);
router.patch('/admin/users/:id/make-admin', authenticateToken, isAdmin, makeUserAdmin);
router.delete('/admin/users/:id', authenticateToken, isAdmin, deleteUser);

module.exports = router;