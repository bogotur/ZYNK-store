const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');

const {
  placeOrder,
  placeOrderMulti,
  getMyOrders,
} = require('../controllers/orderController');

router.post('/place_order', authenticateToken, placeOrder);
router.post('/place_order_multi', authenticateToken, placeOrderMulti);

router.get('/orders/my', authenticateToken, getMyOrders);

module.exports = router;