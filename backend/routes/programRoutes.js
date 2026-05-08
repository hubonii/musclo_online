/**
 * Routes for managing training programs.
 */
const express = require('express');
const router = express.Router();
const { getPrograms, createProgram, getProgram, updateProgram, deleteProgram } = require('../controllers/programController');
const { protect, verified } = require('../middleware/auth');


router.use(protect);
router.use(verified);


router.get('/', getPrograms);
router.post('/', createProgram);

router.get('/:id', getProgram);
router.put('/:id', updateProgram);
router.delete('/:id', deleteProgram);


router.post('/:programId/routines', require('../controllers/routineController').createRoutine);

module.exports = router;


