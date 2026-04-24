// Routine endpoints: today's plan, routine details, and program routines.
const express = require('express');
const router = express.Router();
const { getTodayRoutine, getProgramRoutines, createRoutine, getRoutine, updateRoutine, deleteRoutine, getLastLog } = require('../controllers/routineController');
const { protect } = require('../middleware/auth');

// Every routine request requires authentication.
router.use(protect);

// Daily flow and single-routine actions.
router.get('/today', getTodayRoutine);
// Returns the most recent workout log linked to routine `:id`.
router.get('/:id/last-log', getLastLog);
// CRUD operations for one routine id.
router.get('/:id', getRoutine);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);

// Nested routes under a specific program.
// Lists routines owned by current user for one program.
router.get('/program/:programId', getProgramRoutines);
// Creates a routine row linked to `:programId`.
router.post('/program/:programId', createRoutine);

module.exports = router;


