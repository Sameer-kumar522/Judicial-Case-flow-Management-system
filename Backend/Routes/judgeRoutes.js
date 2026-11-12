
const express = require('express');
const router = express.Router();

const {
  getJudges,
  getJudgeById,
  createJudge,
  updateJudge,
  deleteJudge
} = require('../Controllers/judgeController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getJudges);
router.get('/:id', getJudgeById);

// Admin-only routes
router.post('/', protect, authorize('Admin'), createJudge);
router.put('/:id', protect, authorize('Admin'), updateJudge);
router.delete('/:id', protect, authorize('Admin'), deleteJudge);

module.exports = router;
