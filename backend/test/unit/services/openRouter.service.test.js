const { EventEmitter } = require('events');

jest.mock('axios', () => jest.fn());

jest.mock('../../../models', () => ({
  ChatMessage: {
    create: jest.fn(),
  },
}));

const axios = require('axios');
const { ChatMessage } = require('../../../models');
const openRouterService = require('../../../services/openRouterService');

describe('OpenRouterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('buildSystemPrompt includes current workout and history context', () => {
    const prompt = openRouterService.buildSystemPrompt(
      {
        is_active: true,
        routine_name: 'Push Day',
        exercises: [
          { name: 'Bench Press', sets_completed: 2, total_sets: 4, current_weight: 80 },
        ],
      },
      [
        { type: 'recent_workout', name: 'Upper A', date: '2026-04-10', volume: 100, duration_mins: 30 },
        { type: 'active_exercise_history', name: 'Bench Press', max_weight: 100, total_reps: 300 },
      ]
    );

    expect(prompt).toContain('CURRENT WORKOUT STATUS');
    expect(prompt).toContain('Push Day');
    expect(prompt).toContain('Bench Press');
    expect(prompt).toContain('PERFORMANCE MEMORY');
    expect(prompt).toContain('HISTORY: Upper A');
  });

  test('askStream forwards streamed chunks and persists assistant message on end', async () => {
    const stream = new EventEmitter();
    axios.mockResolvedValue({ data: stream });
    ChatMessage.create.mockResolvedValue({ id: 10 });

    const res = { write: jest.fn(), end: jest.fn() };
    const historyMessages = [{ role: 'assistant', content: 'prior answer' }];

    await openRouterService.askStream(
      res,
      'please review this history log',
      { is_active: false },
      [],
      historyMessages,
      99
    );

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        responseType: 'stream',
      })
    );

    const request = axios.mock.calls[0][0];
    expect(request.data.temperature).toBe(0.5);
    expect(request.data.messages[2].content).toBe('please review this history log');

    stream.emit('data', Buffer.from('data: {"choices":[{"delta":{"content":"Hi","reasoning_content":"R"}}]}\n\n'));
    stream.emit('end');
    await new Promise((resolve) => setImmediate(resolve));

    expect(res.write).toHaveBeenCalledWith('data: {"content":"Hi","thought":"R"}\n\n');
    expect(ChatMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        chat_session_id: 99,
        role: 'assistant',
        content: 'Hi',
        thought: 'R',
      })
    );
    expect(res.end).toHaveBeenCalled();
  });

  test('askStream writes SSE error frame when upstream request fails', async () => {
    axios.mockRejectedValue(new Error('OpenRouter unavailable'));
    const res = { write: jest.fn(), end: jest.fn() };

    await openRouterService.askStream(res, 'hello', null, [], [], null);

    expect(res.write).toHaveBeenCalledWith(expect.stringContaining('⚠️ AI service error. Please try again.'));
    expect(res.end).toHaveBeenCalled();
  });
});
