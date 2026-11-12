
const Case = require('../models/Case');
const Court = require('../models/Court');
const Counter = require('../models/Counter');

const { generateNextCaseNumber } = Counter;

// Allowed case status transitions
const validTransitions = {
  'Pending': ['Under Review'],
  'Under Review': ['In Progress'],
  'In Progress': ['Disposed'],
  'Disposed': []
};

// GET all cases + filters + text search
const getCases = async (req, res, next) => {
  try {
    const { status, caseType, priority, search } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (caseType) filter.caseType = caseType;
    if (priority) filter.priority = priority;

    if (search) {
      filter.$text = { $search: search };
    }

    const cases = await Case.find(filter)
      .populate('court', 'courtName benchLocation')
      .populate('assignedJudge', 'fullName designation')
      .populate('registeredBy', 'name email')
      .sort({ filingDate: -1 });

    res.status(200).json({
      success: true,
      count: cases.length,
      data: cases
    });
  } catch (error) {
    next(error);
  }
};

// GET single case
const getCaseById = async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('court')
      .populate('assignedJudge')
      .populate('registeredBy', 'name email');

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.status(200).json({
      success: true,
      data: caseData
    });
  } catch (error) {
    next(error);
  }
};

// REGISTER new case
const registerCase = async (req, res, next) => {
  try {
    const {
      title,
      description,
      caseType,
      priority,
      court,
      assignedJudge,
      plaintiff,
      defendant
    } = req.body;

    if (!title || !description || !caseType || !court ||
        !plaintiff?.name || !defendant?.name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required case information'
      });
    }

    const courtData = await Court.findById(court);

    if (!courtData) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    const caseNumber = await generateNextCaseNumber(
      courtData.benchLocation,
      caseType
    );

    const newCase = await Case.create({
      caseNumber,
      title,
      description,
      caseType,
      priority,
      court,
      assignedJudge,
      plaintiff,
      defendant,
      registeredBy: req.user._id,
      statusHistory: [{
        status: 'Pending',
        remarks: 'Case registered'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Case registered successfully',
      data: newCase
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE case details
const updateCase = async (req, res, next) => {
  try {
    const allowedFields = [
      'title',
      'description',
      'caseType',
      'priority',
      'court',
      'assignedJudge',
      'plaintiff',
      'defendant'
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: updatedCase
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE case status with transition validation
const updateCaseStatus = async (req, res, next) => {
  try {
    const { nextStatus, remarks } = req.body;

    if (!nextStatus) {
      return res.status(400).json({
        success: false,
        message: 'Please provide nextStatus'
      });
    }

    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    const allowedNextStatuses = validTransitions[caseData.status];

    if (!allowedNextStatuses?.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${caseData.status} to ${nextStatus}`
      });
    }

    caseData.status = nextStatus;

    if (nextStatus === 'Disposed') {
      caseData.disposalDate = new Date();
    }

    caseData.statusHistory.push({
      status: nextStatus,
      remarks: remarks || ''
    });

    await caseData.save();

    res.status(200).json({
      success: true,
      message: 'Case status updated successfully',
      data: caseData
    });
  } catch (error) {
    next(error);
  }
};

// DELETE case
const deleteCase = async (req, res, next) => {
  try {
    const deletedCase = await Case.findByIdAndDelete(req.params.id);

    if (!deletedCase) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCases,
  getCaseById,
  registerCase,
  updateCase,
  updateCaseStatus,
  deleteCase
};
