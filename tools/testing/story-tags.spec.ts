/**
 * Every story that CI does not run must show why in Storybook. Three tags keep a story out of the
 * test run (`vitest.config.ts`), and two of them carry a sidebar badge (`.storybook/manager.ts`):
 *
 * - `xfail`: written, and known to fail. Badge "Failing". Say why in a comment next to the tag.
 * - `todo`: a placeholder; nothing tests it yet. Badge "To do".
 * - `no-tests`: there is nothing to run, because the story has no play function (a demo, a docs page).
 *
 * So a failing story is never hidden: `skip-test` is gone, and `no-tests` on a story with a play
 * function would hide that play without a badge. Tag that story `xfail` instead.
 */
const stories = import.meta.glob(
  [
    '/packages/**/*.stories.ts',
    '/apps/**/*.stories.ts',
    '/docs/**/*.stories.ts',
    '!/**/node_modules/**',
    '!/**/dist/**'
  ],
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

/** The `tags: [...]` of a block of source, or none. */
const tagsOf = (block: string) => {
  const list = block.match(/\btags:\s*\[([^\]]*)\]/)?.[1] ?? '';
  return [...list.matchAll(/['"]([^'"]+)['"]/g)].map(([, tag]) => tag);
};

/** The file's meta block and one block per exported story, as source text. */
const blocksOf = (source: string) => {
  const metaStart = source.search(/^const meta\b|^export default \{/m);
  const storyStarts = [...source.matchAll(/^export const \w+/gm)].map(m => m.index!);
  const metaEnd = storyStarts.find(start => start > metaStart) ?? source.length;
  const meta = metaStart === -1 ? '' : source.slice(metaStart, metaEnd);
  const storyBlocks = storyStarts.map((start, i) => {
    const block = source.slice(start, storyStarts[i + 1] ?? source.length);
    return { name: block.match(/^export const (\w+)/)![1], block };
  });
  return { meta, storyBlocks };
};

describe('story tags', () => {
  it('no story uses skip-test: a known failure is xfail, so it shows the Failing badge', () => {
    const offenders = Object.entries(stories)
      .filter(([, source]) => /['"]skip-test['"]/.test(source))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });

  it('no story with a play function is tagged no-tests, which would hide it without a badge', () => {
    const offenders: string[] = [];
    for (const [file, source] of Object.entries(stories)) {
      const { meta, storyBlocks } = blocksOf(source);
      const metaNoTests = tagsOf(meta).includes('no-tests');
      for (const { name, block } of storyBlocks) {
        const tags = tagsOf(block);
        const noTests = tags.includes('no-tests') || (metaNoTests && !tags.includes('!no-tests'));
        if (noTests && /\bplay\s*:/.test(block)) offenders.push(`${file} > ${name}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
