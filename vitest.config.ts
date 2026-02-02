import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.VITEST ? undefined : './',
  plugins: [tsconfigPaths()],

  test: {
    typecheck: {
      tsconfig: './tsconfig.json'
    },
    browser: {
      headless: true
    },
    // Suppress console output during tests
    silent: true,
    coverage: {
      provider: 'v8',
      include: ['packages/**/src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.stories.ts',
        '**/*.config.*',
        '**/coverage/**'
      ]
    },
    onConsoleLog(log: string): boolean | void {
      return !log.includes('Lit is in dev mode');
    },
    // dangerouslyIgnoreUnhandledErrors: true,
    // PK: Debugging browser mode does not work as expected, stalls with those options
    // see https://vitest.dev/guide/debugging#browser-mode for more info
    // inspectBrk: true,
    // fileParallelism: false,
    projects: [
      {
        plugins: [
          storybookTest({
            tags: {
              // include: ['test'],
              exclude: ['skip-test', 'no-tests', 'xfail']
            },
            // The location of your Storybook config, main.js|ts
            configDir: path.join(dirname, '.storybook'),
            // This should match your package.json script to run Storybook
            // The --ci flag will skip prompts and not open a browser
            storybookScript: 'pnpm run storybook -- --ci'
          }),
          tsconfigPaths()
        ],
        test: {
          name: 'stories',
          setupFiles: ['./.storybook/vitest.setup.ts'],
          globals: true,
          browser: {
            enabled: true,
            // @ts-ignore
            provider: playwright(),
            headless: true,
            viewport: { width: 1280, height: 600 },
            screenshotFailures: false,
            instances: [
              {
                browser: 'chromium'
              }
            ]
          }
        }
      },
      /* this is for the normal spec files, which do not need storybook */
      {
        plugins: [tsconfigPaths()],
        test: {
          name: 'tests',
          setupFiles: ['./tools/testing/setup/index.js'],
          include: ['packages/**/*.spec.ts', 'packages/**/*.test.ts', 'apps/**/*.spec.ts', 'apps/**/*.test.ts'],
          globals: true,
          typecheck: {
            tsconfig: './tsconfig.json'
          },

          browser: {
            enabled: true,
            // @ts-ignore
            provider: playwright(),
            headless: true, // Both modes work fine
            screenshotFailures: false,
            instances: [{ browser: 'chromium', headless: true }]
          }
        }
      }
    ]
  }
});
