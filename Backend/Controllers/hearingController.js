
const Hearing = require('../models/Hearing');
const Case = require('../models/Case');
const Judge = require('../models/Judge');
const Court = require('../models/Court');

// @desc Get all hearings
// @route GET /api/hearings
const getHearings = async (req, res, next) => {
  try {
    const { status, hearingType, search } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (hearingType) filter.hearingType = hearingType;

    let hearings = await Hearing.find(filter)
      .populate('case', 'caseNumber title')
      .populate('judge', 'fullName designation')
      .populate('court', 'courtName benchLocation roomNumber')
      .sort({ hearingDate: 1 });

    if (search) {
      const searchText = search.toLowerCase();

      hearings = hearings.filter((hearing) =>
        hearing.case?.caseNumber?.toLowerCase().includes(searchText) ||
        hearing.case?.title?.toLowerCase().includes(searchText) ||
        hearing.judge?.fullName?.toLowerCase().includes(searchText) ||
        hearing.court?.courtName?.toLowerCase().includes(searchText)
      );
    }

    res.status(200).json({
      success: true,
      count: hearings.length,
      hearings
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single hearing
// @route GET /api/hearings/:id
const getHearingById = async (req, res, next) => {
  try {
    const hearing = await Hearing.findById(req.params.id)
      .populate('case', 'caseNumber title')
      .populate('judge', 'fullName designation')
      .populate('court', 'courtName benchLocation roomNumber');

    if (!hearing) {
      res.status(404);
      throw new Error('Hearing not found.');
    }

    res.status(200).json({
      success: true,
      hearing
    });
  } catch (error) {
    next(error);
  }
};

// @desc Schedule a new hearing
// @route POST /api/hearings
const createHearing = async (req, res, next) => {
  try {
    const {
      case: caseId,
      judge: judgeId,
      court: courtId,
      hearingDate
    } = req.body;

    if (!caseId || !judgeId || !courtId || !hearingDate) {
      return res.status(400).json({
        success: false,
        message: 'Case, Judge, Court and Hearing Date are required.'
      });
    }

    const [caseExists, judgeExists, courtExists] = await Promise.all([
      Case.findById(caseId),
      Judge.findById(judgeId),
      Court.findById(courtId)
    ]);

    if (!caseExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected case not found.'
      });
    }

    if (!judgeExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected judge not found.'
      });
    }

    if (!courtExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected court not found.'
      });
    }

   const assignedCourtId = judgeExists.assignedCourt
  ? judgeExists.assignedCourt.toString()
  : '';

console.log('Selected Court ID:', courtId);
console.log('Judge Assigned Court ID:', assignedCourtId);

if (assignedCourtId !== courtId.toString()) {
  return res.status(400).json({
    success: false,
    message: 'Selected judge is not assigned to this court.',
    debug: {
      selectedCourtId: courtId,
      judgeAssignedCourtId: assignedCourtId
    }
  });
}

    const hearing = await Hearing.create(req.body);

    const populatedHearing = await Hearing.findById(hearing._id)
      .populate('case', 'caseNumber title')
      .populate('judge', 'fullName designation')
      .populate('court', 'courtName benchLocation roomNumber');

    res.status(201).json({
      success: true,
      message: 'Hearing scheduled successfully.',
      hearing: populatedHearing
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update hearing
// @route PUT /api/hearings/:id
const updateHearing = async (req, res, next) => {
  try {
    const hearing = await Hearing.findById(req.params.id);

    if (!hearing) {
      res.status(404);
      throw new Error('Hearing not found.');
    }

    const hasReferenceChanges =
      req.body.case !== undefined ||
      req.body.judge !== undefined ||
      req.body.court !== undefined;

    if (hasReferenceChanges) {
      const finalCaseId = req.body.case || hearing.case.toString();
      const finalJudgeId = req.body.judge || hearing.judge.toString();
      const finalCourtId = req.body.court || hearing.court.toString();

      const [caseExists, judgeExists, courtExists] = await Promise.all([
        Case.findById(finalCaseId),
        Judge.findById(finalJudgeId),
        Court.findById(finalCourtId)
      ]);

      if (!caseExists || !judgeExists || !courtExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Case, Judge or Court reference.'
        });
      }

      if (
        !judgeExists.assignedCourt ||
        judgeExists.assignedCourt.toString() !== finalCourtId
      ) {
        return res.status(400).json({
          success: false,
          message: 'Selected judge is not assigned to this court.'
        });
      }
    }

    const allowedFields = [
      'case',
      'judge',
      'court',
      'hearingDate',
      'hearingType',
      'status',
      'proceedingsSummary',
      'nextHearingDate'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        hearing[field] = req.body[field];
      }
    });

    await hearing.save();

    const updatedHearing = await Hearing.findById(hearing._id)
      .populate('case', 'caseNumber title')
      .populate('judge', 'fullName designation')
      .populate('court', 'courtName benchLocation roomNumber');

    res.status(200).json({
      success: true,
      message: 'Hearing updated successfully.',
      hearing: updatedHearing
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete hearing
// @route DELETE /api/hearings/:id
const deleteHearing = async (req, res, next) => {
  try {
    const hearing = await Hearing.findByIdAndDelete(req.params.id);

    if (!hearing) {
      res.status(404);
      throw new Error('Hearing not found.');
    }

    res.status(200).json({
      success: true,
      message: 'Hearing deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update hearing status
// @route PATCH /api/hearings/:id/status
const updateHearingStatus = async (req, res, next) => {
  try {
    const { status, proceedingsSummary, nextHearingDate } = req.body;

    const allowedStatuses = [
      'Scheduled',
      'Completed',
      'Adjourned',
      'Cancelled'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hearing status.'
      });
    }

    const hearing = await Hearing.findById(req.params.id);

    if (!hearing) {
      res.status(404);
      throw new Error('Hearing not found.');
    }

    hearing.status = status;

    if (proceedingsSummary !== undefined) {
      hearing.proceedingsSummary = proceedingsSummary;
    }

    if (nextHearingDate !== undefined) {
      hearing.nextHearingDate = nextHearingDate || null;
    }

    await hearing.save();

    res.status(200).json({
      success: true,
      message: 'Hearing status updated successfully.',
      hearing
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHearings,
  getHearingById,
  createHearing,
  updateHearing,
  deleteHearing,
  updateHearingStatus
};
