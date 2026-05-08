// AI coach controller: manage chat sessions and stream model responses.
const { ChatSession, ChatMessage, SetData, WorkoutLog, Exercise } = require('../models');
const openRouter = require('../services/openRouterService');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.getSessions = async (req, res) => {
  try {
    // Returns sessions ordered by latest update timestamp.
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

exports.getMessages = async (req, res) => {
  try {
    // Resolve the session first to enforce user ownership before loading messages.
    const session = await ChatSession.findOne({ where: { id: req.params.sessionId, user_id: req.user.id } });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Return message history in ascending order for chat-style rendering.
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

// Create a new chat session for the authenticated user.
exports.createSession = async (req, res) => {
  try {
    // Persists a minimal session row; the first user prompt can update title later.
    const session = await ChatSession.create({
      user_id: req.user.id,
      title: 'New Chat'
    });
    res.status(201).json({ data: session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete one user-owned session.
exports.deleteSession = async (req, res) => {
  try {
    // Deletes only sessions owned by the authenticated user.
    const session = await ChatSession.findOne({ where: { id: req.params.sessionId, user_id: req.user.id } });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    await session.destroy();
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.ask = async (req, res) => {
  try {
    const { message, session_id, workout_context } = req.body;
    let session;

    // Reuse the selected session, or auto-create one if missing.
    if (session_id) {
      session = await ChatSession.findOne({ where: { id: session_id, user_id: req.user.id } });
    }

    if (!session) {
      session = await ChatSession.create({
        user_id: req.user.id,
        // Session title is initialized from the first user prompt text.
        title: message.substring(0, 40)
      });
    }

    // Save user's message before streaming the assistant response.
    await ChatMessage.create({
      chat_session_id: session.id,
      role: 'user',
      content: message
    });

    // Loads last 10 messages for model context window construction.
    const historyMessages = await ChatMessage.findAll({
      where: { chat_session_id: session.id },
      order: [['created_at', 'ASC']],
      // Keep prompt context short to control token cost and response latency.
      limit: 10
    });

    // Build additional workout context that is not directly in the current user prompt.
    const latentContext = await getLatentWorkoutContext(req.user.id, workout_context);

    // Sets Server-Sent Events headers for token streaming responses.
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');



    // Delegate prompt assembly + token streaming to OpenRouter service.
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

async function getLatentWorkoutContext(userId, context) {
  // Builds workout history context entries for prompt assembly.
  const historyContext = [];
  
  if (context && context.exercises && context.exercises.length > 0) {
    // Use only valid exercise ids from the active workout payload.
    const exerciseIds = context.exercises.map(ex => ex.id).filter(Boolean);
    
    if (exerciseIds.length > 0) {
      // Per-exercise lifetime stats for exercises in the active workout context.
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

      // Convert DB aggregate rows into context entries consumed by the prompt builder.
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
    // Fallback context when no active workout payload is provided.
    const recentLogs = await WorkoutLog.findAll({
      where: { user_id: userId, completed_at: { [Op.ne]: null } },
      order: [['completed_at', 'DESC']],
      limit: 3,
      include: [{ model: SetData, include: [Exercise] }]
    });

    recentLogs.forEach(log => {
      historyContext.push({
        type: 'recent_workout',
        // Stores date in `YYYY-MM-DD` format inside history context entries.
        date: log.completed_at.toISOString().split('T')[0],
        name: log.name,
        exercises: []
      });
    });
  }

  return historyContext;
}


