/**
 * Routes for the AI Coach feature.
 */
const express = require('express');
const router = express.Router();
const { getSessions, getMessages, createSession, deleteSession, ask } = require('../controllers/aiCoachController');
const { protect } = require('../middleware/auth');


router.use(protect);


router.get('/sessions', getSessions);

router.get('/sessions/:sessionId/messages', getMessages);

router.post('/sessions', createSession);

router.delete('/sessions/:sessionId', deleteSession);


router.post('/', ask);

module.exports = router;


