/**
 * Fails the build when this repo declares a `qti-` name that 1EdTech does not define.
 *
 * Why this exists, when nothing else in the repo can see it:
 *
 * The `qti-` prefix is not ours. The implementation guide (§2.2.2) says the standardized
 * classes carry it "in the hope of preventing class naming conflicts", and — critically —
 * that the shared vocabulary is "maintained outside of the QTI specification (schema)".
 * So 1EdTech can add `qti-dialog` tomorrow, with its own meaning, without a schema version
 * bump and without any signal reaching us. Every name we mint inside the prefix is a bet
 * that they never mint the same one. That example is not hypothetical: `qti-dialog` is a name
 * this repo did hold, on the modal-feedback element, until it was renamed to `cito-dialog`.
 *
 * Nothing else catches it. Stylelint only globs `*.{css,scss}` (see `lint:css`), and about
 * half these selectors live in `css``  `` blocks inside `.styles.ts` — which is exactly
 * where `qti-choices-stacking-6` and `qti-input-width-5` sat undetected. VRT compares end
 * states and a squatted name renders fine, because it is our own CSS answering it. The
 * failure only ever appears in someone else's delivery engine, or years later as a silent
 * collision. So this reads both file kinds.
 *
 * Two failure modes, ranked:
 *
 *   tags     Fatal and unfixable. Two custom elements cannot share a tag name, and
 *            `register.ts` guards with `if (!customElements.get(tag))` — so a collision
 *            does not throw, it silently keeps whichever registered first.
 *   classes  Degrades. Wrong styling, and non-portable styling that reads as portable to
 *            item authors.
 *
 * Deliberately out of scope: `--qti-*` custom properties. The spec defines no custom
 * properties at all, so there is nothing to collide with, and those names are migrating to
 * the generic `--component-*` paint contract anyway.
 *
 * Usage:  node tools/qti-vocabulary/check.mjs        (also wired up as `npm run lint:vocab`)
 * Refresh the reserved set with `node tools/qti-vocabulary/generate.mjs`.
 */
import { globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

/**
 * Names we mint inside the `qti-` prefix on purpose, each with the reason it is worth the
 * collision risk. Adding a line here is the deliberate act this check exists to force —
 * it should be an argued exception, not a reflex.
 *
 * Every entry must be a name this check actually flags. An entry for something it cannot see
 * is worse than none: the list reads as the complete set of accepted exceptions, so a name
 * that is here for decoration implies a coverage this check does not have. Verify with
 * `const ALLOWLIST = {}` — whatever the run reports is the whole real list.
 *
 * Two surfaces are deliberately unscanned, and names living only there must NOT be listed:
 *
 *   public/assets/**   Authored QTI content and the stylesheets items pull in via
 *                      `qti-stylesheet`. Not ours to rename — see `qti-input-width-5`, where
 *                      the class is 1EdTech's own conformance content and the omission is in
 *                      their published vocabulary, not in the fixture.
 *   `<style>` inside an html`` template. Only stories do this, to demo layout. Checked: the
 *                      two shipped files that build a `<style>` element only inject
 *                      author-supplied CSS at runtime (qti-stylesheet, PCI) and declare no
 *                      qti- names of their own.
 */
const ALLOWLIST = {
  'qti-item':
    'Delivery-engine item container, not QTI content. Public API; rename is cross-repo (QTI-Editor, 9 files).',
  'qti-test':
    'Delivery-engine test container, not QTI content. Public API; rename is cross-repo (QTI-Editor, 2 files).',
  'qti-portable-custom-interaction-test': 'Test-only element, never shipped in content.'
};

const reserved = JSON.parse(readFileSync(join(here, 'reserved.json'), 'utf8'));
const reservedElements = new Set(reserved.elements);
/* A class selector may legitimately name an element (styling by tag is normal in QTI), so
   classes are checked against both sets. */
const reservedClasses = new Set([...reserved.elements, ...reserved.vocabulary]);

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/** Strip CSS comments so prose that mentions a name is not read as a declaration. */
const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Strip attribute selectors: `[class*='qti-layout-col']` names a family, not a class. */
const stripAttributeSelectors = css => css.replace(/\[[^\]]*\]/g, '');

/** Every css`` block in a .ts file. */
const cssBlocks = source => {
  const blocks = [];
  const re = /\bcss`/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const start = m.index + m[0].length;
    const end = source.indexOf('`', start);
    if (end === -1) break;
    blocks.push(source.slice(start, end));
    re.lastIndex = end + 1;
  }
  return blocks;
};

const violations = [];

/**
 * Collect unreserved class names out of one chunk of CSS.
 *
 * `whole` is the file the chunk came from — stripping comments shifts every offset, so the
 * reported line is found back in the untouched source rather than taken from the match.
 */
const collectClasses = (chunk, file, whole) => {
  const cleaned = stripAttributeSelectors(stripComments(chunk));
  for (const m of cleaned.matchAll(/\.(qti-[a-z0-9]+(?:-{1,2}[a-z0-9]+)*)/g)) {
    const name = m[1];
    if (reservedClasses.has(name) || name in ALLOWLIST) continue;
    violations.push({ kind: 'class', name, file, line: lineOf(whole, whole.indexOf(`.${name}`)) });
  }
};

const sources = file => !file.includes('node_modules') && !file.includes('/dist/');

/* ── Plain CSS and SCSS ───────────────────────────────────────────────────────────────── */
for (const file of globSync('packages/**/src/**/*.{css,scss}', { cwd: root }).filter(sources)) {
  const source = readFileSync(join(root, file), 'utf8');
  collectClasses(source, file, source);
}

/* ── css`` blocks inside .ts — the half `lint:css` cannot see ─────────────────────────── */
for (const file of globSync('packages/**/src/**/*.ts', { cwd: root }).filter(sources)) {
  const source = readFileSync(join(root, file), 'utf8');
  if (!source.includes('qti-')) continue;
  for (const block of cssBlocks(source)) collectClasses(block, file, source);
}

/* ── Custom element tag names, read from the committed manifest ───────────────────────── */
const manifest = JSON.parse(readFileSync(join(root, 'custom-elements.json'), 'utf8'));
const tags = new Set();
JSON.stringify(manifest, (k, v) => {
  if (v && typeof v === 'object' && typeof v.tagName === 'string') tags.add(v.tagName);
  return v;
});
for (const tag of [...tags].sort()) {
  if (!tag.startsWith('qti-')) continue;
  if (reservedElements.has(tag) || tag in ALLOWLIST) continue;
  violations.push({ kind: 'tag', name: tag, file: 'custom-elements.json', line: 0 });
}

/* ── Report ───────────────────────────────────────────────────────────────────────────── */
const unique = [...new Map(violations.map(v => [`${v.kind}:${v.name}:${v.file}`, v])).values()].sort((a, b) =>
  a.name.localeCompare(b.name)
);

if (unique.length === 0) {
  process.stdout.write(
    `qti-vocabulary: ok — every qti- tag and class is in the reserved set ` +
      `(${reserved.elements.length} elements, ${reserved.vocabulary.length} vocabulary, ` +
      `${Object.keys(ALLOWLIST).length} allowlisted), reserved set generated ${reserved.generatedAt}.\n`
  );
  process.exit(0);
}

process.stderr.write(`\nqti-vocabulary: ${unique.length} name(s) squat the 1EdTech qti- prefix.\n\n`);
for (const v of unique) {
  const where = v.line ? `${v.file}:${v.line}` : v.file;
  process.stderr.write(`  ${v.kind.padEnd(5)} ${v.name}\n         ${where}\n`);
}
process.stderr.write(
  `\nEither rename it out of the qti- prefix (we use cito-), or, if the name has to stay,\n` +
    `add it to ALLOWLIST in tools/qti-vocabulary/check.mjs with the reason it is worth the risk.\n` +
    `If 1EdTech has since published the name, refresh the set:\n` +
    `  node tools/qti-vocabulary/generate.mjs\n\n`
);
process.exit(1);
