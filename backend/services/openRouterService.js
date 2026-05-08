
/**
 * Service for communicating with the AI LLM via OpenRouter.
 */
const axios = require('axios');
const { ChatMessage } = require('../models');

const SEARCH_KEYWORDS = /\b(search|research|find|latest|today|yesterday|current|news)\b/i;

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
      + "- **General Intelligence (ChatGPT-style)**: Act like a general-purpose AI. You can discuss anything, but maintain your identity as an expert fitness companion.\n"
      + "- **Absolute Truthfulness**: Never hallucinate facts, studies, or sources. If you are unsure of a specific detail or link, state clearly that you don't have that specific data. **NEVER provide broken or fake URLs.**\n"
      + "- **Invisible Context**: Use workout history as background intelligence. Do not recite it unless asked.\n"
      + "- **Natural Dialogue**: Be human-like, conversational, and avoiding 'robotic' structures.\n"
      + "- **Human Persona**: In Arabic, use natural, modern dialects (like a knowledgeable friend).\n"
      + "- **Program Generation**: If a program is requested, explain it first. Then, at the absolute end, provide the JSON block wrapped ONLY in `<workout_plan_json>` tags. **NO descriptive headers, NO markdown code blocks (```json), NO extra text around the tags.** The JSON must be invisible to the user but parsable by the system.\n"
      + "The JSON MUST follow this exact schema: { \"name\": \"Program Name\", \"description\": \"...\", \"routines\": [ { \"name\": \"Day 1\", \"day_of_week\": \"Monday\", \"exercises\": [ { \"name\": \"Bench Press\", \"sets\": 3, \"reps\": 10, \"type\": \"normal\", \"metric\": \"reps\", \"equipment\": \"weights\", \"rest_time\": 60 } ] } ] }.";

    if (isDeepAudit) {
      base += "\n\n**AUDIT MODE**: The user has requested a deep analysis. Use data to find trends, gaps, and volume plateaus.";
    }

    base += "\n\n**RESPONSE STANDARDS (NON-NEGOTIABLE):**\n"
      + "- **Extreme Organization**: Every response MUST be perfectly structured. Use `### Heading` for sections, `**Bold**` for key terms, and bulleted lists for steps. Avoid blocks of plain text.\n"
      + "- **Table Integrity**: Tables MUST be perfectly aligned and valid Markdown. No broken rows.\n"
      + "- **Uncompromising Quality**: Provide deep, specific, and actionable advice. Don't be generic.\n"
      + "- **Verified Sources**: If providing a source, ensure it is real. If search is enabled, provide clickable markdown links [Title](URL). If search is NOT enabled or you are unsure, do not provide a link.\n"
      + "- **Tone**: Intelligent, authoritative, yet natural and supportive.\n"
      + "- **Language**: ALWAYS match the language used by the user in their prompt with total fluency.";

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
        } else if (h.type === 'latent_memory' && h.content) {
          base += `\n--- LATENT MEMORY (Long-term Context) ---\n${h.content}\n`;
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
    const needsSearch = SEARCH_KEYWORDS.test(message);

    let activeModel = this.model;
    let systemPrompt = this.buildSystemPrompt(context, historyContext, isDeepAudit);

    if (needsSearch) {
      systemPrompt += "\n\n**WEB SEARCH ENABLED**: The user is asking for real-time or verified information. Access the latest data and provide specific, clickable SOURCES. "
        + "Cite your sources using markdown links like [Source Name](URL) directly in the text and list them in a '### Sources' section at the bottom. "
        + "Never hallucinate facts. If you are unsure, state it clearly. Always prioritize accuracy.";
    }

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
          model: activeModel,
          messages,
          temperature: 0.5,
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
