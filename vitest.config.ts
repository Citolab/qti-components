import { defineConfig } from 'vitest/config';

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
  /* FIXME: This is a workaround for the issue with Vite 2.6.0 */
  /* See: https://github.com/vitest-dev/vscode/discussions/337 */
  server: {
    fs: {
      strict: process.env.VITEST_VSCODE ? false : true
    }
  }
});
