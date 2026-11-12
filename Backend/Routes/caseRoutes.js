
const express = require('express');
const router = express.Router();

const {
  getCases,
  getCaseById,
  registerCase,
  updateCase,
  updateCaseStatus,
  deleteCase
} = require('../Controllers/caseController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public read routes
router.get('/', getCases);
router.get('/:id', getCaseById);

// Protected routes
router.post('/', protect, authorize('Admin', 'Clerk'), registerCase);
router.put('/:id', protect, authorize('Admin', 'Clerk'), updateCase);
router.patch('/:id/status', protect, authorize('Admin', 'Clerk', 'Judge'), updateCaseStatus);
router.delete('/:id', protect, authorize('Admin'), deleteCase);

module.exports = router;
