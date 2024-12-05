import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: process.env.VITEST ? undefined : './src',
  test: {
    setupFiles: './test/setup/customMatchers.js',
    dangerouslyIgnoreUnhandledErrors: true,
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
  },
  plugins: [tsconfigPaths()],
  server: {
    fs: {
      strict: process.env.VITEST_VSCODE ? false : true
    }
  }
});
