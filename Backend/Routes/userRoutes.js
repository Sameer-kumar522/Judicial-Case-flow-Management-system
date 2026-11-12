
const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser
} = require('../Controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Admin-only user management
router.get('/', protect, authorize('Admin'), getUsers);

router.get('/:id', protect, authorize('Admin'), getUserById);

router.post('/', protect, authorize('Admin'), createUser);

router.put('/:id', protect, authorize('Admin'), updateUser);

router.patch('/:id/status', protect, authorize('Admin'), updateUserStatus);

router.delete('/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
