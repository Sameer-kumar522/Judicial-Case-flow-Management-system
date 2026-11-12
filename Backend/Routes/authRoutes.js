const express = require('express');
const router = express.Router();

const {
  loginUser,
  registerUser,
  getMe,
  getAllUsers,
  updateUserStatusOrRole
} = require('../Controllers/authController');

const { protect, authorize } = require('../middleware/authMiddleWare');

// Public route: Login
router.post('/login', loginUser);

// Protected route: Get logged-in user profile
router.get('/me', protect, getMe);

// Admin-only routes
router.post('/register', protect, authorize('Admin'), registerUser);

router.get('/users', protect, authorize('Admin'), getAllUsers);

router.patch(
  '/users/:id',
  protect,
  authorize('Admin'),
  updateUserStatusOrRole
);

module.exports = router;