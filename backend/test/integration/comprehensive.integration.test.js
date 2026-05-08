const request = require('supertest');
const app = require('../../index');
const { User, Program, Routine, Exercise, WorkoutLog, SetData, UserSetting } = require('../../models');
const openRouter = require('../../services/openRouterService');
const bcrypt = require('bcryptjs');

/**
 * COMPREHENSIVE MOCKED SUITE
 * Using mocks to bypass database connectivity issues while maintaining controller coverage.
 */

// Helper to create a mock Sequelize model instance
const createMockInstance = (data) => {
  const instance = {
    ...data,
    toJSON: function() { 
      const plain = { ...this };
      delete plain.toJSON;
      delete plain.save;
      delete plain.update;
      delete plain.destroy;
      return plain;
    },
    save: jest.fn().mockImplementation(function() { return Promise.resolve(this); }),
    update: jest.fn().mockImplementation(function(newData) {
      Object.assign(this, newData);
      return Promise.resolve(this);
    }),
    destroy: jest.fn().mockResolvedValue({}),
  };
  return instance;
};

// Mock all models
jest.mock('../../models', () => {
  const mockModel = {
    findOne: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn(),
    findOrCreate: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    sum: jest.fn().mockResolvedValue(0),
    truncate: jest.fn(),
    sync: jest.fn(),
    bulkCreate: jest.fn().mockResolvedValue([]),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
  };
  return {
    User: { ...mockModel },
    Program: { ...mockModel },
    Routine: { ...mockModel },
    Exercise: { ...mockModel },
    WorkoutLog: { ...mockModel },
    SetData: { ...mockModel },
    UserSetting: { ...mockModel },
    Achievement: { ...mockModel },
    UserAchievement: { ...mockModel },
    Measurement: { ...mockModel },
    ChatSession: { ...mockModel },
    ChatMessage: { ...mockModel },
    ProgressPhoto: { ...mockModel },
    sequelize: {
      query: jest.fn().mockResolvedValue([[], {}]),
      sync: jest.fn().mockResolvedValue({}),
      authenticate: jest.fn().mockResolvedValue({}),
      transaction: jest.fn().mockResolvedValue({
        commit: jest.fn().mockResolvedValue({}),
        rollback: jest.fn().mockResolvedValue({}),
      }),
      fn: jest.fn((name) => name),
      col: jest.fn((col) => col),
      literal: jest.fn((lit) => lit),
    }
  };
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  genSalt: jest.fn().mockResolvedValue('salt'),
}));

// Mock OpenRouter
jest.mock('../../services/openRouterService', () => ({
  askStream: jest.fn((res) => {
    res.write(`data: ${JSON.stringify({ content: 'Mocked AI response' })}\n\n`);
    res.end();
  })
}));

describe('Musclo Mocked Comprehensive Suite', () => {
  const mockUser = createMockInstance({ 
    id: 1, 
    email: 'test@example.com', 
    username: 'tester',
    password: 'hashed_password',
    email_verified_at: new Date()
  });
  let cookie;

  beforeAll(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    
    User.findOne.mockResolvedValue(mockUser);
    User.create.mockResolvedValue(mockUser);
    User.findByPk.mockResolvedValue(mockUser);
    
    const loginRes = await request(app)
      .post('/api/login')
      .send({ identifier: 'test@example.com', password: 'password123' });
    
    cookie = loginRes.header['set-cookie'];
  });

  // Re-apply mocks before each test in case they were cleared or changed
  beforeEach(() => {
    User.findByPk.mockResolvedValue(mockUser);
    User.findOne.mockResolvedValue(mockUser);
  });

  // --- AUTH TESTS ---
  describe('Auth', () => {
    test('GET /api/user - retrieves current profile', async () => {
      const res = await request(app).get('/api/user').set('Cookie', cookie);
      expect(res.status).toBe(200);
    });
  });

  // --- PROGRAMS TESTS ---
  describe('Programs', () => {
    test('POST /api/programs - creates a program', async () => {
      Program.create.mockResolvedValue(createMockInstance({ id: 1, name: 'Mock Program' }));
      const res = await request(app)
        .post('/api/programs')
        .set('Cookie', cookie)
        .send({ name: 'Mock Program' });
      expect(res.status).toBe(201);
    });

    test('GET /api/programs - lists programs', async () => {
      const mockProgram = createMockInstance({ 
        id: 1, 
        name: 'Mock Program',
        Routines: [
          createMockInstance({ id: 10, name: 'Mock Routine', Exercises: [] })
        ]
      });
      Program.findAll.mockResolvedValue([mockProgram]);
      const res = await request(app).get('/api/programs').set('Cookie', cookie);
      expect(res.status).toBe(200);
    });
  });

  // --- WORKOUTS TESTS ---
  describe('Workouts', () => {
    test('POST /api/workouts - stores a workout', async () => {
      const log = createMockInstance({ id: 100, routine_id: 1 });
      WorkoutLog.create.mockResolvedValue(log);
      WorkoutLog.findByPk.mockResolvedValue(createMockInstance({ 
        id: 100, 
        SetData: [createMockInstance({ id: 1, weight_kg: 10, reps: 10, Exercise: { muscle_group: 'chest' } })] 
      }));
      
      const res = await request(app)
        .post('/api/workouts')
        .set('Cookie', cookie)
        .send({
          routine_id: 1,
          sets: [{ exercise_id: 1, set_number: 1, set_type: 'working', weight_kg: 10, reps: 10 }]
        });
      expect(res.status).toBe(201);
    });
  });

  // --- ANALYTICS TESTS ---
  describe('Analytics', () => {
    test('GET /api/analytics/stats - returns dashboard stats', async () => {
      const res = await request(app).get('/api/analytics/stats').set('Cookie', cookie);
      expect(res.status).toBe(200);
    });
  });

  // --- AI COACH TESTS ---
  describe('AI Coach', () => {
    test('POST /api/chat - streams AI response', async () => {
      WorkoutLog.findAll.mockResolvedValue([
        createMockInstance({ name: 'Last Workout', total_volume: 1000, completed_at: new Date(), duration_seconds: 3600 })
      ]);
      
      const res = await request(app)
        .post('/api/chat')
        .set('Cookie', cookie)
        .send({ message: 'Hello' });
      expect(res.status).toBe(200);
    });
  });
});
