import { pathsToModuleNameMapper } from 'ts-jest';
import config from './tsconfig.json';
import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  // preset: "ts-jest",
  verbose: true,
  testEnvironment: 'jsdom',
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
