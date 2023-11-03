import chalk from 'chalk';
import { execSync } from 'child_process';
import tsup, { Options } from 'tsup';
import { InlineCSSPlugin } from './inline-css-plugin.js';

console.log('Building the project...');

const outdir = 'dist';

(async () => {
  const targetsResult = await tsup.build({
    target: 'es2017',
    dts: true,
    format: ['esm'],
    entryPoints: [
      // NOTE: Entry points must be mapped in package.json > exports, otherwise users won't be able to import them!
      './src/lib/qti-components/index.ts',
      './src/lib/qti-to-html5/index.ts'
    ],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    external: ['@lit/react', '@lit/context', 'react', 'lit'],
    splitting: true,
    esbuildPlugins: [InlineCSSPlugin] // https://github.com/evanw/esbuild/issues/3109#issuecomment-1539846087
  });
  execSync(`ts-node --esm --project tsconfig.node.json scripts/make-css.ts --outdir "${outdir}"`, { stdio: 'inherit' });
})();
