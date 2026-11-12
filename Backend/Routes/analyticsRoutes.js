const express = require('express');
const router = express.Router();

const {
  getCaseStatusDistribution,
  getJudgeWorkload,
  getMonthlyFilingTrend,
  getBenchCaseload,
  getAverageResolutionTime,
  getIndexingBenchmark
} = require('../Controllers/analyticsController');

// Pipeline 1
router.get('/status-distribution', getCaseStatusDistribution);

// Pipeline 2
router.get('/judge-workload', getJudgeWorkload);

// Pipeline 3
router.get('/monthly-filing-trend', getMonthlyFilingTrend);

// Pipeline 4
router.get('/bench-caseload', getBenchCaseload);

// Pipeline 5
router.get('/resolution-time', getAverageResolutionTime);

router.get('/indexing-demo', getIndexingBenchmark);

module.exports = router;