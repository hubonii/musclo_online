// Create a minimal Sequelize-like mock used in these tests.
const createMockModel = () => ({
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
  belongsToMany: jest.fn(),
  hasOne: jest.fn(),
});

// Unit tests for ModelAssociations — relational integrity and foreign keys.
describe('ModelAssociations', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('wires associations and exports all model references', () => {
    // Create lightweight model doubles that record association calls.
    const User = createMockModel();
    const Program = createMockModel();
    const Routine = createMockModel();
    const Exercise = createMockModel();
    const RoutineExercise = createMockModel();
    const WorkoutLog = createMockModel();
    const SetData = createMockModel();
    const Measurement = createMockModel();
    const ProgressPhoto = createMockModel();
    const Achievement = createMockModel();
    const UserAchievement = createMockModel();
    const UserSetting = createMockModel();
    const ChatSession = createMockModel();
    const ChatMessage = createMockModel();

    jest.doMock('../../../models/User', () => User);
    jest.doMock('../../../models/Program', () => Program);
    jest.doMock('../../../models/Routine', () => Routine);
    jest.doMock('../../../models/Exercise', () => Exercise);
    jest.doMock('../../../models/RoutineExercise', () => RoutineExercise);
    jest.doMock('../../../models/WorkoutLog', () => WorkoutLog);
    jest.doMock('../../../models/SetData', () => SetData);
    jest.doMock('../../../models/Measurement', () => Measurement);
    jest.doMock('../../../models/ProgressPhoto', () => ProgressPhoto);
    jest.doMock('../../../models/Achievement', () => Achievement);
    jest.doMock('../../../models/UserAchievement', () => UserAchievement);
    jest.doMock('../../../models/UserSetting', () => UserSetting);
    jest.doMock('../../../models/ChatSession', () => ChatSession);
    jest.doMock('../../../models/ChatMessage', () => ChatMessage);

    let models;
    jest.isolateModules(() => {
      // Loading models/index should execute association setup once.
      models = require('../../../models');
    });

    expect(models).toEqual(expect.objectContaining({
      User,
      Program,
      Routine,
      Exercise,
      RoutineExercise,
      WorkoutLog,
      SetData,
      Measurement,
      ProgressPhoto,
      Achievement,
      UserAchievement,
      UserSetting,
      ChatSession,
      ChatMessage,
    }));

    expect(User.hasMany).toHaveBeenCalledWith(Program, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    expect(User.hasOne).toHaveBeenCalledWith(UserSetting, { foreignKey: 'user_id', as: 'settings', onDelete: 'CASCADE' });
    expect(Routine.belongsToMany).toHaveBeenCalledWith(Exercise, {
      through: RoutineExercise,
      foreignKey: 'routine_id',
    });
    expect(WorkoutLog.hasMany).toHaveBeenCalledWith(SetData, { foreignKey: 'workout_log_id' });
    expect(ChatSession.hasMany).toHaveBeenCalledWith(ChatMessage, { foreignKey: 'chat_session_id' });
  });
});


