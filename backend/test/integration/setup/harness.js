const sequelize = require('../../../config/database');
const app = require('../../../index');
const openRouter = require('../../../services/openRouterService');

/**
 * Shared integration test harness for Musclo Backend.
 * Manages database synchronization and environment isolation.
 */

const harness = {
  /**
   * Initializes the test database and ensures environment guards are active.
   */
  async setup() {
    // Mock OpenRouter to avoid external API calls during integration tests
    jest.spyOn(openRouter, 'askStream').mockImplementation(async (res) => {
      res.write(`data: ${JSON.stringify({ content: 'Mocked AI response' })}\n\n`);
      res.end();
    });

    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Integration tests MUST run with NODE_ENV=test');
    }

    const modelsToInitialize = [
      'User',
      'Exercise',
      'Program',
      'Routine',
      'RoutineExercise',
      'WorkoutLog',
      'SetData',
      'Measurement',
      'ProgressPhoto',
      'UserSetting',
      'ChatSession',
      'ChatMessage',
      'Achievement',
      'UserAchievement'
    ];

    // For SQLite in-memory, we ALWAYS sync everything at the start of each suite
    // since each suite might get a fresh memory DB if not sharing the process effectively
    try {
      const isSqlite = sequelize.getDialect() === 'sqlite';
      
      if (isSqlite) {
        await sequelize.query('PRAGMA foreign_keys = OFF');
      } else {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      }
      
      // Full sync for clean state
      await sequelize.sync({ force: true });

      if (isSqlite) {
        await sequelize.query('PRAGMA foreign_keys = ON');
      } else {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      }
      
      console.log('[Harness] Test database initialized (Sync Force).');
    } catch (err) {
      console.error('[Harness] ERROR during database setup:', err);
      throw err;
    }
  },

  /**
   * Teardown called after each suite.
   */
  async teardown() {
    // In-memory DB is destroyed when connection closes or process ends
    console.log('[Harness] Teardown called.');
  },

  /**
   * Reference to the Express application instance for Supertest.
   */
  app
};

module.exports = harness;
