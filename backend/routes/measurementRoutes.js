/**
 * Routes for managing body measurement records.
 */
const express = require('express');
const router = express.Router();
const { getMeasurements, createMeasurement, updateMeasurement, deleteMeasurement } = require('../controllers/measurementController');
const { protect } = require('../middleware/auth');


router.use(protect);


router.get('/', getMeasurements);
router.post('/', createMeasurement);

router.put('/:id', updateMeasurement);
router.delete('/:id', deleteMeasurement);

module.exports = router;


