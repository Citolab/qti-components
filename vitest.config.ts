import * as tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths.default()],
  base: process.env.VITEST ? undefined : './src',
  test: {
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    globals: true,
    browser: {
      enabled: true,
      provider: 'playwright',
      name: 'chromium'
    }
  }
});
