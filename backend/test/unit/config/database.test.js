// Unit tests for DatabaseConfig — environment-driven connection setup.
describe('DatabaseConfig', () => {
  beforeEach(() => {
    // Clears module cache before each test case.
    jest.resetModules();
    process.env.DB_DATABASE = 'musclo';
    process.env.DB_USERNAME = 'tester';
    process.env.DB_PASSWORD = 'secret';
    process.env.DB_HOST = '127.0.0.1';
    process.env.DB_PORT = '3306';
  });

  test('builds Sequelize instance with environment-driven mysql config', () => {
    // Mock constructors to verify how the config module wires dependencies.
    const sequelizeCtor = jest.fn(() => ({ _tag: 'sequelize-instance' }));
    const dotenvConfig = jest.fn();

    jest.doMock('sequelize', () => ({ Sequelize: sequelizeCtor }));
    jest.doMock('dotenv', () => ({ config: dotenvConfig }));

    let exported;
    jest.isolateModules(() => {
      // Loads the target module in isolated module scope with active mocks.
      exported = require('../../../config/database');
    });

    expect(dotenvConfig).toHaveBeenCalledTimes(1);
    expect(sequelizeCtor).toHaveBeenCalledWith(
      'musclo_test',
      'tester',
      'secret',
      expect.objectContaining({
        host: '127.0.0.1',
        port: '3306',
        dialect: 'mysql',
        logging: false,
        define: {
          timestamps: true,
          underscored: true,
        },
      })
    );
    expect(exported).toEqual({ _tag: 'sequelize-instance' });
  });
});


