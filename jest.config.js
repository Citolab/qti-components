export default {
  // preset: "ts-jest",
  verbose: true,
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|ts)$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!@?lit)"],
  // modulePathIgnorePatterns: ['node_modules', '.jest-test-results.json'],
  globals: {
    "ts-jest": {
      tsconfig: {
        allowJs: true,
      },
    },
  },
}
