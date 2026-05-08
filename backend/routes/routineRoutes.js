/**
 * Routes for managing training routine templates.
 */
const express = require('express');
const router = express.Router();
const { getTodayRoutine, getProgramRoutines, createRoutine, getRoutine, updateRoutine, deleteRoutine, getLastLog } = require('../controllers/routineController');
const { protect, verified } = require('../middleware/auth');


router.use(protect);
router.use(verified);


router.get('/today', getTodayRoutine);
router.post('/', createRoutine);

router.get('/:id/last-log', getLastLog);

router.get('/:id', getRoutine);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);



router.get('/program/:programId', getProgramRoutines);

router.post('/program/:programId', createRoutine);

module.exports = router;


