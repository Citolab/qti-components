import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

import type { TestProjectConfiguration } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

/*
 * True when Vitest is launched from the Storybook UI rather than the CLI.
 *
 * In that mode `@storybook/addon-vitest` force-renames every project that uses its plugin to
 * `storybook:<configDir>`, and its runner then selects exactly that one project by name. Our
 * `stories` and `vrt` projects share a configDir, so both would be renamed identically and
 * Vitest would fail with "Project name … is not unique".
 *
 * Only one storybook-plugin project can exist in this mode, so drop `vrt`. Visual regression
 * is a CLI/CI concern and still runs via `npm run test:vrt`.
 */
const isVitestStorybook = process.env.VITEST_STORYBOOK === 'true';

export default defineConfig({
  base: process.env.VITEST ? undefined : './',
  plugins: [tsconfigPaths()],
  optimizeDeps: {
    // Prevent mid-run Vite re-optimization in browser/story tests, which can reload the
    // iframe and surface as Vitest "iframe reloaded during a test" unhandled errors.
    noDiscovery: true,
    include: [
      '@open-wc/lit-helpers',
      '@testing-library/dom',
      'shadow-dom-testing-library',
      'storybook/actions',
      'lit/directives/unsafe-html.js'
    ]
  },

  test: {
    setupFiles: process.env.VRT === '1' ? ['./.storybook/vitest.vrt.setup.ts'] : [],
    /*
     * The `vrt` project loads all story files to tag-filter (the Storybook plugin ignores
     * test.include), and an unrelated flaky story can throw "iframe reloaded during a test".
     * Only `vrt`-tagged stories actually run and assert, so don't let that unrelated unhandled
     * error abort the whole run.
     *
     * This has to live at the root: Vitest lists dangerouslyIgnoreUnhandledErrors in
     * NonProjectOptions, so the copy that used to sit on the `vrt` project was silently
     * ignored. Gated on VRT so normal runs still surface unhandled errors.
     */
    dangerouslyIgnoreUnhandledErrors: process.env.VRT === '1',
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
          // Full Storybook runs exercise hundreds of browser stories concurrently. PCI and
          // transformer-backed stories can legitimately exceed Vitest's 15s default under load.
          testTimeout: 40000,
          // No setupFiles: since Storybook 10.3 `@storybook/addon-vitest` provisions the
          // preview annotations (including addon-a11y) automatically. Declaring them by hand
          // makes it skip that provisioning.
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
      /* visual-regression project: only stories tagged `vrt`, screenshots each.
         Included ONLY under `VRT=1` (i.e. `npm run test:vrt`, which then selects it with
         `--project vrt`). Two @storybook/addon-vitest projects (`stories` + `vrt`) sharing a
         configDir cannot run in the same Vitest invocation: the plugin renames both to
         `storybook:<configDir>`, and in the browser one project then fails to fetch the other's
         per-file setup module ("Failed to fetch … setup-file-with-project-annotations.js"). So the
         default `just test` runs `stories` only; VRT runs on its own via test:vrt.
         Also omitted when launched from the Storybook UI — see `isVitestStorybook` above.
         Annotated so the conditional spread doesn't widen the projects array and strip
         contextual typing from the sibling project literals. */
      ...((isVitestStorybook || process.env.VRT !== '1'
        ? []
        : [
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
                // dangerouslyIgnoreUnhandledErrors is root-only; see the root `test` block.
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
                  instances: [
                    { browser: 'chromium', provider: playwright({ contextOptions: { deviceScaleFactor: 2 } }) }
                  ],
                  expect: {
                    toMatchScreenshot: {
                      comparatorName: 'pixelmatch',
                      comparatorOptions: {
                        // INERT for the kennisnet VRT suite. Those stories do NOT use
                        // toMatchScreenshot — they compare in a hand-rolled afterEach in
                        // .storybook/vitest.vrt.setup.ts, and the effective tolerance is
                        // ALLOWED_MISMATCHED_PIXEL_RATIO there. Changing the number here does
                        // nothing to them (verified: magenta hotspots stayed green). Left in place
                        // for any future test that genuinely calls toMatchScreenshot.
                        threshold: 0.2,
                        allowedMismatchedPixelRatio: 0.01
                      }
                    }
                  }
                }
              }
            }
          ]) as TestProjectConfiguration[]),
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
