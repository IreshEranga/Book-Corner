const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserRepository = require('../repositories/UserRepository');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// ===================== REGISTER =====================
router.post('/register', async (req, res) => {
  const { username, email, password, role = 'customer' } = req.body;

  try {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = await UserRepository.create({ username, email, password, role });

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.toPublicJSON()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== LOGIN =====================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserRepository.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { 
        id: user._id.toString(),     // MongoDB uses _id
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      role: user.role,
      userId: user._id.toString(),
      username: user.username,
      message: 'Login successful'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== GET CURRENT USER (protected) =====================
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await UserRepository.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.toPublicJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== PUBLIC ENDPOINT (other microservices) =====================
router.get('/users/:id', verifyToken, async (req, res) => {
  try {
    const user = await UserRepository.getPublicUser(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;