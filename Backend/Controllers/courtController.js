
const Court = require('../models/Court');
const Case = require('../models/Case');
const Judge = require('../models/Judge');

// @desc Get all courts
// @route GET /api/courts
const getCourts = async (req, res, next) => {
  try {
    const { benchLocation, courtType } = req.query;

    const filter = {};

    if (benchLocation) filter.benchLocation = benchLocation;
    if (courtType) filter.courtType = courtType;

    const courts = await Court.find(filter).sort({
      benchLocation: 1,
      roomNumber: 1
    });

    res.status(200).json({
      success: true,
      count: courts.length,
      courts
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single court by ID
// @route GET /api/courts/:id
const getCourtById = async (req, res, next) => {
  try {
    const court = await Court.findById(req.params.id);

    if (!court) {
      res.status(404);
      throw new Error('Courtroom not found.');
    }

    res.status(200).json({
      success: true,
      court
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create a new court
// @route POST /api/courts
const createCourt = async (req, res, next) => {
  try {
    const court = await Court.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Courtroom registered successfully.',
      court
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update court details
// @route PUT /api/courts/:id
const updateCourt = async (req, res, next) => {
  try {
    const court = await Court.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!court) {
      res.status(404);
      throw new Error('Courtroom not found.');
    }

    res.status(200).json({
      success: true,
      message: 'Courtroom updated successfully.',
      court
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a court safely
// @route DELETE /api/courts/:id
const deleteCourt = async (req, res, next) => {
  try {
    const court = await Court.findById(req.params.id);

    if (!court) {
      res.status(404);
      throw new Error('Courtroom not found.');
    }

    // Check whether any case is linked to this court
    const linkedCase = await Case.exists({
      court: court._id
    });

    // Check whether any judge is assigned to this court
    const linkedJudge = await Judge.exists({
      assignedCourt: court._id
    });

    if (linkedCase || linkedJudge) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete this courtroom because it is assigned to existing cases or judges.'
      });
    }

    await Court.findByIdAndDelete(court._id);

    res.status(200).json({
      success: true,
      message: 'Courtroom removed successfully.'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt
};
