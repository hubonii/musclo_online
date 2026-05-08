/**
 * Routes for training analytics and progress insights.
 */
const express = require('express');
const router = express.Router();
const { getStats, getProgression, getVolumeAnalytics, getCalendar, getAnatomy } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.get('/anatomy', getAnatomy);



router.get('/progression/:exerciseId', getProgression);
router.get('/volume', getVolumeAnalytics);
    // Backward-compatible alias used by older clients/tests.
router.get('/volume-analytics', getVolumeAnalytics);

router.get('/calendar', getCalendar);

module.exports = router;


