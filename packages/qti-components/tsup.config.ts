import { defineConfig } from 'tsup';

import pkgJson from './package.json' assert { type: 'json' };
import { InlineCSSPlugin } from '../../tools/build/inline-css-plugin';

import type { Options } from 'tsup';

const dependencies = Object.keys(pkgJson.dependencies || {});

/**
 * Lit must be a singleton, so the npm build imports it rather than inlining it.
 *
 * `noExternal: dependencies` used to bundle lit into dist/ while package.json ALSO
 * declared it a dependency — so a consumer got the bundled copy *and* installed one, and
 * any consumer with its own Lit components ended up running two. Two copies mean two
 * `ReactiveElement` base classes (so `instanceof` fails across them), two `@lit/context`
 * registries, and lit's own "Multiple versions of Lit loaded" warning, which fires on the
 * COUNT of registered instances — matching versions does not help.
 *
 * Subpaths matter: `lit/decorators.js` and `@lit/context` have to stay external too, so
 * this is matched by pattern rather than by bare package name.
 *
 * The two CDN builds below are unaffected — they set their own `noExternal: [/(.*)/]`
 * because a CDN bundle genuinely has to be self-contained.
 */
const litExternal = [/^lit($|\/)/, /^lit-html($|\/)/, /^lit-element($|\/)/, /^@lit\//];
const bundledDependencies = dependencies.filter(name => !/^(lit|lit-html|lit-element|@lit)($|[/-])/.test(name));

export default defineConfig(async () => {
  const npmOptions: Options = {
    clean: false, // handled by our npm script
    outDir: 'dist',
    format: 'esm',
    entry: ['./src/**/*.ts'],
    external: litExternal,
    noExternal: bundledDependencies,
    splitting: true,
    esbuildPlugins: [InlineCSSPlugin],
    sourcemap: true,
    dts: { resolve: true }
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
