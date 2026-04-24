// Data export endpoints (currently CSV).
const express = require('express');
const router = express.Router();
const { exportCsv } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

// Route-level auth middleware for user-scoped export payloads.
router.use(protect);

// Generate and download CSV export.
// Exports workout + set history rows for the authenticated user only.
router.get('/csv', exportCsv);

module.exports = router;


