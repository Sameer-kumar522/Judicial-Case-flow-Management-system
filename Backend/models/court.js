const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema(
  {
    courtName: {
      type: String,
      required: [true, 'Court name is required'],
      trim: true
    },

    benchLocation: {
      type: String,
      required: [true, 'Bench location is required'],
      trim: true
    },

    courtType: {
      type: String,
      required: true,
      enum: ['High Court', 'Circuit Court', 'Bench']
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Court = mongoose.model('Court', courtSchema);

module.exports = Court;