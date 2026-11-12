const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },

    sequenceValue: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Counter = mongoose.model('Counter', counterSchema);

// Generate next case number
const generateNextCaseNumber = async (benchLocation, caseType) => {
  const year = new Date().getFullYear();

  const benchCode = benchLocation.toUpperCase().replace(/\s+/g, '');
  const typeCode = caseType.toUpperCase();

  const counterId = `${benchCode}-${typeCode}-${year}`;

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );

  const serialNumber = String(counter.sequenceValue).padStart(4, '0');

  return `SHC-${benchCode}-${typeCode}-${year}-${serialNumber}`;
};

module.exports = Counter;
module.exports.generateNextCaseNumber = generateNextCaseNumber;