/**
 * Wraps a compiled stylesheet into an ES module that exports it as a string.
 *
 * Why this exists: `item-container` and `test-container` adopt the theme into their shadow root
 * (`new CSSStyleSheet()` + `replaceSync`), so they need the sheet as *text*, not as a linked
 * stylesheet. The obvious way to get that is `import css from './item.css?inline'` — but `?inline`
 * is bundler-only syntax, and `tsc` (which is how all 32 non-umbrella packages build) copies the
 * specifier through verbatim. `@qti-components/item@1.4.3` shipped exactly that:
 *
 *     import itemCss from '../../../../qti-theme/src/item.css?inline';
 *
 * Two things wrong with it. The `?inline` suffix no plain bundler resolves, and the path climbs
 * out of the package into a sibling directory that `files: ["dist"]` never publishes. Bundling
 * `@qti-components/item` straight from npm fails with "Could not resolve". It went unnoticed
 * because the umbrella inlines these packages at build time and its esbuild plugin resolves the
 * `?inline` right there, inside the workspace, where `dist/` sits at the same depth as `src/` and
 * the relative path happens to land on a real file.
 *
 * So the CSS-as-text has to be a real, published artifact. This script makes one, from the
 * already-compiled `dist/item.css` rather than by running PostCSS a second time — verified
 * byte-identical to what the inline plugin produced (279 603 chars), so the string the containers
 * adopt does not change.
 *
 * Usage: node tools/build/css-text-module.mjs <compiled.css> <out-basename>
 *   emits <out-basename>.js and <out-basename>.d.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const [source, outBase] = process.argv.slice(2);

if (!source || !outBase) {
  console.error('css-text-module: usage: css-text-module.mjs <compiled.css> <out-basename>');
  process.exit(1);
}

const css = readFileSync(source, 'utf8')
  // The `-m` postcss runs emit a sibling .map and reference it here. A string adopted into a
  // shadow root has no URL to resolve that against, so the comment would just be dead weight.
  .replace(/\n?\/\*# sourceMappingURL=[^*]*\*\/\s*$/, '');

// JSON.stringify is the escaping we want: it is exactly JS string-literal syntax, and it handles
// the newlines, quotes and non-ASCII (the sheet has some) that a hand-rolled escape would miss.
writeFileSync(`${outBase}.js`, `export default ${JSON.stringify(css)};\n`);
writeFileSync(`${outBase}.d.ts`, 'declare const cssText: string;\nexport default cssText;\n');

console.log(`css-text-module: ${source} -> ${outBase}.js (${css.length} chars)`);
