// Routes for body measurement CRUD endpoints.
const express = require('express');
const router = express.Router();
const { getMeasurements, createMeasurement, updateMeasurement, deleteMeasurement } = require('../controllers/measurementController');
const { protect } = require('../middleware/auth');

// Measurements belong to the current user.
router.use(protect);

// CRUD for measurement entries.
router.get('/', getMeasurements);
router.post('/', createMeasurement);
// `:id` targets one measurement row owned by current user.
router.put('/:id', updateMeasurement);
router.delete('/:id', deleteMeasurement);

module.exports = router;


