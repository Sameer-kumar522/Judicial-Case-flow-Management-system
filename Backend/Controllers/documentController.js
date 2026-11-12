
const fs = require('fs');
const path = require('path');

const Document = require('../models/Document');
const Case = require('../models/Case');

const uploadDir = path.join(__dirname, '..', 'uploads');

// Helper: remove uploaded file from local storage
const removeUploadedFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// GET all documents
const getDocuments = async (req, res, next) => {
  try {
    const { documentType, case: caseId } = req.query;

    const filter = {};

    if (documentType) filter.documentType = documentType;
    if (caseId) filter.case = caseId;

    const documents = await Document.find(filter)
      .populate('case', 'caseNumber title')
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// GET single document
const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('case', 'caseNumber title')
      .populate('uploadedBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// UPLOAD actual document
const createDocument = async (req, res, next) => {
  try {
    const {
      case: caseId,
      documentTitle,
      documentType
    } = req.body;

    // Check whether a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document file'
      });
    }

    // Validate required information
    if (!caseId || !documentTitle || !documentType) {
      removeUploadedFile(req.file.path);

      return res.status(400).json({
        success: false,
        message: 'Case, document title and document type are required'
      });
    }

    // Validate Case ID
    if (!require('mongoose').Types.ObjectId.isValid(caseId)) {
      removeUploadedFile(req.file.path);

      return res.status(400).json({
        success: false,
        message: 'Invalid Case ID'
      });
    }

    // Check whether case exists
    const caseExists = await Case.findById(caseId);

    if (!caseExists) {
      removeUploadedFile(req.file.path);

      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Get file extension
    const extension = path.extname(req.file.originalname).toLowerCase();

    const formatMap = {
      '.pdf': 'PDF',
      '.docx': 'DOCX',
      '.jpg': 'JPG',
      '.jpeg': 'JPG',
      '.png': 'PNG'
    };

    const fileFormat = formatMap[extension];

    if (!fileFormat) {
      removeUploadedFile(req.file.path);

      return res.status(400).json({
        success: false,
        message: 'Unsupported file format'
      });
    }

    // Calculate file size in KB
    const fileSizeKB = Math.ceil(req.file.size / 1024);

    // Save document information in MongoDB
    const document = await Document.create({
      case: caseId,
      documentTitle,
      documentType,
      fileUrl: `/uploads/${req.file.filename}`,
      fileFormat,
      fileSizeKB,
      uploadedBy: req.user._id
    });

    const populatedDocument = await Document.findById(document._id)
      .populate('case', 'caseNumber title')
      .populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: populatedDocument
    });
  } catch (error) {
    // Remove file if database operation fails
    if (req.file) {
      removeUploadedFile(req.file.path);
    }

    next(error);
  }
};

// UPDATE document metadata
const updateDocument = async (req, res, next) => {
  try {
    const allowedFields = [
      'documentTitle',
      'documentType'
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('case', 'caseNumber title')
      .populate('uploadedBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// DOWNLOAD document (protected route)
const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Only allow files stored in our uploads directory
    if (!document.fileUrl.startsWith('/uploads/')) {
      return res.status(404).json({
        success: false,
        message: 'Stored file is unavailable'
      });
    }

    const filename = path.basename(document.fileUrl);
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(filePath, filename);
  } catch (error) {
    next(error);
  }
};

// DELETE document and its physical file
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Remove physical file from uploads folder
    if (document.fileUrl.startsWith('/uploads/')) {
      const filename = path.basename(document.fileUrl);
      const filePath = path.join(uploadDir, filename);

      removeUploadedFile(filePath);
    }

    await Document.findByIdAndDelete(document._id);

    res.status(200).json({
      success: true,
      message: 'Document and its file deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  downloadDocument,
  deleteDocument
};
