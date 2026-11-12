
const express = require('express');
const router = express.Router();

const {
  getHearings,
  getHearingById,
  createHearing,
  updateHearing,
  deleteHearing,
  updateHearingStatus
} = require('../Controllers/hearingController');

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');

// View hearings — authenticated users
router.get('/', protect, getHearings);
router.get('/:id', protect, getHearingById);

// Schedule hearing — Admin and Clerk
router.post(
  '/',
  protect,
  authorize('Admin', 'Clerk'),
  createHearing
);

// Update hearing details — Admin and Clerk
router.put(
  '/:id',
  protect,
  authorize('Admin', 'Clerk'),
  updateHearing
);

// Update hearing status — Admin, Clerk and Judge
router.patch(
  '/:id/status',
  protect,
  authorize('Admin', 'Clerk', 'Judge'),
  updateHearingStatus
);

// Delete hearing — Admin only
router.delete(
  '/:id',
  protect,
  authorize('Admin'),
  deleteHearing
);

module.exports = router;
