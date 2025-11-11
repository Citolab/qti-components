import { defineConfig } from 'tsup';

import pkgJson from './package.json' assert { type: 'json' };
import { InlineCSSPlugin } from '../../tools/build/inline-css-plugin';

import type { Options } from 'tsup';

const dependencies = Object.keys(pkgJson.dependencies || {});

export default defineConfig(async () => {
  const npmOptions: Options = {
    clean: false, // handled by our npm script
    outDir: 'dist',
    format: 'esm',
    entry: ['./src/**/*.ts'],
    noExternal: dependencies,
    splitting: true,
    esbuildPlugins: [InlineCSSPlugin],
    sourcemap: true,
    dts: true
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
