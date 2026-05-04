// Program endpoints: list/create programs and manage their routines.
const express = require('express');
const router = express.Router();
const { getPrograms, createProgram, getProgram, updateProgram, deleteProgram } = require('../controllers/programController');
const { protect, verified } = require('../middleware/auth');

// Programs are private to authenticated and verified users.
router.use(protect);
router.use(verified);

// Program CRUD.
router.get('/', getPrograms);
router.post('/', createProgram);
// `:id` targets one user-owned program row.
router.get('/:id', getProgram);
router.put('/:id', updateProgram);
router.delete('/:id', deleteProgram);

// Add a routine under an existing program.
// Creates a routine linked to program `:programId` and current user.
router.post('/:programId/routines', require('../controllers/routineController').createRoutine);

module.exports = router;


