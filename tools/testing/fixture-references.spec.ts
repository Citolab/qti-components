/**
 * Every test or item XML a story, docs page or fixtures file points at must exist in `public/assets`.
 * A moved or renamed fixture then fails here, by name, and not as a blank story somewhere in Storybook.
 *
 * Fixtures that belong to one docs page live in `public/assets/docs/<page>/`, with a `*.fixtures.ts`
 * next to the page that names them; see `getting-started.fixtures.ts`.
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

const REFERENCE = /\/assets\/[A-Za-z0-9_./~-]+\.xml/g;

const references = new Map<string, string[]>();
for (const [file, text] of Object.entries(sources)) {
  for (const url of text.match(REFERENCE) ?? []) {
    references.set(url, [...(references.get(url) ?? []), file]);
  }
}

describe('fixture references', () => {
  it('finds the references it checks', () => {
    expect(references.has('/assets/docs/getting-started/assessment.xml')).toBe(true);
  });

  it('points only at fixtures that exist', async () => {
    const missing: string[] = [];
    await Promise.all(
      [...references].map(async ([url, files]) => {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) missing.push(`${url} (used by ${files[0]})`);
      })
    );
    expect(missing.sort()).toEqual([]);
  });
});
