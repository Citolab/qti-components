/**
 * The QTI 3 shared vocabulary sheet (`native.css`: qti-layout-row, qti-well, qti-padding-*, …) as a string.
 *
 * The DEV/source half of `@qti-components/theme/native-css`, like `item-css.ts`: never compiled by tsc, resolved
 * through the root tsconfig `paths` in Storybook, Vitest and apps/e2e. The published `dist/native-css.js` is generated
 * from the compiled `dist/native.css` (see tools/build/css-text-module.mjs).
 *
 * The portable-custom-interaction inlines it into the PCI iframe, so markup that uses the shared vocabulary is styled
 * without loading a stylesheet from a URL.
 */
import cssText from './native.css?inline';

export default cssText;
