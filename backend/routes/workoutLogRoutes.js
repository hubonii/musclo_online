/**
 * Routes for recording and analyzing workout logs.
 */
const express = require('express');
const router = express.Router();
const { storeWorkout, getHistory, getWorkout, deleteWorkout, getExerciseHistory } = require('../controllers/workoutLogController');
const { getStats } = require('../controllers/analyticsController');
const { protect, verified } = require('../middleware/auth');


router.use(protect);
router.use(verified);


router.post('/', storeWorkout);
router.get('/', getHistory);

    // Returns the same paginated payload as `GET /`.
router.get('/history', getHistory);

    // Reuses analytics controller summary for dashboard cards.
router.get('/stats', getStats);

router.get('/exercise/:exerciseId/history', getExerciseHistory);


router.get('/:id', getWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;


