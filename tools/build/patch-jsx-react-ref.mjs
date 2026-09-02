/**
 * Widens the `ref` prop in the generated JSX types so React refs type-check.
 *
 * @wc-toolkit/jsx-types emits `ref?: T | ((e: T) => void)` on every custom element — the
 * element itself, or a callback taking it. That is right for a Lit template and wrong for
 * React, which also accepts a RefObject and assigns `.current` itself. The runtime has
 * always been fine; only the declared type disagreed, so every `ref={someReactRef}` was an
 * error and consumers had to cast at each call site.
 *
 * It cannot be fixed downstream: the generator emits `declare module "react"` AND
 * `declare global`, both `interface IntrinsicElements extends CustomElements {}`, and a
 * consumer's own augmentation merges rather than replaces — a widened `ref` loses.
 * The plugin exposes no option for this (see JsxTypesOptions), hence patching its output.
 *
 * Drop this once @wc-toolkit/jsx-types types `ref` for React itself.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [, , file] = process.argv;
if (!file) {
  console.error('usage: patch-jsx-react-ref.mjs <generated-jsx-types.d.ts>');
  process.exit(1);
}

const FROM = 'ref?: T | ((e: T) => void);';
const TO = 'ref?: T | ((e: T) => void) | { current: T | null } | null;';

const source = readFileSync(file, 'utf8');

if (source.includes(TO)) {
  console.log(`patch-jsx-react-ref: ${file} already patched`);
  process.exit(0);
}

/*
 * Fail loudly rather than silently no-op: if a @wc-toolkit/jsx-types upgrade reshapes the
 * template, we want the build to stop and someone to re-check whether the patch is still
 * needed, not to ship unpatched types that only break in consumer projects.
 */
if (!source.includes(FROM)) {
  console.error(
    `patch-jsx-react-ref: expected ref declaration not found in ${file}.\n` +
      `Looked for: ${FROM}\n` +
      'The generator template probably changed — re-check whether this patch is still needed.'
  );
  process.exit(1);
}

const count = source.split(FROM).length - 1;
writeFileSync(file, source.split(FROM).join(TO));
console.log(`patch-jsx-react-ref: widened ${count} ref declaration(s) in ${file}`);
