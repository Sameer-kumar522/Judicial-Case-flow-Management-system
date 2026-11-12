const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Case reference is required']
    },

    documentTitle: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true
    },

    documentType: {
      type: String,
      required: true,
      enum: [
        'Petition',
        'Evidence',
        'Affidavit',
        'Court Order',
        'Judgment',
        'Other'
      ]
    },

    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },

    fileFormat: {
      type: String,
      required: true,
      enum: ['PDF', 'DOCX', 'JPG', 'PNG']
    },

    fileSizeKB: {
      type: Number,
      required: true,
      min: 1
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;