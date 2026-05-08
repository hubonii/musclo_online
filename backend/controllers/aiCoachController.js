
const { ChatSession, ChatMessage, SetData, WorkoutLog, Exercise } = require('../models');
const openRouter = require('../services/openRouterService');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Retrieves all chat sessions for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.findAll({
      where: { user_id: req.user.id },
      order: [['updated_at', 'DESC']],
      limit: 20
    });
    res.json({ data: sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Retrieves message history for a specific chat session.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getMessages = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ where: { id: req.params.sessionId, user_id: req.user.id } });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const messages = await ChatMessage.findAll({
      where: { chat_session_id: session.id },
      order: [['created_at', 'ASC']],
      limit: 50
    });
    res.json({ data: messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Creates a new chat session for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createSession = async (req, res) => {
  try {
    const session = await ChatSession.create({
      user_id: req.user.id,
      title: 'New Chat'
    });
    res.status(201).json({ data: session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Deletes a specific chat session and its associated messages.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.deleteSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ where: { id: req.params.sessionId, user_id: req.user.id } });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    await session.destroy();
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Processes a user message and streams the AI coach's response via SSE.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.ask = async (req, res) => {
  try {
    const { message, session_id, workout_context } = req.body;
    let session;

    if (session_id) {
      session = await ChatSession.findOne({ where: { id: session_id, user_id: req.user.id } });
    }

    if (!session) {
      session = await ChatSession.create({
        user_id: req.user.id,
        title: message.substring(0, 40)
      });
    }

    await ChatMessage.create({
      chat_session_id: session.id,
      role: 'user',
      content: message
    });

    const historyMessages = await ChatMessage.findAll({
      where: { chat_session_id: session.id },
      order: [['created_at', 'ASC']],
      limit: 10
    });

    const latentContext = await getLatentWorkoutContext(req.user.id, workout_context);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await openRouter.askStream(
      res,
      message,
      workout_context,
      latentContext,
      historyMessages,
      session.id
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Builds additional workout history context for AI prompt enrichment.
 * @param {string} userId - ID of the authenticated user.
 * @param {Object} context - Current active workout context.
 * @returns {Promise<Array>} List of context items.
 */
async function getLatentWorkoutContext(userId, context) {
  const historyContext = [];
  
  if (context && context.exercises && context.exercises.length > 0) {
    const exerciseIds = context.exercises.map(ex => ex.id).filter(Boolean);
    
    if (exerciseIds.length > 0) {
      const stats = await SetData.findAll({
        attributes: [
          'exercise_id',
          [sequelize.fn('MAX', sequelize.col('weight_kg')), 'max_weight'],
          [sequelize.fn('SUM', sequelize.col('reps')), 'total_reps']
        ],
        include: [{
          model: WorkoutLog,
          where: { user_id: userId },
          attributes: []
        }],
        where: { exercise_id: { [Op.in]: exerciseIds } },
        group: ['exercise_id'],
        raw: true
      });

      stats.forEach(s => {
        const ex = context.exercises.find(e => e.id === s.exercise_id);
        if (ex) {
          historyContext.push({
            type: 'active_exercise_history',
            name: ex.name,
            max_weight: parseFloat(s.max_weight) || 0,
            total_reps: parseInt(s.total_reps) || 0
          });
        }
      });
    }
  } else {
    const recentLogs = await WorkoutLog.findAll({
      where: { user_id: userId, completed_at: { [Op.ne]: null } },
      order: [['completed_at', 'DESC']],
      limit: 3,
      include: [{ model: SetData, include: [Exercise] }]
    });

    recentLogs.forEach(log => {
      historyContext.push({
        type: 'recent_workout',
        date: log.completed_at.toISOString().split('T')[0],
        name: log.name,
        exercises: []
      });
    });
  }

  return historyContext;
}
