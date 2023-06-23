import chalk from 'chalk';
import { execSync } from 'child_process';
import tsup, { Options } from 'tsup';
import { InlineCSSPlugin } from './inline-css-plugin.js';

console.log('Building the project...');

const outdir = 'dist';
(async () => {
  try {
    console.log('Generating component metadata');
    execSync(`cem analyze --litelement --outdir "dist"`, { stdio: 'inherit' });

    execSync(`ts-node --esm --project tsconfig.node.json scripts/make-css.ts --outdir "${outdir}"`, {
      stdio: 'inherit'
    });

    // execSync(`tsup`, { stdio: "inherit" });
  } catch (err) {
    console.error(chalk.red(err));
    process.exit(1);
  }

  const buildResult = await tsup
    .build({
      target: 'es2017',
      dts: true,
      format: ['esm'],
      minify: true,
      bundle: true,
      entryPoints: [
        //
        // NOTE: Entry points must be mapped in package.json > exports, otherwise users won't be able to import them!
        //
        // context
        './src/lib/context/index.ts',
        // decorators
        './src/lib/decorators/index.ts',
        // qti-components
        './src/lib/qti-components/index.ts',
        // qti-item
        './src/lib/qti-item/index.ts',
        // qti-item-react
        './src/lib/qti-item-react/index.ts',
        // qti-transform
        './src/lib/qti-transform/index.ts'
      ],
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      external: ['@lit-labs/react', '@lit-labs/context', 'react', 'lit'],
      splitting: true,
      // https://github.com/evanw/esbuild/issues/3109#issuecomment-1539846087
      // https://esbuild.github.io/plugins/#using-plugins
      esbuildPlugins: [InlineCSSPlugin]
      // esbuildOptions(options, context) {
      //   options.css
      // },
    })
    .catch(err => {
      console.error(chalk.red(err));
      process.exit(1);
    })
    .then(result => console.log(result));

  console.log(chalk.green(`qti-components has been generated at ${outdir}\n`));
})();

// Make a build purely for enjoying creating qti-items in a plain HTML file
(async () => {
  const buildResult = await tsup
    .build({
      target: 'es2017',
      dts: true,
      format: ['esm'],
      entryPoints: ['./src/index.ts'],
      minify: true,
      bundle: true,
      // necessary so the peerdependencies in the package.json will still be included in thuis build
      // https://github.com/egoist/tsup/issues/619#issuecomment-1420423401
      noExternal: [/(.*)/],
      esbuildPlugins: [InlineCSSPlugin]
    })
    .catch(err => {
      console.error(chalk.red(err));
      process.exit(1);
    })
    .then(result => console.log(result));

  console.log(chalk.green(`The build has been generated at ${outdir}\n`));
})();
