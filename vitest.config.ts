import * as tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths.default()],
  base: process.env.VITEST ? undefined : './src',
  test: {
    setupFiles: './test/setup/customMatchers.js',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    dangerouslyIgnoreUnhandledErrors: true,
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
