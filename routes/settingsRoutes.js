// User settings endpoints.
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

// Settings are always tied to the logged-in user.
router.use(protect);

// Read and update the same settings resource.
// Returns one settings object for the authenticated user.
router.get('/', getSettings);
// Applies partial/full updates on the authenticated user's settings row.
router.put('/', updateSettings);

module.exports = router;


