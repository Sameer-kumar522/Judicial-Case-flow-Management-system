
const express = require('express');
const router = express.Router();

const {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  downloadDocument,
  deleteDocument
} = require('../Controllers/documentController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protected read routes
router.get('/', protect, getDocuments);
router.get('/:id/download', protect, downloadDocument);
router.get('/:id', protect, getDocumentById);

// Protected write routes
router.post(
  '/',
  protect,
  authorize('Admin', 'Clerk'),
  upload.single('document'),
  createDocument
);

router.put(
  '/:id',
  protect,
  authorize('Admin', 'Clerk'),
  updateDocument
);

router.delete(
  '/:id',
  protect,
  authorize('Admin'),
  deleteDocument
);

module.exports = router;
