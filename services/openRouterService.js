// OpenRouter API client wrapper used by AI coach endpoints.
const axios = require('axios');
const { ChatMessage } = require('../models');

class OpenRouterService {
  constructor() {
    // Reads standardized AI engine configuration from environment variables.
    this.apiKey = process.env.AI_ENGINE_KEY;
    this.model = process.env.AI_ENGINE_MODEL || 'openai/gpt-oss-120b:free';
    this.baseUrl = process.env.AI_ENGINE_BASE_URL || 'https://openrouter.ai/api/v1';
  }

  buildSystemPrompt(context, historyContext = [], isDeepAudit = false) {
    // Build one rich system message that mixes behavior rules + workout context.
    let base = 'You are Musclo AI Coach, a world-class Sport Scientist and Master Strength Coach. Your expertise is grounded in the most reliable principles of exercise physiology and nutrition. '
      + "You have persistent memory of the user's past workout logs to provide contextual advice. ";

    if (isDeepAudit) {
      base += "The user has requested a deep audit of their performance. Analyze volume, intensity, and frequency trends across their history. ";
    } else {
      base += "Use the provided 'MEMORY DATA' as background context to personalize your response. ";
    }

    base += "\n\n**RESPONSE STANDARDS:**\n"
      + "- **Scientific Accuracy**: Use evidence-based training principles.\n"
      + "- **Structured Output**: Use H3 headers, bold metrics, and Markdown tables for data.\n"
      + "- **Aesthetics**: Ensure the response is logically structured and visually premium.\n"
      + "- **Tone**: Professional, encouraging, and authoritative.\n"
      + "- **Language**: ALWAYS respond in the same language the user writes in. If the user writes in Arabic, respond fully in Arabic (العربية). If they write in English, respond in English. Match their language exactly.";

    // Inject active workout details when the request comes from the live workout screen.
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
        if (h.type === 'active_exercise_history') {
          base += `${h.name}: Lifetime Max ${h.max_weight}kg | Total Reps ${h.total_reps}\n`;
        } else if (h.type === 'recent_workout') {
          base += `Recent: ${h.name} (${h.date})\n`;
        }
      });
    }

    return base;
  }

  async askStream(res, message, context, historyContext, historyMessages, image, sessionId, modelOverride) {
    // Auto-detect if deep analysis is required based on keyword triggers.
    const isDeepAudit = /history|log|trend|progress|audit/i.test(message);
    const systemPrompt = this.buildSystemPrompt(context, historyContext, isDeepAudit);

    const messages = [{ role: 'system', content: systemPrompt }];
    historyMessages.forEach(msg => messages.push({ role: msg.role, content: msg.content }));

    let userContent = message;
    if (image) {
      userContent = [
        { type: 'text', text: message },
        { type: 'image_url', image_url: { url: image } }
      ];
    }
    messages.push({ role: 'user', content: userContent });

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
          model: modelOverride || this.model,
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
              // Some providers (like OpenRouter for reasoning models) might still send thoughts
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
          errorMessage = 'Rate limit reached — the model is busy. Please wait a moment and try again, or switch to a different model.';
        } else if (status === 503 || status === 502) {
          errorMessage = 'The AI model is temporarily unavailable. Try switching to a different model.';
        } else if (status === 401) {
          errorMessage = 'API authentication failed. Check configuration.';
        } else {
          errorMessage = `AI service returned error ${status}. Try a different model.`;
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

module.exports = new OpenRouterService();

