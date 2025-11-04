import { defineConfig } from 'tsup';

import { InlineCSSPlugin } from '../../scripts/inline-css-plugin';

import type { Options } from 'tsup';

export default defineConfig(async () => {
  const npmOptions: Options = {
    clean: true,
    outDir: 'dist',
    format: 'esm',
    entry: ['src/**/*.{ts,tsx}', '!src/**/*.stories.{ts,tsx}', '!src/**/*.spec.{ts,tsx}', '!src/**/*.test.{ts,tsx}'],
    bundle: false,
    noExternal: ['@qti-components/theme'],
    esbuildPlugins: [InlineCSSPlugin],
    sourcemap: true,
    dts: true,
    loader: {
      '.css': 'text'
    }
  };

  return [npmOptions];
});
