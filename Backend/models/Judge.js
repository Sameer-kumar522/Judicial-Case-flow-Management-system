const mongoose = require('mongoose');

const judgeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Judge name is required'],
      trim: true
    },

    designation: {
      type: String,
      required: [true, 'Designation is required'],
      enum: ['Chief Justice', 'Senior Judge', 'Justice']
    },

    specialization: {
      type: String,
      required: true,
      trim: true
    },

    assignedCourt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: [true, 'Assigned court is required']
    },

    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Retired'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

const Judge = mongoose.model('Judge', judgeSchema);

module.exports = Judge;