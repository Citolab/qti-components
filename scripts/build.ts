import chalk from 'chalk';
import { execSync } from 'child_process';
import tsup, { Options } from 'tsup';
import { InlineCSSPlugin } from './inline-css-plugin.js';

import pkgJson from '../package.json' assert { type: 'json' };

const peerdependencies: string[] = [];
for (const property in pkgJson.peerdependencies) {
  peerdependencies.push(property);
}

const command = process.argv[2];

console.log('Building the project...');

const outdir = 'dist';

const watchOptions = {
  target: 'es2017',
  dts: true,
  format: ['esm'],

  entryPoints: [
    //
    // NOTE: Entry points must be mapped in package.json > exports, otherwise users won't be able to import them!
    //
    './src/lib/qti-components/index.ts',
    './src/lib/qti-transformers/index.ts'
  ],
  define: {
    'process.env.NODE_ENV': command === 'watch' ? '"development"' : "'production'"
  },
  external: peerdependencies, // ['@lit/react', '@lit/context', 'react', 'lit'],
  splitting: true,
  esbuildPlugins: [InlineCSSPlugin]
} as Options;

const buildOptions = {
  ...watchOptions,
  clean: true,
  minify: true,
  bundle: true,
  format: [...watchOptions.format!, 'esm']
} as Options;

const options = command === 'watch' ? watchOptions : buildOptions;

(async () => {
  await tsup
    .build(options)
    .catch(err => {
      console.error(chalk.red(err));
      process.exit(1);
    })
    .then(result => console.log(result));

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

  if (command === 'watch') return;

  // Make a build purely for enjoying creating qti-items in a plain HTML file
  const bundleResult = tsup.build({
    ...buildOptions,
    external: [],
    noExternal: [/(.*)/]
  });
  console.log(chalk.green(`The build has been generated at ${outdir}\n`));
})();
