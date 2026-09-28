/**
 * Replace TypeScript's internal names for symbol-keyed properties with a stable spelling.
 *
 * When `@wc-toolkit/type-parser` expands an object type, it prints each property by its
 * TypeScript *escaped* name. For a property keyed by a well-known symbol, that name is
 * `__@<description>@<symbolId>` — for example `__@iterator@588` for `[Symbol.iterator]`.
 * The trailing number is TypeScript's internal symbol id: a global counter that depends on
 * which files, lib files and `node_modules` types the program happened to load, and in what
 * order. It changes between machines, between TypeScript versions and after almost any source
 * change, so the committed manifest churned on every regeneration and conflicted between
 * branches even when nothing relevant changed.
 *
 * This plugin rewrites every `__@name@123` to `[Symbol.name]`, which is what the source
 * actually says. Run it after the type parser (anywhere in `packageLinkPhase` works; last is
 * simplest).
 *
 * Remove once type-parser prints symbol-keyed properties by their declared name.
 */
const INTERNAL_SYMBOL_NAME = /__@([A-Za-z_$][\w$]*)@\d+/g;

function rewrite(value) {
  if (typeof value === 'string') {
    return value.includes('__@') ? value.replace(INTERNAL_SYMBOL_NAME, '[Symbol.$1]') : value;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) value[i] = rewrite(value[i]);
    return value;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) value[key] = rewrite(value[key]);
  }
  return value;
}

export function stableSymbolNamesPlugin() {
  return {
    name: 'local-stable-symbol-names',
    packageLinkPhase({ customElementsManifest }) {
      rewrite(customElementsManifest);
    }
  };
}
