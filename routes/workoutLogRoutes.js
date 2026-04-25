// Workout log endpoints: save sessions, read history, and view stats.
const express = require('express');
const router = express.Router();
const { storeWorkout, getHistory, getWorkout, deleteWorkout, getExerciseHistory } = require('../controllers/workoutLogController');
const { getStats } = require('../controllers/analyticsController');
const { protect, verified } = require('../middleware/auth');

// Applies auth and verification middleware to all workout-log routes.
router.use(protect);
router.use(verified);

// Create and list workout logs.
router.post('/', storeWorkout);
router.get('/', getHistory);

// Compatibility alias for older frontend/tests.
// Returns the same paginated payload as `GET /`.
router.get('/history', getHistory);

// Analytics shortcuts tied to workout data.
// Reuses analytics controller summary for dashboard cards.
router.get('/stats', getStats);
// `:exerciseId` returns recent sets grouped by workout log id.
router.get('/exercise/:exerciseId/history', getExerciseHistory);

// Single log details and deletion.
router.get('/:id', getWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;


