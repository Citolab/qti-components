/**
 * The theme sheet as a string, for adopting into a shadow root.
 *
 * This file is the DEV/source half of `@qti-components/theme/item-css`. It is deliberately never
 * compiled by tsc — `qti-theme` has no tsc build, and adding one would emit this `?inline`
 * specifier verbatim into `dist`, which is the bug the entry point exists to fix (see
 * tools/build/css-text-module.mjs). The published `dist/item-css.js` is generated from the
 * compiled `dist/item.css` instead.
 *
 * Dev resolves here through the `@qti-components/theme/item-css` mapping in the root tsconfig
 * `paths`, which vite-tsconfig-paths applies in Storybook, Vitest and apps/e2e alike. Vite handles
 * `?inline` natively and runs the same postcss.config.mjs pipeline, so dev and the published
 * artifact carry identical text.
 */
import cssText from './item.css?inline';

export default cssText;
