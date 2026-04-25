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
// Creates a routine linked to program `:id` and current user.
router.post('/:id/routines', require('../controllers/programController').addRoutineToProgram);

module.exports = router;


