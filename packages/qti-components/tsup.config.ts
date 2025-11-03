import { defineConfig } from 'tsup';
import { globby } from 'globby';

import pkgJson from './package.json' assert { type: 'json' };
import { InlineCSSPlugin } from '../../scripts/inline-css-plugin';

import type { Options } from 'tsup';

const dependencies = Object.keys(pkgJson.dependencies || {});

export default defineConfig(async () => {
  const npmOptions: Options = {
    clean: false, // handled by our npm script
    outDir: 'dist',
    format: 'esm',
    entry: [
      './src/index.ts',
      './src/test.ts',
      './src/item.ts',
      './src/elements.ts',
      './src/interactions.ts',
      './src/transformers.ts',
      './src/loader.ts',
      './src/shared.ts'
    ],
    noExternal: dependencies,
    splitting: true,
    esbuildPlugins: [InlineCSSPlugin],
    sourcemap: true,
    dts: true // Disable DTS for meta-package - consumers should import from individual packages
  };

  // CDN build (ESM, bundled deps)
  const cdnEsmOptions: Options = {
    clean: false,
    outDir: 'cdn',
    format: 'esm',
    entry: {
      index: './src/index.ts'
    },
    external: undefined,
    noExternal: [/(.*)/],
    splitting: false,
    esbuildPlugins: [InlineCSSPlugin],
    sourcemap: false,
    minify: true,
    dts: false
  };

  // CDN build (UMD/Global for JSDOM and browser environments)
  const cdnUmdOptions: Options = {
    clean: false,
    outDir: 'cdn',
    format: 'iife',
    entry: {
      index: './src/index.ts'
    },
    globalName: 'QtiComponents',
    target: 'es5',
    external: undefined,
    noExternal: [/(.*)/],
    splitting: false,
    esbuildPlugins: [InlineCSSPlugin],
    sourcemap: false,
    minify: true,
    dts: false
  };

  return [npmOptions, cdnEsmOptions, cdnUmdOptions];
});
