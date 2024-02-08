import * as tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths.default()],
  base: process.env.VITEST ? undefined : './src',
  test: {
    include: ['src/**/*.spec.ts'],
    globals: true,
    environmentMatchGlobs: [
      ['src/**/', 'jsdom'] // all tests in tests/dom will run in jsdom
    ]
  }
});
