const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: '<rootDir>/jest-environment.js',

  // Keep path alias
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Optional safety: stub styles/assets if they sneak into tests
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/test/__mocks__/fileMock.js',
  },

  // Faster coverage + cleaner reports
  coverageProvider: 'v8',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
    '!src/**/*.stories.@(js|jsx|ts|tsx)',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/test-utils/**',
    '!src/**/generated/**',
  ],
  coverageReporters: ['text', 'html', 'json-summary'],
  coverageThreshold: {
    global: { statements: 80, branches: 75, functions: 80, lines: 80 },
  },

  // Keep Jest focused
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/.storybook/',
  ],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/?(*.)+(test).(ts|tsx|js)',
  ],
  // QoL
  clearMocks: true,

  moduleDirectories: ['node_modules', '<rootDir>/src'],
};

module.exports = createJestConfig(customJestConfig);
