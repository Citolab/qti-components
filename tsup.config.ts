import { defineConfig } from 'tsup';
import { globby } from 'globby';

import pkgJson from './package.json' assert { type: 'json' };
import { InlineCSSPlugin } from './scripts/inline-css-plugin';

import type { Options } from 'tsup';

const peerDependencies = Object.keys(pkgJson.peerDependencies || {});

const npmOptions: Options = {
  outDir: 'dist',
  format: 'esm',
  entry: [
    './src/lib/index.ts',
    ...(await globby('./src/lib/exports/**/!(*.(style|test|stories)).ts')),
    './src/lib/qti-components/index.ts',
    './src/lib/qti-test/core/index.ts',
    ...(await globby('./src/lib/qti-test/components/**/!(*.(style|test|spec|stories)).ts')),
    './src/lib/qti-item/core/index.ts',
    ...(await globby('./src/lib/qti-item/components/**/!(*.(style|test|spec|stories)).ts')),
    './src/lib/qti-transformers/index.ts',
    './src/lib/qti-loader/index.ts'
  ],
  external: peerDependencies,
  splitting: true,
  clean: true,
  esbuildPlugins: [InlineCSSPlugin],
  sourcemap: true,
  dts: true,
  esbuildOptions(options) {
    options.chunkNames = 'chunks/[name]-[hash]';
  }
};

const cdnEs6Options: Options = {
  ...npmOptions,
  // entry: ['./src/lib/qti-components/index.ts'],
  splitting: true,
  clean: true,
  outDir: 'cdn',
  external: undefined,
  noExternal: [/(.*)/],
  sourcemap: false,
  minify: true,
  dts: false
};

const cndEs5Options: Options = {
  ...npmOptions,
  entry: ['./src/lib/qti-components/index.ts'],
  splitting: true,
  clean: true,
  outDir: 'cdn',
  external: undefined,
  noExternal: [/(.*)/],
  format: 'iife',
  target: 'es5',
  sourcemap: false,
  minify: true,
  dts: false,
  globalName: 'QtiComponents'
};

export default defineConfig([npmOptions, cdnEs6Options, cndEs5Options]);
