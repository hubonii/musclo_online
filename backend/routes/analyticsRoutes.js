// Analytics endpoints for progress charts and training insights.
const express = require('express');
const router = express.Router();
const { getStats, getProgression, getVolumeAnalytics, getCalendar, getAnatomy, getSymmetry } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Analytics are private to each user's data.
router.use(protect);

// Overview and muscle distribution views.
router.get('/stats', getStats);
router.get('/anatomy', getAnatomy);
router.get('/symmetry', getSymmetry);

// Trend and time-based analytics.
// `:exerciseId` returns progression points for one exercise over time.
router.get('/progression/:exerciseId', getProgression);
router.get('/volume', getVolumeAnalytics);
// Backward-compatible alias used by older clients/tests.
router.get('/volume-analytics', getVolumeAnalytics);
// Calendar endpoint returns workout-day activity map.
router.get('/calendar', getCalendar);

module.exports = router;


