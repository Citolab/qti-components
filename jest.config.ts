/** @type {import('jest').Config} */

import type { JestConfigWithTsJest } from 'ts-jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import config from './tsconfig.json';

const jestConfig: JestConfigWithTsJest = {
  // preset: "ts-jest",
  verbose: true,
  testEnvironment: 'jsdom',
  globals: {
    DEBUG: false
  },
  transform: {
    '^.+\\.(js|ts)$': [
      'ts-jest',
      {
        tsconfig: {
          allowJs: true
        }
      }
    ]
  },
  transformIgnorePatterns: ['node_modules/(?!@?lit)'],
  roots: ['<rootDir>'],
  modulePaths: [config.compilerOptions.baseUrl], // <-- This will be set to 'baseUrl' value
  moduleNameMapper: pathsToModuleNameMapper(config.compilerOptions.paths /*, { prefix: '<rootDir>/' } */),
  modulePathIgnorePatterns: ['node_modules', '.jest-test-results.json']
};

export default jestConfig;
