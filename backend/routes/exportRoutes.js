/**
 * Routes for exporting user data.
 */
const express = require('express');
const router = express.Router();
const { exportCsv } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');


router.use(protect);


router.get('/csv', exportCsv);

module.exports = router;


