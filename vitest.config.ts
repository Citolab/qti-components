import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, mergeConfig } from 'vitest/config';
import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    base: process.env.VITEST ? undefined : './src',
    plugins: [
      storybookTest({
        // The location of your Storybook config, main.js|ts
        configDir: path.join(dirname, '.storybook'),
        // This should match your package.json script to run Storybook
        // The --ci flag will skip prompts and not open a browser
        storybookScript: 'npm run storybook --ci'
      })
    ],
    test: {
      setupFiles: ['./.storybook/vitest.setup.ts', './test/setup/index.js'],
      // dangerouslyIgnoreUnhandledErrors: true,
      include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
      globals: true,
      // PK: Debugging browser mode does not work as expected, stalls with those options
      // see https://vitest.dev/guide/debugging#browser-mode for more info
      inspectBrk: true,
      fileParallelism: false,
      coverage: {
        provider: 'v8' // or 'v8'
      },
      browser: {
        enabled: true,
        provider: 'playwright',
        headless: true, // Both modes work fine
        instances: [
          {
            browser: 'chromium'
            // provide: {
            //   launch: {
            //     args: ['--remote-debugging-port=9222']
            //   }
            // }
          }
        ]
      },
      onConsoleLog(log: string, type: 'stdout' | 'stderr'): boolean | void {
        return !log.includes('Lit is in dev mode');
      }
    }
  })
);
