/**
 * Every fixture a story, docs page or fixtures file points at must exist. A moved or renamed fixture
 * then fails here, by name, and not as a blank story somewhere in Storybook.
 *
 * Fixtures live in two places (see "Fixtures" in CLAUDE.md): shared ones in `public/assets/`, served at
 * `/assets/…`, and a story's own in a `fixtures/` folder next to it, served at its repo path
 * under `/fixtures/` (`/fixtures/packages/…/src/…/fixtures/…`). Code names them through constants in `*.fixtures.ts` files.
 */
const sources = import.meta.glob(
  [
    '/packages/**/*.{ts,mdx}',
    '/apps/**/*.{ts,mdx}',
    '/docs/**/*.{ts,mdx}',
    '!/apps/site/**',
    '!/**/node_modules/**',
    '!/**/dist/**',
    '!/**/*.spec.ts'
  ],
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

/** Every file in a fixtures folder next to a story; only the paths are used, nothing is loaded. */
const colocatedFiles = Object.keys(import.meta.glob(['/packages/**/src/**/fixtures/**', '!/**/node_modules/**']));

/** The URL prefix `colocatedFixtures` serves a story's own fixtures under; strip it for the repo path. */
const SERVED = '/fixtures/';

const REFERENCE = /\/(?:assets|fixtures\/packages)\/[A-Za-z0-9_./~-]+\.xml/g;
/**
 * An absolute `.xml` path in quotes that is served from neither place: a typo or a stale path.
 * `/path/to/…` is the placeholder docs use in code samples.
 */
const UNSERVED = /["'`](\/(?!assets\/|fixtures\/packages\/|path\/to\/)[A-Za-z0-9_./~-]+\.xml)["'`]/g;
/** A path constant in a fixtures file: `export const X = '/…';` */
const CONSTANT = /export const (\w+)\s*=\s*['"`](\/[^'"`$]+)['"`]/g;

const references = new Map<string, string[]>();
const unserved: string[] = [];
const constants: { name: string; path: string; file: string }[] = [];
for (const [file, text] of Object.entries(sources)) {
  for (const url of text.match(REFERENCE) ?? []) {
    references.set(url, [...(references.get(url) ?? []), file]);
  }
  for (const [, url] of text.matchAll(UNSERVED)) unserved.push(`${url} (in ${file})`);
  if (file.endsWith('.fixtures.ts')) {
    for (const [, name, path] of text.matchAll(CONSTANT)) constants.push({ name, path, file });
  }
}

const exists = async (url: string) => (await fetch(url, { method: 'HEAD' })).ok;

describe('fixture references', () => {
  it('finds the references it checks', () => {
    expect(references.has('/assets/docs/getting-started/assessment.xml')).toBe(true);
    expect(constants.some(c => c.path.startsWith(SERVED))).toBe(true);
  });

  it('points only at fixtures that exist', async () => {
    const missing: string[] = [];
    await Promise.all(
      [...references].map(async ([url, files]) => {
        if (!(await exists(url))) missing.push(`${url} (used by ${files[0]})`);
      })
    );
    expect(missing.sort()).toEqual([]);
  });

  it('has no .xml paths outside /assets/ and /fixtures/', () => {
    expect(unserved.sort()).toEqual([]);
  });

  it('has fixtures constants that point at a real file or folder', async () => {
    const broken: string[] = [];
    await Promise.all(
      constants.map(async ({ name, path, file }) => {
        // A folder constant ends in `/`: it must hold at least one file. A file constant must answer.
        const repoPath = path.startsWith(SERVED) ? path.slice(SERVED.length - 1) : null;
        const found = repoPath
          ? path.endsWith('/')
            ? colocatedFiles.some(f => f.startsWith(repoPath))
            : colocatedFiles.includes(repoPath)
          : path.endsWith('/')
            ? true // a shared folder under /assets has no listing to check; its files are referenced by name
            : await exists(path);
        if (!found) broken.push(`${name} = ${path} (in ${file})`);
      })
    );
    expect(broken.sort()).toEqual([]);
  });
});
