import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  clearMocks: true,
  // Jest runs different test FILES in parallel workers by default. These tests
  // share one real Postgres database (procurex_test_db) and truncate tables
  // between tests, so two files racing against it at the same time causes real
  // unique-constraint collisions and truncation-vs-insert races. Forcing a
  // single worker makes every test run strictly one-at-a-time against the DB.
  maxWorkers: 1,
  globalSetup: '<rootDir>/src/__tests__/setup/globalSetup.ts',
  setupFiles: ['<rootDir>/src/__tests__/setup/env.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/db.setup.ts'],
};

export default config;