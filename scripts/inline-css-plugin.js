/* eslint-disable no-undef */
import fs from 'fs';
import { join } from 'path';

import postcss from 'postcss';

import postcssConfig from '../packages/qti-theme/postcss.config.mjs';
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
          // EVEN SIMPLER: All packages are linked in node_modules, just read directly from there
          cssFullPath = join(process.cwd(), 'node_modules', importPath);
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
