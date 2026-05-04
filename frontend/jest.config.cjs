// Tooling configuration for frontend development and testing.
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/test'],
  testPathIgnorePatterns: ['<rootDir>/test/e2e/'],
  collectCoverageFrom: [
    'src/api*.js',
    'src/hooks*.js',
    'src/pages*.jsx',
    'src/stores*.js',
    'src/components/auth*.jsx',
    'src/components/ui/ErrorBoundary.jsx',
    'src/router*.jsx',
  ],
  coverageThreshold: {
    global: {
      // Professional Grade: Enforcing robust logic and UI contract coverage
      branches: 40,
      functions: 65,
      lines: 65,
      statements: 65,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};


