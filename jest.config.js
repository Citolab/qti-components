import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig';
export default {
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
  modulePaths: [compilerOptions.baseUrl],
  transformIgnorePatterns: ['node_modules/(?!@?lit)'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths /*, { prefix: '<rootDir>/' } */)
  // modulePathIgnorePatterns: ['node_modules', '.jest-test-results.json']
};
