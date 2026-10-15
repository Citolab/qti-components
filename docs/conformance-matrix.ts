import { createElement as h, useEffect, useState } from 'react';

import type { CSSProperties, ReactNode } from 'react';

/**
 * The QTI 3 conformance stories as a table, read from Storybook's own story index: no test run, no
 * generated file. Every story under `stories/conformance/` is one criterion of the 1EdTech suite, named
 * by its ID (`Q2-L1-D51`), and is in one of three states:
 *
 * - asserted: it has a `play` (the index tags it `play-fn`). CI runs every such story, so on main it passes.
 * - to do: an empty placeholder, tagged `conformance-todo`. It is the criterion nobody tests yet.
 * - shown: it renders something to check by eye and asserts nothing.
 *
 * Written with `createElement` because the repo's tsconfig has no `jsx` setting.
 */

interface Entry {
  id: string;
  type: string;
  name: string;
  exportName: string;
  importPath: string;
  tags: string[];
}

type State = 'asserted' | 'todo' | 'shown';
interface Item {
  criterion: string;
  state: State;
  storyId: string;
}
interface Group {
  profile: string;
  folder: string;
  items: Item[];
}

const CAPABILITIES = [
  { key: 'D', label: 'Delivery', proves: 'What a candidate sees and what the response variable holds' },
  { key: 'I', label: 'Import', proves: 'The item is read and stored correctly' },
  { key: 'other', label: 'Other', proves: 'Stories whose name is not a 1EdTech criterion ID' }
];
const MARK: Record<State, string> = { asserted: '✓', todo: '◻', shown: '○' };

const capabilityOf = (criterion: string) => /-([EIAD])\d+$/.exec(criterion)?.[1] ?? 'other';
const prettify = (folder: string) =>
  folder
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^([A-Z]+\d+[a-z]?)[-_ ]+/, '$1 · ')
    .replace(/[-_]/g, ' ');

const storyHref = (id: string) => {
  try {
    return new URL(`?path=/story/${id}`, window.parent.location.href).href;
  } catch {
    return `?path=/story/${id}`;
  }
};

const stateOf = (tags: string[]): State =>
  tags.includes('conformance-todo') ? 'todo' : tags.includes('play-fn') ? 'asserted' : 'shown';

/** The criterion ID is the story's name, or its export name (`Q2_L1_D51`). */
const criterionOf = (entry: Entry) =>
  /^[A-Z]{1,2}\d+[a-z]?-L\d-[EIAD]\d+$/.test(entry.name) ? entry.name : entry.exportName.replaceAll('_', '-');

const groupsOf = (entries: Entry[]): Group[] => {
  const groups = new Map<string, Group>();
  for (const entry of entries) {
    const [profile, folder] = entry.importPath.split('/stories/conformance/')[1]?.split('/') ?? [];
    if (entry.type !== 'story' || !profile) continue;
    const key = `${profile}/${folder}`;
    const group = groups.get(key) ?? { profile, folder: folder.endsWith('.ts') ? profile : folder, items: [] };
    group.items.push({ criterion: criterionOf(entry), state: stateOf(entry.tags), storyId: entry.id });
    groups.set(key, group);
  }
  return [...groups.values()].sort(
    (a, b) => a.profile.localeCompare(b.profile) || a.folder.localeCompare(b.folder, undefined, { numeric: true })
  );
};

const count = (items: Item[]) => ({
  asserted: items.filter(i => i.state === 'asserted').length,
  todo: items.filter(i => i.state === 'todo').length,
  total: items.length
});

const green = 'color-mix(in srgb, #2da44e 20%, transparent)';
const amber = 'color-mix(in srgb, #bf8700 22%, transparent)';
const cellStyle = ({ asserted, total }: { asserted: number; total: number }): CSSProperties => ({
  textAlign: 'center',
  opacity: total ? 1 : 0.4,
  background: total && asserted === total ? green : total ? amber : 'transparent'
});

export const ConformanceMatrix = () => {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch('./index.json')
      .then(response => response.json())
      .then((index: { entries: Record<string, Entry> }) => setEntries(Object.values(index.entries)))
      .catch(e => setError(String(e)));
  }, []);

  if (error) return h('p', null, `Could not read the story index: ${error}`);
  if (!entries) return h('p', null, 'Reading the story index…');

  const groups = groupsOf(entries);
  const all = count(groups.flatMap(g => g.items));
  const center: CSSProperties = { textAlign: 'center' };
  const text = (n: { asserted: number; total: number }) => (n.total ? `${n.asserted}/${n.total}` : '–');

  const cell = (group: Group, key: string): ReactNode => {
    const n = count(group.items.filter(i => capabilityOf(i.criterion) === key));
    return h('td', { key, style: cellStyle(n) }, text(n));
  };

  const table = h(
    'div',
    { style: { overflowX: 'auto' } },
    h(
      'table',
      null,
      h(
        'thead',
        null,
        h(
          'tr',
          null,
          h('th', null, 'Profile'),
          h('th', null, 'Feature'),
          ...CAPABILITIES.map(c => h('th', { key: c.key, title: c.proves, style: center }, c.label)),
          h('th', { style: center }, 'Total'),
          ...(all.todo
            ? [h('th', { key: 'todo', style: center, title: 'Placeholders for criteria nothing tests yet' }, 'To do')]
            : [])
        )
      ),
      h(
        'tbody',
        null,
        ...groups.map(group => {
          const total = count(group.items);
          return h(
            'tr',
            { key: `${group.profile}/${group.folder}` },
            h('td', null, group.profile),
            h('td', null, prettify(group.folder)),
            ...CAPABILITIES.map(c => cell(group, c.key)),
            h('td', { style: cellStyle(total) }, text(total)),
            ...(all.todo ? [h('td', { key: 'todo', style: center }, total.todo || '–')] : [])
          );
        })
      ),
      h(
        'tfoot',
        null,
        h(
          'tr',
          null,
          h('th', { colSpan: 2 }, 'All conformance stories'),
          ...CAPABILITIES.map(c => {
            const n = count(groups.flatMap(g => g.items.filter(i => capabilityOf(i.criterion) === c.key)));
            return h('th', { key: c.key, style: center }, text(n));
          }),
          h('th', { style: center }, text(all)),
          ...(all.todo ? [h('th', { key: 'todo', style: center }, all.todo)] : [])
        )
      )
    )
  );

  const lists = groups.map(group =>
    h(
      'details',
      { key: `${group.profile}/${group.folder}` },
      h('summary', null, `${group.profile} · ${prettify(group.folder)} (${group.items.length})`),
      h(
        'p',
        { style: { display: 'flex', flexWrap: 'wrap', gap: '0.25rem' } },
        ...group.items.map(item =>
          h(
            'a',
            {
              key: item.storyId,
              href: storyHref(item.storyId),
              target: '_top',
              title: item.state,
              style: {
                padding: '0 0.4rem',
                border: '1px solid currentColor',
                borderRadius: '0.25rem',
                fontSize: '0.8em',
                opacity: item.state === 'asserted' ? 1 : 0.6
              }
            },
            `${MARK[item.state]} ${item.criterion}`
          )
        )
      )
    )
  );

  return h(
    'div',
    null,
    h(
      'p',
      null,
      `${all.asserted} of ${all.total} conformance stories assert something` +
        (all.todo ? `; ${all.todo} are placeholders for criteria nothing tests yet.` : '.')
    ),
    table,
    h('h3', null, 'Every story'),
    h('p', null, '✓ asserts it · ○ shows it, no assertion · ◻ placeholder, to do'),
    ...lists
  );
};
