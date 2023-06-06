//
// This script compiles scss to css
//
import chalk from 'chalk';
import fs from 'fs';
import { mkdirSync } from 'fs';
import path from 'path';
import postcss from 'postcss';

import postcssConfig from '../postcss.config.cjs';

// const files = ['styles.css'];

const outdir = 'dist';
const themesDir = path.join(outdir, './');

console.log('Generating tailwind css');

mkdirSync(themesDir, { recursive: true });

try {
  const cssFile = path.join(themesDir, path.basename('index.css'));

  fs.readFile('src/styles.css', (err, css) => {
    postcss(postcssConfig.plugins)
      .process(css, { from: 'src/styles.css', to: cssFile })
      .then(result => {
        fs.writeFile(cssFile, result.css, () => true);
        // if (result.map) {
        //   fs.writeFile('dest/app.css.map', result.map.toString(), () => true);
        // }
      });
  });
} catch (err) {
  console.error(chalk.red('Error generating css!'));
  console.error(err);
}
