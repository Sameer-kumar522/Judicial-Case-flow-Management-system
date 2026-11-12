const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    caseType: {
      type: String,
      required: true,
      enum: ['Civil', 'Criminal', 'Constitutional', 'Family', 'Other']
    },

    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },

    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'In Progress', 'Disposed'],
      default: 'Pending'
    },

    filingDate: {
      type: Date,
      default: Date.now
    },

    disposalDate: {
      type: Date,
      default: null
    },

    assignedJudge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Judge',
      default: null
    },

    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true
    },

    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    plaintiff: {
      name: {
        type: String,
        required: true,
        trim: true
      }
    },

    defendant: {
      name: {
        type: String,
        required: true,
        trim: true
      }
    },

    statusHistory: [
      {
        status: {
          type: String,
          required: true
        },
        changedAt: {
          type: Date,
          default: Date.now
        },
        remarks: {
          type: String,
          default: ''
        }
      }
    ]
  },
  {
    timestamps: true
  }
);


const Case = mongoose.model('Case', caseSchema);
// Text search index
caseSchema.index({
  title: 'text',
  description: 'text',
  caseNumber: 'text',
  'plaintiff.name': 'text',
  'defendant.name': 'text'
});
// Compound index for analytics benchmark
caseSchema.index(
  {
    status: 1,
    caseType: 1,
    filingDate: 1
  },
  {
    name: 'idx_status_casetype_filingdate'
  }
);

module.exports = Case;