import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.VITEST ? undefined : './src',
  test: {
    setupFiles: './test/setup/index.js',
    dangerouslyIgnoreUnhandledErrors: true,
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    globals: true,
    coverage: {
      include: ['src/lib/component-editor/**/*.ts'],
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
  },
  server: {
    fs: {
      allow: ['public/assets'] // Allows serving static files from 'public'
    },
    open: false,
    strictPort: true
  },
  define: {
    'process.env.PUBLIC_URL': JSON.stringify('/public')
  }
});
