const express = require('express');
const router = express.Router();

const {
  getCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt
} = require('../Controllers/courtController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getCourts);
router.get('/:id', getCourtById);

// Admin-only routes
router.post('/', protect, authorize('Admin'), createCourt);
router.put('/:id', protect, authorize('Admin'), updateCourt);
router.delete('/:id', protect, authorize('Admin'), deleteCourt);

module.exports = router;