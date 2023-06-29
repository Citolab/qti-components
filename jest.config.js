export default {
  // preset: "ts-jest",
  verbose: true,
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|ts)$": ["ts-jest", {
      tsconfig: {
        allowJs: true,
      },
    }]
  },
  transformIgnorePatterns: ["node_modules/(?!@?lit)"],
  // modulePathIgnorePatterns: ['node_modules', '.jest-test-results.json'],

}
