const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, role = 'customer' } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, role]
    );
    res.status(201).json({ message: 'User registered', userId: result.rows[0].id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, role: user.role, userId: user.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected - Get current user (for frontend)
router.get('/me', verifyToken, async (req, res) => {
  const result = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [req.user.id]);
  res.json(result.rows[0]);
});

// Public endpoint for other microservices (example integration)
router.get('/users/:id', verifyToken, async (req, res) => {
  const result = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
  res.json(result.rows[0]);
});

module.exports = router;