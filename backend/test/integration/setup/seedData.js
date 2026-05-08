const { User, Exercise, Routine, Program } = require('../../../models');
const bcrypt = require('bcryptjs');

/**
 * Shared test fixtures for integration tests.
 */
const fixtures = {
  user: {
    name: 'Test User',
    email: `test-${Math.random().toString(36).substring(7)}@example.com`,
    username: `testuser-${Math.random().toString(36).substring(7)}`,
    password: 'password123',
    email_verified_at: new Date(),
    is_public: true
  },
  exercise: {
    name: 'Bench Press',
    muscle_group: 'Chest',
    equipment: 'Barbell',
    description: 'Classic chest exercise'
  },
  routine: {
    name: 'Upper Body A',
    day_of_week: '1'
  }
};

/**
 * Seeds the database with common fixtures and returns the created instances.
 * @param {Object} sequelize - Sequelize instance (unused but kept for signature).
 * @returns {Object} Created model instances.
 */
async function seedAll(sequelize) {
  try {
    const hashedPassword = await bcrypt.hash(fixtures.user.password, 10);
    
    const user = await User.create({
      ...fixtures.user,
      password: hashedPassword
    });

    const exercise = await Exercise.create(fixtures.exercise);

    const program = await Program.create({
      name: 'Default Program',
      user_id: user.id,
      is_active: true
    });

    const routine = await Routine.create({
      ...fixtures.routine,
      user_id: user.id,
      program_id: program.id
    });

    return { user, exercise, routine, program };
  } catch (err) {
    console.error('[SeedData] ERROR during seedAll:', err);
    throw err;
  }
}

module.exports = {
  fixtures,
  seedAll
};
