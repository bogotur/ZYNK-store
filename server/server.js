const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const videocardRoutes = require('./routes/videocardRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const pool = require('./db');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running' });
});

app.use('/', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videocards', videocardRoutes);
app.use('/', orderRoutes);
app.use('/', adminRoutes);
app.use('/', inventoryRoutes);

pool.connect()
  .then((client) => {
    client.release();
    console.log('Connected to PostgreSQL');
  })
  .catch((err) => {
    console.error('PostgreSQL connection error:', err);
  });

const PORT = process.env.PORT || 8108;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});