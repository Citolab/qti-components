import { defineConfig, Options } from 'tsup';

import fs from 'fs';
import { join } from 'path';
import postcss from 'postcss';
import postcssConfig from './postcss.config.mjs';

export const InlineCSSPlugin = {
  name: 'inline-css',
  setup({ onResolve, onLoad }) {
    onResolve({ filter: /\.css\?inline$/ }, args => ({
      namespace: 'inline',
      path: join(args.resolveDir, args.path.replace(/\?inline$/, ''))
    }));

    onLoad({ filter: /.*/, namespace: 'inline' }, async ({ path }) => {
      try {
        const cssContent = fs.readFileSync(path, 'utf8');
        const result = await postcss(postcssConfig.plugins).process(cssContent, { from: path });
        return { contents: result.css, loader: 'text' };
      } catch (error) {
        return { errors: [{ text: error.message }] };
      }
    });
  }
};

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
