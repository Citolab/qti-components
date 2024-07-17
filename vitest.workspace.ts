import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // This will keep running your existing tests.
  // If you don't need to run those in Node.js anymore,
  // You can safely remove it from the workspace file
  // Or move the browser test configuration to the config file.
  'vitest.config.ts',
  {
    extends: 'vitest.config.ts',
    test: {
      browser: {
        enabled: true,
        name: 'webkit',
        provider: 'playwright',
        // https://playwright.dev
        providerOptions: {},
      },
    },
  },
])
