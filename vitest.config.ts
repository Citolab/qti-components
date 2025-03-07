import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.VITEST ? undefined : './src',
  test: {
    setupFiles: './test/setup/index.js',
    dangerouslyIgnoreUnhandledErrors: true,
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    globals: true,
    // PK: Debugging browser mode does not work as expected, stalls with those options
    // see https://vitest.dev/guide/debugging#browser-mode for more info
    // inspectBrk: true,
    // fileParallelism: false,
    coverage: {
      provider: 'v8' // or 'v8'
    },
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true, // Both modes work fine
      instances: [
        {
          browser: 'chromium',
          provide: {
            launch: {
              args: ['--remote-debugging-port=9222']
            }
          }
        }
      ]
    },
    onConsoleLog(log: string, type: 'stdout' | 'stderr'): boolean | void {
      return !log.includes('Lit is in dev mode');
    }
  }
});
