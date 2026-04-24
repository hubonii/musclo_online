// Table-driven checks for core model schema declarations.
const CASES = [
  {
    modulePath: '../../../models/User',
    modelName: 'User',
    tableName: 'users',
    requiredFields: ['id', 'name', 'email', 'password', 'is_public'],
  },
  {
    modulePath: '../../../models/SetData',
    modelName: 'SetData',
    tableName: 'set_data',
    requiredFields: ['workout_log_id', 'routine_id', 'exercise_id', 'set_number', 'set_type'],
  },
  {
    modulePath: '../../../models/UserSetting',
    modelName: 'UserSetting',
    tableName: 'user_settings',
    requiredFields: ['user_id', 'unit_system', 'theme', 'default_rest_timer_seconds'],
  },
  {
    modulePath: '../../../models/ChatSession',
    modelName: 'ChatSession',
    tableName: 'chat_sessions',
    requiredFields: ['user_id', 'title'],
  },
  {
    modulePath: '../../../models/ChatMessage',
    modelName: 'ChatMessage',
    tableName: 'chat_messages',
    requiredFields: ['chat_session_id', 'role', 'content'],
  },
];

// Unit tests for ModelSchemas — table definitions and core attributes.
describe('ModelSchemas', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test.each(CASES)('$modelName registers expected schema and options', (testCase) => {
    // `define` captures the exact model name/attributes/options passed by each file.
    const define = jest.fn(() => ({ modelName: testCase.modelName }));

    jest.doMock('../../../config/database', () => ({ define }));

    let exported;
    jest.isolateModules(() => {
      exported = require(testCase.modulePath);
    });

    expect(exported).toEqual({ modelName: testCase.modelName });
    expect(define).toHaveBeenCalledTimes(1);

    const [modelName, attributes, options] = define.mock.calls[0];
    expect(modelName).toBe(testCase.modelName);
    testCase.requiredFields.forEach((field) => {
      expect(attributes).toHaveProperty(field);
    });
    expect(options).toEqual(expect.objectContaining({
      tableName: testCase.tableName,
      underscored: true,
    }));
  });
});


