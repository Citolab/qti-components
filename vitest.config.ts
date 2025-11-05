/* eslint-disable import/no-nodejs-modules */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// import viteConfig from './vite.config';

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
      provider: 'v8' // or 'v8'
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
              exclude: ['skip-test', 'no-tests']
            },
            // The location of your Storybook config, main.js|ts
            configDir: path.join(dirname, '.storybook'),
            // This should match your package.json script to run Storybook
            // The --ci flag will skip prompts and not open a browser
            storybookScript: 'npm run storybook -- --ci'
          }),
          tsconfigPaths()
        ],
        test: {
          name: 'stories',
          setupFiles: ['./.storybook/vitest.setup.ts'],
          globals: true,
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            viewport: { width: 1280, height: 600 },
            screenshotFailures: false,
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
          }
        }
      },
      /* this is for the normal spec files, which do not need storybook */
      {
        plugins: [tsconfigPaths()],
        test: {
          name: 'tests',
          setupFiles: ['./test/setup/index.js'],
          include: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'packages/**/*.spec.ts', 'packages/**/*.test.ts'],
          globals: true,
          typecheck: {
            tsconfig: './tsconfig.json'
          },

          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true, // Both modes work fine
            screenshotFailures: false,
            instances: [{ browser: 'chromium', headless: true }]
          }
        }
      }
    ]
  }
});
