
const Case = require('../models/Case');

// ==========================================
// PIPELINE 1: Case Status Distribution
// ==========================================

const getCaseStatusDistribution = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const data = await Case.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PIPELINE 2: Judge Workload
// ==========================================

const getJudgeWorkload = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $match: {
          status: { $ne: 'Disposed' },
          assignedJudge: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$assignedJudge',
          activeCasesCount: { $sum: 1 },
          caseTypes: { $addToSet: '$caseType' }
        }
      },
      {
        $lookup: {
          from: 'judges',
          localField: '_id',
          foreignField: '_id',
          as: 'judgeDetails'
        }
      },
      {
        $unwind: '$judgeDetails'
      },
      {
        $project: {
          judgeName: '$judgeDetails.fullName',
          designation: '$judgeDetails.designation',
          specialization: '$judgeDetails.specialization',
          activeCasesCount: 1,
          caseTypesHandled: '$caseTypes'
        }
      },
      {
        $sort: { activeCasesCount: -1 }
      }
    ];

    const data = await Case.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PIPELINE 3: Monthly Filing Trends
// ==========================================

const getMonthlyFilingTrend = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $project: {
          year: { $year: '$filingDate' },
          month: { $month: '$filingDate' }
        }
      },
      {
        $group: {
          _id: {
            year: '$year',
            month: '$month'
          },
          totalFiled: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalFiled: 1
        }
      },
      {
        $sort: {
          year: 1,
          month: 1
        }
      }
    ];

    const data = await Case.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PIPELINE 4: Bench Caseload
// ==========================================

const getBenchCaseload = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'courts',
          localField: 'court',
          foreignField: '_id',
          as: 'courtInfo'
        }
      },
      {
        $unwind: '$courtInfo'
      },
      {
        $group: {
          _id: '$courtInfo.benchLocation',
          totalCases: { $sum: 1 },
          urgentCases: {
            $sum: {
              $cond: [
                { $eq: ['$priority', 'Urgent'] },
                1,
                0
              ]
            }
          },
          disposedCases: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Disposed'] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          benchLocation: '$_id',
          totalCases: 1,
          urgentCases: 1,
          activeCases: {
            $subtract: ['$totalCases', '$disposedCases']
          },
          disposedCases: 1
        }
      },
      {
        $sort: { totalCases: -1 }
      }
    ];

    const data = await Case.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PIPELINE 5: Average Resolution Time
// ==========================================

const getAverageResolutionTime = async (req, res, next) => {
  try {
    const pipeline = [
     {
  $match: {
    status: 'Disposed',
    disposalDate: { $type: 'date' },
    filingDate: { $type: 'date' }
  }
},
      {
        $project: {
          caseType: 1,
          resolutionDays: {
            $divide: [
              { $subtract: ['$disposalDate', '$filingDate'] },
              86400000
            ]
          }
        }
      },
      {
        $group: {
          _id: '$caseType',
          disposedCount: { $sum: 1 },
          avgDaysToDispose: { $avg: '$resolutionDays' },
          minDays: { $min: '$resolutionDays' },
          maxDays: { $max: '$resolutionDays' }
        }
      },
      {
        $project: {
          _id: 0,
          caseType: '$_id',
          disposedCount: 1,
          avgDaysToDispose: {
            $round: ['$avgDaysToDispose', 1]
          },
          minDays: 1,
          maxDays: 1
        }
      },
      {
        $sort: { avgDaysToDispose: -1 }
      }
    ];

    const data = await Case.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Pipeline 6: Index Performance Benchmark
const getIndexingBenchmark = async (req, res, next) => {
  try {
    const filter = {
      status: 'Pending',
      caseType: 'Civil'
    };

    const sort = { filingDate: 1 };

    // Query without index
    const collScanExplain = await Case.find(filter)
      .sort(sort)
      .hint({ $natural: 1 })
      .explain('executionStats');

    // Query with compound index
    const indexScanExplain = await Case.find(filter)
      .sort(sort)
      .hint('idx_status_casetype_filingdate')
      .explain('executionStats');

    const collStats = collScanExplain.executionStats;
    const idxStats = indexScanExplain.executionStats;

    // Find scan stage, including nested stages
    const findStage = (node, target) => {
      if (!node || typeof node !== 'object') return false;

      if (node.stage === target) return true;

      return Object.values(node).some(value =>
        Array.isArray(value)
          ? value.some(item => findStage(item, target))
          : findStage(value, target)
      );
    };

    const benchmark = {
      queryTested: { filter, sort },

      comparison: {
        withoutIndex: {
          stage: findStage(
            collScanExplain.queryPlanner.winningPlan,
            'COLLSCAN'
          ) ? 'COLLSCAN' : 'OTHER',
          executionTimeMillis: collStats.executionTimeMillis,
          totalDocsExamined: collStats.totalDocsExamined,
          totalKeysExamined: collStats.totalKeysExamined,
          docsReturned: collStats.nReturned
        },

        withCompoundIndex: {
          indexName: 'idx_status_casetype_filingdate',
          stage: findStage(
            indexScanExplain.queryPlanner.winningPlan,
            'IXSCAN'
          ) ? 'IXSCAN' : 'OTHER',
          executionTimeMillis: idxStats.executionTimeMillis,
          totalDocsExamined: idxStats.totalDocsExamined,
          totalKeysExamined: idxStats.totalKeysExamined,
          docsReturned: idxStats.nReturned
        }
      }
    };

    res.status(200).json({
      success: true,
      benchmark
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCaseStatusDistribution,
  getJudgeWorkload,
  getMonthlyFilingTrend,
  getBenchCaseload,
  getAverageResolutionTime,
  getIndexingBenchmark
};