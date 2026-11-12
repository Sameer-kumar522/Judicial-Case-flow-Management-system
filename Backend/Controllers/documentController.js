

const path = require('path');
const mongoose = require('mongoose');

const supabase = require('../config/supabase');
const Document = require('../models/Document');
const Case = require('../models/Case');

const BUCKET_NAME = 'cfms-documents';

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

// UPLOAD document to Supabase Storage
const createDocument = async (req, res, next) => {
  let uploadedPath = null;

  try {
    const {
      case: caseId,
      documentTitle,
      documentType
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document file'
      });
    }

    if (!caseId || !documentTitle || !documentType) {
      return res.status(400).json({
        success: false,
        message: 'Case, document title and document type are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Case ID'
      });
    }

    const caseExists = await Case.findById(caseId);

    if (!caseExists) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

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
      return res.status(400).json({
        success: false,
        message: 'Unsupported file format'
      });
    }

    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9);

    uploadedPath = `${caseId}/${uniqueName}${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uploadedPath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const fileSizeKB = Math.ceil(req.file.size / 1024);

    const document = await Document.create({
      case: caseId,
      documentTitle,
      documentType,
      fileUrl: uploadedPath,
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
    if (uploadedPath) {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([uploadedPath]);
    }

    next(error);
  }
};

// UPDATE document metadata
const updateDocument = async (req, res, next) => {
  try {
    const allowedFields = ['documentTitle', 'documentType'];
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

// DOWNLOAD document from private Supabase bucket
const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(document.fileUrl, 60);

    if (error) throw error;

    res.status(200).json({
      success: true,
      downloadUrl: data.signedUrl
    });
  } catch (error) {
    next(error);
  }
};

// DELETE document from Supabase and MongoDB
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([document.fileUrl]);

    if (error) throw error;

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
