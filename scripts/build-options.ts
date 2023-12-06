import { Options } from 'tsup';
import { InlineCSSPlugin } from './inline-css-plugin.js';

// import pkgJson from '../package.json' assert { type: 'json' };

// const peerdependencies: string[] = [];
// for (const property in pkgJson.peerdependencies) {
//   peerdependencies.push(property);
// }

const options = {
  clean: false,
  target: 'es2017',
  dts: true,
  format: ['esm'],
  entryPoints: [
    // NOTE: Entry points must be mapped in package.json > exports, otherwise users won't be able to import them!
    './src/lib/qti-components/index.ts',
    './src/lib/qti-transformers/index.ts'
  ],
  // external: peerdependencies, // ['@lit/react', '@lit/context', 'react', 'lit'],
  splitting: true,
  esbuildPlugins: [InlineCSSPlugin],
  outDir: 'dist'
} as Options;

export const watchOptions = {
  ...options,
  clean: true,
  sourcemap: 'inline',
  define: {
    'process.env.NODE_ENV': '"development"',
    DEBUG: 'true'
  }
} as Options;

export const buildOptions = {
  ...options,
  format: [...options.format!, 'cjs'],
  minify: true,
  bundle: true,
  pure: ['console.log'],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
} as Options;

export const debugOptions = {
  ...options,
  pure: [],
  bundle: true,
  define: {
    'process.env.NODE_ENV': '"production"',
    DEBUG: 'true'
  },
  outDir: 'dist/debug'
} as Options;

// Make a build purely for enjoying creating qti-items in a plain HTML file
export const completeOptions = {
  ...options,
  dts: false,
  external: [],
  noExternal: [/(.*)/],
  splitting: false,
  sourcemap: false,
  minify: true,
  bundle: true,
  entryPoints: ['./src/index.ts'],
  pure: ['console.log'],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
} as Options;
