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
      /* visual-regression project: only stories tagged `vrt`, screenshots each */
      {
        plugins: [
          storybookTest({
            tags: {
              include: ['vrt']
            },
            configDir: path.join(dirname, '.storybook'),
            storybookScript: 'pnpm run storybook -- --ci'
          }),
          tsconfigPaths()
        ],
        test: {
          name: 'vrt',
          setupFiles: ['./.storybook/vitest.vrt.setup.ts'],
          // The `vrt` project loads all story files to tag-filter (the Storybook plugin
          // ignores test.include), and an unrelated flaky story can throw "iframe reloaded
          // during a test". Only `vrt`-tagged stories actually run and assert, so don't let
          // that unrelated unhandled error abort the whole run.
          dangerouslyIgnoreUnhandledErrors: true,
          globals: true,
          // Large-dimension item images make the screenshot-stability loop slow;
          // give each capture room beyond the matcher's own timeout below.
          testTimeout: 40000,
          browser: {
            enabled: true,
            // deviceScaleFactor: 2 matches a retina dev canvas for layout/text metrics.
            // Playwright locator screenshots still report their own physical PNG size,
            // so the Storybook overlay fits the bitmap back onto the captured CSS box.
            provider: playwright(),
            headless: true,
            // Wide viewport so the capture container is >= the item's fixed 906px width.
            viewport: { width: 2560, height: 1440 },
            screenshotFailures: false,
            instances: [{ browser: 'chromium', provider: playwright({ contextOptions: { deviceScaleFactor: 2 } }) }],
            expect: {
              toMatchScreenshot: {
                comparatorName: 'pixelmatch',
                comparatorOptions: {
                  threshold: 0.2,
                  allowedMismatchedPixelRatio: 0.01
                }
              }
            }
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
