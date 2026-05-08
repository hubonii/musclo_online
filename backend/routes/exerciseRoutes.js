/**
 * Routes for browsing, creating, and favoriting exercises.
 */
const express = require('express');
const router = express.Router();
const { getExercises, getCategories, getFilters, toggleFavorite, getFavorites } = require('../controllers/exerciseController');
const { protect } = require('../middleware/auth');


router.use(protect);


router.get('/', getExercises);

router.post('/', require('../controllers/exerciseController').createExercise);
router.get('/categories', getCategories);
router.get('/filters', getFilters);

router.get('/favorites', getFavorites);



router.get('/:id', require('../controllers/exerciseController').getExercise);

router.post('/:exerciseId/favorite', toggleFavorite);

module.exports = router;


