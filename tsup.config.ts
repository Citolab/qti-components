import { defineConfig, Options } from 'tsup';

import fs from 'fs';
import { join } from 'path';
import postcss from 'postcss';
import postcssConfig from './postcss.config.mjs';

const inline_id = '?inline';

export const InlineCSSPlugin = {
  name: 'inline-css',
  setup({ onResolve, onLoad }) {
    // Resolve CSS files ending with ?inline
    onResolve({ filter: /\.css\?inline$/ }, args => ({
      namespace: 'inline',
      path: args.path,
      pluginData: { resolveDir: args.resolveDir }
    }));

    // Load the resolved CSS file and process it
    onLoad({ filter: /.*/, namespace: 'inline' }, async args => {
      try {
        const importPath = args.path.slice(0, -inline_id.length); // Remove the ?inline suffix
        let cssFullPath;

        if (importPath.startsWith('.')) {
          // Resolve relative paths
          cssFullPath = join(args.pluginData.resolveDir, importPath);
        } else {
          // Resolve Node module paths
          const segments = importPath.split('/');
          let packageName;

          // Check if it is a scoped package (starts with @)
          if (segments[0].startsWith('@')) {
            packageName = `${segments[0]}/${segments[1]}`; // e.g., @citolab/qti-components
          } else {
            packageName = segments[0]; // e.g., lodash
          }

          const modulePath = join(process.cwd(), 'node_modules', packageName);
          const packageJsonPath = join(modulePath, 'package.json');

          // Read the package.json of the specific package
          if (!fs.existsSync(packageJsonPath)) {
            throw new Error(`package.json not found for ${packageName} in ${modulePath}`);
          }
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const exportsMap = packageJson.exports || {};

          // Derive the import key (e.g., './item.css')
          const importKey = `.${importPath.slice(packageName.length)}`;
          const resolvedPath = exportsMap[importKey];

          if (resolvedPath) {
            cssFullPath = join(modulePath, resolvedPath);
          } else {
            throw new Error(`Unable to resolve ${importKey} in exports map of ${packageName}`);
          }
        }

        // Ensure the resolved path exists
        if (!fs.existsSync(cssFullPath)) {
          throw new Error(`CSS file not found: ${cssFullPath}`);
        }

        // Read and process the CSS content
        const cssContent = fs.readFileSync(cssFullPath, 'utf8');
        const processResult = await postcss(postcssConfig?.plugins || []).process(cssContent, {
          from: cssFullPath,
          to: undefined
        });

        return {
          contents: processResult.css, // Use processed CSS content
          loader: 'text' // Inline as text
        };
      } catch (err) {
        console.error(`Error in InlineCSSPlugin: ${err.message}`);
        throw err; // Re-throw the error for ESBuild to handle
      }
    });
  }
};

import pkgJson from './package.json' assert { type: 'json' };
import tsconfigJson from './tsconfig.json' assert { type: 'json' };

const peerdependencies = Object.keys(pkgJson.peerDependencies || {});

// minify: process.env.NODE_ENV === 'production',
// sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,

const bundleOptions: Options = {
  splitting: false,
  esbuildPlugins: [InlineCSSPlugin]
};

export default defineConfig([
  {
    // Development build, including types, non minified source and sourcemaps
    // "src/lib/qti-components","src/lib/qti-item","src/lib/qti-transformers","src/lib/qti-loader","src/lib/qti-test"]
    ...bundleOptions,
    dts: true,
    format: ['esm', 'cjs'],
    outDir: 'dist',
    entry: Object.values(tsconfigJson.compilerOptions.paths).map(paths => `${paths[0]}/index.ts`),
    minify: false,
    external: peerdependencies,
    sourcemap: true
  } as Options,

  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          // (src/index.ts -> dist/cdn/index.min) CDN ESM Minified
          ...bundleOptions,
          format: ['esm', 'cjs'],
          outDir: './',
          entry: { 'cdn/index.min': './src/index.ts' },
          noExternal: [/(.*)/],
          minify: true,
          sourcemap: false
        } as Options,
        {
          // (src/index.ts -> dist/cdn/index.global.js) CDN IFFE ES5 (jsdom)
          ...bundleOptions,
          format: ['iife'],
          outDir: './',
          entry: { 'cdn/index': './src/index.ts' },
          noExternal: [/(.*)/],
          minify: true,
          sourcemap: false,
          globalName: 'QtiComponents',
          target: 'es5'
        } as Options
      ]
    : [])
]);
