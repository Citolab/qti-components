import { defineConfig, Options } from 'tsup';
import { globby } from 'globby';
import pkgJson from './package.json' assert { type: 'json' };
import { InlineCSSPlugin } from './scripts/inline-css-plugin';

const peerDependencies = Object.keys(pkgJson.peerDependencies || {});

/*
 * DO NOT USE CODE SPLITTING
 * https://esbuild.github.io/api/#splitting
 * The order in which webcomponents will load will be unpredictable
 * */

const npmOptions: Options = {
  outDir: 'dist',
  format: 'esm',
  entry: [
    './src/lib/index.ts',
    './src/lib/qti-components/index.ts',
    ...(await globby('./src/lib/qti-test/**/!(*.(style|test|stories)).ts')),
    ...(await globby('./src/lib/qti-item/**/!(*.(style|test|stories)).ts')),
    './src/lib/qti-transformers/index.ts',
    './src/lib/qti-loader/index.ts'
  ],
  bundle: true,
  external: peerDependencies,
  splitting: true /* DO NOT USE CODE SPLITTING, see above */,
  esbuildPlugins: [InlineCSSPlugin],
  sourcemap: true,
  dts: true
};

const cdnEs6Options: Options = {
  ...npmOptions,
  outDir: 'cdn',
  external: undefined,
  sourcemap: false,
  bundle: true,
  minify: true,
  dts: false
};

const cndEs5Options: Options = {
  ...npmOptions,
  outDir: 'cdn',
  external: undefined,
  format: 'iife',
  target: 'es5',
  sourcemap: false,
  bundle: true,
  minify: true,
  dts: false,
  globalName: 'QtiComponents'
};

export default defineConfig([npmOptions, cdnEs6Options, cndEs5Options]);
