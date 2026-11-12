
const Judge = require('../models/Judge');

// Get all judges with optional filters
const getJudges = async (req, res, next) => {
  try {
    const { status, designation } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (designation) filter.designation = designation;

    const judges = await Judge.find(filter)
      .populate('assignedCourt', 'courtName benchLocation roomNumber')
      .sort({ designation: 1, fullName: 1 });

    res.status(200).json({
      success: true,
      count: judges.length,
      judges
    });
  } catch (error) {
    next(error);
  }
};

// Get single judge by ID
const getJudgeById = async (req, res, next) => {
  try {
    const judge = await Judge.findById(req.params.id)
      .populate('assignedCourt');

    if (!judge) {
      res.status(404);
      throw new Error('Judge not found.');
    }

    res.status(200).json({
      success: true,
      judge
    });
  } catch (error) {
    next(error);
  }
};

// Register a new judge
const createJudge = async (req, res, next) => {
  try {
    const judge = await Judge.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Judge profile created successfully.',
      judge
    });
  } catch (error) {
    next(error);
  }
};

// Update judge profile
const updateJudge = async (req, res, next) => {
  try {
    const judge = await Judge.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('assignedCourt');

    if (!judge) {
      res.status(404);
      throw new Error('Judge not found.');
    }

    res.status(200).json({
      success: true,
      message: 'Judge updated successfully.',
      judge
    });
  } catch (error) {
    next(error);
  }
};

// Delete judge profile
const deleteJudge = async (req, res, next) => {
  try {
    const judge = await Judge.findByIdAndDelete(req.params.id);

    if (!judge) {
      res.status(404);
      throw new Error('Judge not found.');
    }

    res.status(200).json({
      success: true,
      message: 'Judge profile deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJudges,
  getJudgeById,
  createJudge,
  updateJudge,
  deleteJudge
};
