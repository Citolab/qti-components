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
    format: ['esm', 'cjs'],
    clean: true,
    minify: true,
    bundle: true,
    entryPoints: [
      // NOTE: Entry points must be mapped in package.json > exports, otherwise users won't be able to import them!
      './src/lib/context/index.ts',
      './src/lib/decorators/index.ts',
      './src/lib/qti-components/index.ts',
      './src/lib/qti-item/index.ts',
      './src/lib/qti-item-react/index.ts',
      './src/lib/qti-transform/index.ts'
    ],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    external: ['@lit-labs/react', '@lit-labs/context', 'react', 'lit'],
    splitting: true,
    esbuildPlugins: [InlineCSSPlugin] // https://github.com/evanw/esbuild/issues/3109#issuecomment-1539846087
  });
  console.log(chalk.green(`qti-components has been generated at ${outdir}\n`));

  try {
    console.log('Generating component metadata');
    execSync(`cem analyze --litelement --outdir "dist"`, { stdio: 'inherit' });

    execSync(`ts-node --esm --project tsconfig.node.json scripts/make-css.ts --outdir "${outdir}"`, {
      stdio: 'inherit'
    });
  } catch (err) {
    console.error(chalk.red(err));
    process.exit(1);
  }

  // Make a build purely for enjoying creating qti-items in a plain HTML file

  const bundleResult = await tsup.build({
    target: 'es2017',
    dts: true,
    format: ['esm', 'cjs'],
    entryPoints: ['./src/index.ts'],
    minify: true,
    bundle: true,
    // necessary so the peerdependencies in the package.json will still be included in this build
    // https://github.com/egoist/tsup/issues/619#issuecomment-1420423401
    noExternal: [/(.*)/],
    esbuildPlugins: [InlineCSSPlugin]
  });
  console.log(chalk.green(`The build has been generated at ${outdir}\n`));
})();
