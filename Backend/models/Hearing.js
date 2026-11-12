const mongoose = require('mongoose');

const hearingSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Case reference is required']
    },

    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Judge',
      required: [true, 'Judge reference is required']
    },

    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: [true, 'Court reference is required']
    },

    hearingDate: {
      type: Date,
      required: [true, 'Hearing date is required']
    },

    hearingType: {
      type: String,
      enum: ['Initial', 'Regular', 'Final', 'Emergency'],
      default: 'Regular'
    },

    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Adjourned', 'Cancelled'],
      default: 'Scheduled'
    },

    proceedingsSummary: {
      type: String,
      default: ''
    },

    nextHearingDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Hearing = mongoose.model('Hearing', hearingSchema);

module.exports = Hearing;