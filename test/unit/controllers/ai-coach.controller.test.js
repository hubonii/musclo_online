// Unit tests for AiCoachController — LLM-powered fitness coaching and chat sessions.
const { getSessions, getMessages, createSession, deleteSession, ask } = require('../../../controllers/aiCoachController');
const { ChatSession, ChatMessage, SetData, WorkoutLog } = require('../../../models');
const openRouter = require('../../../services/openRouterService');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('../../../models', () => ({
  ChatSession: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  ChatMessage: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
  SetData: {
    findAll: jest.fn(),
  },
  WorkoutLog: {
    findAll: jest.fn(),
  },
  Exercise: {}
}));

jest.mock('../../../services/openRouterService', () => ({
  askStream: jest.fn(),
}));

jest.mock('../../../config/database', () => ({
  fn: jest.fn(),
  col: jest.fn(),
}));



describe('AiCoachController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSessions', () => {
    test('returns sessions ordered by latest update', async () => {
      ChatSession.findAll.mockResolvedValue([{ id: 1, title: 'Chat' }]);

      const req = { user: { id: 1 } };
      const res = createRes();

      await getSessions(req, res);

      expect(ChatSession.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: 1 },
        order: [['updated_at', 'DESC']]
      }));
      expect(res.json).toHaveBeenCalledWith({ data: [{ id: 1, title: 'Chat' }] });
    });
  });

  describe('getMessages', () => {
    test('returns 404 if session not found', async () => {
      ChatSession.findOne.mockResolvedValue(null);

      const req = { user: { id: 1 }, params: { sessionId: 99 } };
      const res = createRes();

      await getMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Session not found' });
    });

    test('returns message history in ascending order', async () => {
      ChatSession.findOne.mockResolvedValue({ id: 99 });
      ChatMessage.findAll.mockResolvedValue([{ id: 1, content: 'Hi' }]);

      const req = { user: { id: 1 }, params: { sessionId: 99 } };
      const res = createRes();

      await getMessages(req, res);

      expect(ChatMessage.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { chat_session_id: 99 },
        order: [['created_at', 'ASC']]
      }));
      expect(res.json).toHaveBeenCalledWith({ data: [{ id: 1, content: 'Hi' }] });
    });
  });

  describe('createSession', () => {
    test('persists a minimal session row', async () => {
      ChatSession.create.mockResolvedValue({ id: 10, title: 'New Chat' });

      const req = { user: { id: 1 }, body: { model_mode: 'smart' } };
      const res = createRes();

      await createSession(req, res);

      expect(ChatSession.create).toHaveBeenCalledWith({
        user_id: 1,
        title: 'New Chat'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: expect.any(Object) });
    });
  });

  describe('deleteSession', () => {
    test('deletes only user-owned session', async () => {
      const mockSession = { id: 10, destroy: jest.fn().mockResolvedValue() };
      ChatSession.findOne.mockResolvedValue(mockSession);

      const req = { user: { id: 1 }, params: { sessionId: 10 } };
      const res = createRes();

      await deleteSession(req, res);

      expect(ChatSession.findOne).toHaveBeenCalledWith({ where: { id: 10, user_id: 1 } });
      expect(mockSession.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Session deleted' });
    });
  });

  describe('ask', () => {
    test('assembles prompt and streams response', async () => {
      ChatSession.create.mockResolvedValue({ id: 99 });
      ChatMessage.findAll.mockResolvedValue([]);
      WorkoutLog.findAll.mockResolvedValue([]); // Mock fallback latent context

      const req = {
        user: { id: 1 },
        body: { message: 'How to squat?', model_mode: 'fast' }
      };
      const res = createRes();

      await ask(req, res);

      expect(ChatSession.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'How to squat?'
      }));
      expect(ChatMessage.create).toHaveBeenCalledWith(expect.objectContaining({
        chat_session_id: 99,
        role: 'user',
        content: 'How to squat?'
      }));
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(openRouter.askStream).toHaveBeenCalledWith(
        res,
        'How to squat?',
        undefined, // workout_context
        expect.any(Array), // latentContext
        expect.any(Array), // historyMessages
        undefined, // image
        99 // session_id
      );
    });

    test('returns 500 on database error', async () => {
      ChatSession.create.mockRejectedValue(new Error('DB Error'));

      const req = { user: { id: 1 }, body: { message: 'Hi' } };
      const res = createRes();

      await ask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });
});
