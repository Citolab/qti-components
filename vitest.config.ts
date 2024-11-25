import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.VITEST ? undefined : './src',
  test: {
    setupFiles: './test/setup/customMatchers.js',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    globals: true,
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: true, // Both modes work fine
      providerOptions: {
        launch: {
          args: ['--remote-debugging-port=9222']
        }
      }
    }
  }
});
