// User settings endpoints.
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, verified } = require('../middleware/auth');

// Settings are always tied to the logged-in user.
router.use(protect);

// Read and update the same settings resource.
// Returns one settings object for the authenticated user.
router.get('/', verified, getSettings);
// Applies partial/full updates on the authenticated user's settings row.
router.put('/', verified, updateSettings);

module.exports = router;


