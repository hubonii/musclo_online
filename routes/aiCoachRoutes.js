// AI coach chat endpoints: sessions, messages, and ask actions.
const express = require('express');
const router = express.Router();
const { getSessions, getMessages, createSession, deleteSession, ask } = require('../controllers/aiCoachController');
const { protect } = require('../middleware/auth');

// Chat history is private to the authenticated user.
router.use(protect);

// Session management.
// Returns up to 20 recent sessions for the current user.
router.get('/sessions', getSessions);
// Returns chronological message history for one user-owned session.
router.get('/sessions/:sessionId/messages', getMessages);
// Creates an empty session row so UI can open a new chat thread.
router.post('/sessions', createSession);
// Removes one session and its related messages via DB relations.
router.delete('/sessions/:sessionId', deleteSession);

// Send a prompt to the coach model.
router.post('/', ask);

module.exports = router;


