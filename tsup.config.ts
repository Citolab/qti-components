import { defineConfig } from 'tsup';
import { globby } from 'globby';

import pkgJson from './package.json' assert { type: 'json' };
import { InlineCSSPlugin } from './scripts/inline-css-plugin';

import type { Options } from 'tsup';

const peerDependencies = Object.keys(pkgJson.peerDependencies || {});

export default defineConfig(async () => {
  const npmOptions: Options = {
    clean: false, // handled by our npm script
    outDir: 'dist',
    format: 'esm',
    entry: [
      './src/lib/index.ts',
      './src/lib/qti-test/index.ts',
      './src/lib/qti-item/index.ts',
      './src/lib/qti-components/index.ts',
      './src/lib/qti-transformers/index.ts',
      './src/lib/qti-loader/index.ts',
      ...(await globby('./src/lib/exports/**/!(*.(style|test|stories)).ts'))
    ],
    external: peerDependencies,
    splitting: true,
    esbuildPlugins: [InlineCSSPlugin],
    sourcemap: true,
    dts: true,
    esbuildOptions(options) {
      options.chunkNames = 'chunks/[name]-[hash]';
    }
  };

  // CDN build (ESM, bundled deps)
  const cdnEsmOptions: Options = {
    clean: false,
    outDir: 'cdn',
    format: 'esm',
    entry: {
      index: './src/lib/index.ts'
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
      index: './src/lib/index.ts'
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
