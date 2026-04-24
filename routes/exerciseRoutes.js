// Exercise endpoints: browse, create, and favorite exercises.
const express = require('express');
const router = express.Router();
const { getExercises, getCategories, getFilters, toggleFavorite, getFavorites } = require('../controllers/exerciseController');
const { protect } = require('../middleware/auth');

// All exercise routes require a signed-in user.
router.use(protect);

// Exercise catalog and metadata.
router.get('/', getExercises);
// Inline import keeps this file aligned with legacy export style in controller.
router.post('/', require('../controllers/exerciseController').createExercise);
router.get('/categories', getCategories);
router.get('/filters', getFilters);
// Returns user's favorite exercise list from pivot table relation.
router.get('/favorites', getFavorites);

// Single exercise details + favorite toggle.
// `:id` resolves one exercise details payload.
router.get('/:id', require('../controllers/exerciseController').getExercise);
// `:exerciseId` toggles favorite state for current user.
router.post('/:exerciseId/favorite', toggleFavorite);

module.exports = router;


