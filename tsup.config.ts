import { defineConfig, Options } from 'tsup';
import { InlineCSSPlugin } from './scripts/inline-css-plugin';

console.log('Building the project...');

import pkgJson from './package.json' assert { type: 'json' };

const peerdependencies = Object.keys(pkgJson.peerDependencies || {});

// minify: process.env.NODE_ENV === 'production',
// sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,

const buildOptions: Options = {
  clean: false,
  target: 'es2017',
  dts: true,
  format: ['esm', 'cjs'],
  sourcemap: 'inline',
  entry: [
    './src/lib/qti-components/index.ts',
    './src/lib/qti-transformers/index.ts',
    './src/lib/qti-item/index.ts',
    './src/lib/qti-loader/index.ts'
  ],
  external: peerdependencies,
  splitting: false,
  esbuildPlugins: [InlineCSSPlugin],
  outDir: 'dist'
};

// Complete build for standalone usage (e.g., in browser)
const esmBundleOptions: Options = {
  ...buildOptions,
  dts: false,
  external: [],
  noExternal: [/(.*)/],
  splitting: false,
  sourcemap: false,
  minify: true,
  format: ['esm'], // ESM for inline in browser
  shims: false,
  entry: ['./src/index.ts']
};

const iffeBundleOptions: Options = {
  ...esmBundleOptions,
  format: ['iife'], // IIFE for jsdom environment
  globalName: 'QtiComponents',
  target: 'es5'
};

export default defineConfig([
  buildOptions,
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          ...esmBundleOptions, // minified ESM bundled version
          minify: true,
          sourcemap: false,
          entry: { 'index.min': './src/index.ts' }
        },
        {
          ...esmBundleOptions, // dev ESM bundled version
          minify: false,
          sourcemap: 'inline' as const,
          entry: { index: './src/index.ts' }
        },
        iffeBundleOptions // IFFE version for jsdom
      ]
    : [])
]);
