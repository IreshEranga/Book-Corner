const express = require('express');
const UserRepository = require('../repositories/UserRepository');
const verifyToken = require('../middleware/auth');
const adminAuth = require('../middleware/admin');

const router = express.Router();

// ALL ROUTES BELOW ARE ADMIN ONLY
router.use(verifyToken);
router.use(adminAuth);

// 1. STATS + MONTHLY CHART (must be FIRST)
router.get('/stats', async (req, res) => {
  try {
    const stats = await UserRepository.getStats();
    const monthly = await UserRepository.getMonthlyNewUsers();
    res.json({ 
      ...stats, 
      monthly 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET ALL USERS WITH FILTERS + PAGINATION
router.get('/', async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      role: req.query.role,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sortBy: req.query.sortBy || 'created_at',
      order: req.query.order || 'DESC'
    };

    const result = await UserRepository.findAllWithFilters(filters);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET SINGLE USER
router.get('/:id', async (req, res) => {
  try {
    const user = await UserRepository.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.toPublicJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. UPDATE USER
router.patch('/:id', async (req, res) => {
  try {
    const updatedUser = await UserRepository.update(req.params.id, req.body);
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user: updatedUser.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. DELETE USER
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await UserRepository.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;