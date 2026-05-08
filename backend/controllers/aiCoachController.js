const { User, ChatSession, ChatMessage, SetData, WorkoutLog, Exercise } = require('../models');
const axios = require('axios');
const openRouter = require('../services/openRouterService');
const achievementService = require('../services/achievementService');
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
      order: [['updatedAt', 'DESC']], // Use field name for Sequelize ordering
      limit: 50
    });
    res.json({ data: sessions });
  } catch (err) {
    console.error('[AI Coach] getSessions failed:', err);
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
      limit: 100 // Increased for deeper history
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
      title: 'New Discussion'
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
        title: message.substring(0, 50).trim() + (message.length > 50 ? '...' : '')
      });
    } else {
      // Touch the session to update updated_at and move it to the top of the list
      session.changed('updated_at', true);
      await session.save();
    }

    await ChatMessage.create({
      chat_session_id: session.id,
      role: 'user',
      content: message
    });

    const historyMessages = await ChatMessage.findAll({
      where: { chat_session_id: session.id },
      order: [['created_at', 'ASC']],
      limit: 50 // Increased for better AI context memory
    });

    const latentContext = await getLatentWorkoutContext(req.user.id, workout_context, session);

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

    // Periodic memory consolidation for long threads
    const msgCount = await ChatMessage.count({ where: { chat_session_id: session.id } });
    if (msgCount >= 10 && msgCount % 4 === 0) {
      consolidateMemory(session.id).catch(err => console.error('[Memory] Consolidation failed:', err));
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Summarizes the conversation so far and updates the session's latent memory.
 * @param {number} sessionId - ID of the chat session to summarize.
 */
async function consolidateMemory(sessionId) {
  try {
    const messages = await ChatMessage.findAll({
      where: { chat_session_id: sessionId },
      order: [['created_at', 'ASC']],
      limit: 100 // Summarize everything
    });

    const session = await ChatSession.findByPk(sessionId);
    if (!session) return;

    const summaryPrompt = "Summarize the key takeaways, user goals, and important fitness facts from this conversation so far. "
      + "This summary will be used as long-term memory for the AI Coach. Be concise, bulleted, and maintain the user's language (Arabic or English).";

    const chatHistory = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    const response = await axios.post(`${process.env.AI_ENGINE_BASE_URL}/chat/completions`, {
      model: process.env.AI_ENGINE_MODEL || 'openai/gpt-oss-120b:free',
      messages: [
        { role: 'system', content: summaryPrompt },
        { role: 'user', content: `CONVERSATION LOG:\n${chatHistory}` }
      ],
      temperature: 0.3
    }, {
      headers: { 
        'Authorization': `Bearer ${process.env.AI_ENGINE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const newMemory = response.data.choices[0].message.content;
    await session.update({ latent_memory: newMemory });
    console.log(`[Memory] Session ${sessionId} consolidated.`);

  } catch (err) {
    console.error('[Memory] Update failed:', err.response?.data || err.message);
  }
}

async function getLatentWorkoutContext(userId, context, session) {
  const historyContext = [];
  
  try {
    // 0. Latent Memory (Long-term Context from past summaries)
    if (session && session.latent_memory) {
      historyContext.push({
        type: 'latent_memory',
        content: session.latent_memory
      });
    }

    // 1. Lifetime & Consistency Stats
    const user = await User.findByPk(userId);
    if (user) {
      const totalVolume = await WorkoutLog.sum('total_volume', { where: { user_id: userId } }) || 0;
      const totalWorkouts = await WorkoutLog.count({ where: { user_id: userId, completed_at: { [Op.ne]: null } } });
      const streak = await achievementService.calculateStreak(user);

      historyContext.push({
        type: 'lifetime_stats',
        total_volume: parseFloat(totalVolume),
        total_workouts: totalWorkouts,
        current_streak: streak
      });
    }

    // 2. Active Workout Context (if any)
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
    }

    // 3. Recent History (Last 5 sessions for broad context)
    const recentLogs = await WorkoutLog.findAll({
      where: { user_id: userId, completed_at: { [Op.ne]: null } },
      order: [['completed_at', 'DESC']],
      limit: 5,
      attributes: ['name', 'total_volume', 'completed_at', 'duration_seconds']
    });

    recentLogs.forEach(log => {
      historyContext.push({
        type: 'recent_workout',
        date: log.completed_at.toISOString().split('T')[0],
        name: log.name,
        volume: parseFloat(log.total_volume),
        duration_mins: Math.round(log.duration_seconds / 60)
      });
    });

  } catch (err) {
    console.error('[AI Context] Failed to build latent context:', err);
  }

  return historyContext;
}
