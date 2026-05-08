
/**
 * Service for communicating with the AI LLM via OpenRouter.
 */
const axios = require('axios');
const { ChatMessage } = require('../models');

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.AI_ENGINE_KEY;
    this.model = process.env.AI_ENGINE_MODEL || 'openai/gpt-oss-120b:free';
    this.baseUrl = process.env.AI_ENGINE_BASE_URL || 'https://openrouter.ai/api/v1';
  }

  /**
   * Constructs the system prompt with context and performance history.
   * @param {Object} context - Current workout context.
   * @param {Array} [historyContext] - Past performance data.
   * @param {boolean} [isDeepAudit] - Whether to include deep analysis instructions.
   * @returns {string} The formatted system prompt.
   */
  buildSystemPrompt(context, historyContext = [], isDeepAudit = false) {
    let base = "You are Musclo AI, an advanced general-purpose intelligent assistant. While you have specialized expertise in sport science and nutrition, you act as a versatile companion for the user. "
      + "Crucially, you have 'Eagle Eye' access to the user's entire fitness history and real-time activity to provide deeply personalized and intelligent responses. ";

    base += "\n\n**CORE OPERATING DIRECTIVES:**\n"
      + "- **General Intelligence (ChatGPT-style)**: Act like a general-purpose AI (like ChatGPT). You can discuss anything from training to life, philosophy, or general knowledge. Do not force every conversation into a 'workout session' or 'exercise list'.\n"
      + "- **Invisible Context**: Use the provided history and workout status as background knowledge to make your answers smart and personal, but do not recite this data or pivot to 'prescribing exercises' unless the user specifically asks for training advice.\n"
      + "- **Natural Dialogue**: Be a human-like partner. Discuss, analyze, and ask questions naturally. Avoid the 'robot coach' vibe that only speaks in sets and reps.\n"
      + "- **Human Persona**: If the user writes in Arabic, use natural, fluent Arabic (like a friend or a knowledgeable partner) rather than formal/rigid translations.\n"
      + "- **Program Generation**: If the user asks for a workout plan, program, or schedule, you MUST first explain it conversationally. Then, at the absolute end of your message, you MUST include a JSON block wrapped in `<workout_plan_json>` tags. "
      + "The JSON MUST follow this exact schema: { \"name\": \"Program Name\", \"description\": \"...\", \"routines\": [ { \"name\": \"Day 1: Legs\", \"day_of_week\": \"Monday\", \"exercises\": [ { \"name\": \"Leg Press\", \"sets\": 3, \"reps\": 10 } ] } ] }. "
      + "IMPORTANT: Exercise names inside the JSON must be in English for database matching, even if you speak Arabic in the chat.";

    if (isDeepAudit) {
      base += "\n\n**AUDIT MODE**: The user has requested a deep analysis of their performance. Analyze volume, intensity, and frequency trends across their history. ";
    }

    base += "\n\n**RESPONSE STANDARDS:**\n"
      + "- **Intelligence Over Gimmicks**: Focus on high-quality reasoning and direct answers.\n"
      + "- **Versatility**: If the user asks a non-fitness question, answer it normally while being aware of their fitness context (e.g., if they are tired from a workout).\n"
      + "- **Tone**: Conversational, intelligent, and natural.\n"
      + "- **Language**: ALWAYS match the user's language exactly.";

    if (context && context.is_active) {
      base += "\n\n--- CURRENT WORKOUT STATUS ---\n";
      base += `Routine: ${context.routine_name || 'Custom'}\n`;
      if (context.exercises) {
        context.exercises.forEach(ex => {
          base += `- ${ex.name}: ${ex.sets_completed}/${ex.total_sets} sets done (Current: ${ex.current_weight}kg)\n`;
        });
      }
    }

    if (historyContext.length > 0) {
      base += "\n\n--- PERFORMANCE MEMORY ---\n";
      historyContext.forEach(h => {
        if (h.type === 'lifetime_stats') {
          base += `LIFETIME: ${h.total_volume}kg total volume over ${h.total_workouts} sessions. Current streak: ${h.current_streak} days.\n`;
        } else if (h.type === 'active_exercise_history') {
          base += `EXERCISE (${h.name}): Lifetime Max ${h.max_weight}kg | Total Reps ${h.total_reps}\n`;
        } else if (h.type === 'recent_workout') {
          base += `HISTORY: ${h.name} on ${h.date} (${h.volume}kg, ${h.duration_mins} mins)\n`;
        }
      });
    }

    return base;
  }

  /**
   * Streams a chat completion response from OpenRouter.
   * @param {Object} res - Express response object for SSE.
   * @param {string} message - The user's message.
   * @param {Object} context - Current workout context.
   * @param {Array} historyContext - Performance memory data.
   * @param {Array} historyMessages - Previous chat messages.
   * @param {string} [sessionId] - ID of the chat session to persist response.
   * @returns {Promise<void>}
   */
  async askStream(res, message, context, historyContext, historyMessages, sessionId) {
    const isDeepAudit = /history|log|trend|progress|audit/i.test(message);
    const systemPrompt = this.buildSystemPrompt(context, historyContext, isDeepAudit);

    const messages = [{ role: 'system', content: systemPrompt }];
    historyMessages.forEach(msg => messages.push({ role: msg.role, content: msg.content }));
    messages.push({ role: 'user', content: message });

    try {
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/chat/completions`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://musclo.app',
          'X-Title': 'Musclo AI Coach',
        },
        data: {
          model: this.model,
          messages,
          temperature: 0.7,
          stream: true
        },
        responseType: 'stream'
      });

      let fullContent = '';
      let fullThought = '';

      response.data.on('data', chunk => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices[0].delta;
              const content = delta.content || '';
              const thought = delta.reasoning_content || '';

              fullContent += content;
              fullThought += thought;

              res.write(`data: ${JSON.stringify({ content, thought })}\n\n`);
            } catch (e) {
              // Ignore partial frames
            }
          }
        }
      });

      response.data.on('end', async () => {
        if (sessionId) {
          await ChatMessage.create({
            chat_session_id: sessionId,
            role: 'assistant',
            content: fullContent,
            thought: fullThought || null
          });
        }
        res.end();
      });

    } catch (err) {
      let errorMessage = 'AI service error. Please try again.';
      if (err.response) {
        const status = err.response.status;
        if (status === 429) {
          errorMessage = 'Rate limit reached — the model is busy. Please wait a moment and try again.';
        } else if (status === 503 || status === 502) {
          errorMessage = 'The AI model is temporarily unavailable.';
        } else if (status === 401) {
          errorMessage = 'API authentication failed. Check configuration.';
        } else {
          errorMessage = `AI service returned error ${status}.`;
        }
        console.error(`[OpenRouter] HTTP ${status}:`, err.response.data?.error || err.message);
      } else {
        console.error('[OpenRouter] Network error:', err.message);
      }
      res.write(`data: ${JSON.stringify({ content: `⚠️ ${errorMessage}` })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
}

/**
 * Service for interacting with OpenRouter AI models.
 */
module.exports = new OpenRouterService();
