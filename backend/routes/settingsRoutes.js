/**
 * Routes for user-specific application settings.
 */
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, verified } = require('../middleware/auth');


router.use(protect);


router.get('/', verified, getSettings);

router.put('/', verified, updateSettings);

module.exports = router;


