import chalk from 'chalk';
import { execSync } from 'child_process';
import { existsSync, promises as fsPromises } from 'fs';
import tsup, { Options } from 'tsup';
import { buildOptions, completeOptions, debugOptions, watchOptions } from './build-options.js';

const command = process.argv[2];
const buildType = command === 'watch' ? 'watch' : 'build';

console.log('Building the project...');

const outdir = 'dist';

(async () => {
  try {
    // make sure the folder is clean
    if (existsSync(outdir)) {
      await fsPromises.rm(outdir, { recursive: true });
    }
    await fsPromises.mkdir(outdir);
  } catch (err) {
    console.error(chalk.red(err));
    process.exit(1);
  }

  switch (buildType) {
    case 'watch':
      {
        await buildTS(watchOptions);
        buildCSS();
      }
      break;
    case 'build':
      {
        await buildTS(buildOptions);
        await buildTS(debugOptions);
        await buildTS(completeOptions);
        buildCEM();
        buildCSS();
      }
      break;
    default:
      break;
  }
})();

function buildCSS() {
  try {
    execSync(`ts-node --esm --project tsconfig.node.json scripts/make-css.ts --outdir "${outdir}"`, {
      stdio: 'inherit'
    });
  } catch (err) {
    console.error(chalk.red(err));
    process.exit(1);
  }
}

function buildCEM() {
  try {
    console.log('Generating component metadata');
    execSync(`cem analyze --litelement --outdir "dist"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(chalk.red(err));
    process.exit(1);
  }
}

async function buildTS(options: Options) {
  return tsup
    .build(options)
    .catch(err => {
      console.error(chalk.red(err));
      process.exit(1);
    })
    .then(result => {
      console.log(result);
      console.log(chalk.green(`qti-components has been generated at ${outdir}\n`));
    });
}
