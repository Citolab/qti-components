//
// This script compiles scss to css
//
import chalk from 'chalk';
import fs, { mkdirSync } from 'fs';
import path from 'path';
import postcss from 'postcss';

import postcssConfig from '../postcss.config.cjs';

const outdir = 'dist';
const themesDir = path.join(outdir, './');

console.log('Generating css');

mkdirSync(themesDir, { recursive: true });

buildStyleSheet({ in: 'src/item-normalize.css', out: 'item-normalize.css' });
buildStyleSheet({ in: 'src/item-prose.css', out: 'item-prose.css' });
buildStyleSheet({ in: 'src/item.css', out: 'item.css' });

function buildStyleSheet({ in: sourceCss, out: outCss }) {
  try {
    const cssFile = path.join(themesDir, path.basename(outCss));

    fs.readFile(sourceCss, (err, css) => {
      postcss(postcssConfig.plugins)
        .process(css, { from: sourceCss, to: cssFile })
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
}
