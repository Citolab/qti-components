import { createElement as h, useEffect, useState } from 'react';

import type { CSSProperties } from 'react';

/**
 * What each topic of an interaction proves. The topics are the folders under
 * `Interactions/<Name>/` (see #320); Choice is the reference.
 */
const TOPICS = [
  { name: 'Overview', proves: 'Examples to try, with controls for the properties' },
  { name: 'Accessibility', proves: 'ARIA roles and states, keyboard use, focus' },
  { name: 'API', proves: 'Properties, attributes, events and methods' },
  { name: 'Behavior', proves: 'What the candidate can do and what happens' },
  { name: 'Configuration', proves: 'Options of this interaction: modes, shuffle, limits' },
  { name: 'Config Context', proves: 'Delivery options the host sets on the test or item' },
  { name: 'DOM Manipulation', proves: 'Adding, removing and moving children at runtime' },
  { name: 'Forms', proves: 'Taking part in a <form>: value, reset, submit' },
  { name: 'Theming', proves: 'CSS custom properties, parts and states' },
  { name: 'Validation', proves: 'Validity, required, custom messages' },
  { name: 'Vocabulary', proves: 'The 1EdTech QTI vocabulary classes and attributes' }
];

interface IndexEntry {
  id: string;
  title: string;
  type: 'story' | 'docs';
}

interface Cell {
  count: number;
  firstId?: string;
}

/** A link to a story in the manager: this page lives in the preview iframe, the sidebar is its parent. */
const storyHref = (id: string) => {
  try {
    return new URL(`?path=/story/${id}`, window.parent.location.href).href;
  } catch {
    return `?path=/story/${id}`;
  }
};

const cellStyle = (count: number): CSSProperties => ({
  textAlign: 'center',
  background: count > 0 ? 'color-mix(in srgb, #2da44e 18%, transparent)' : 'transparent',
  opacity: count > 0 ? 1 : 0.45
});

/**
 * A table of interaction x topic with the number of stories in each, read from Storybook's own story
 * index, so it cannot go stale. An empty cell is a gap. Written with `createElement` because the
 * repo's tsconfig has no `jsx` setting.
 */
export const EvidenceMatrix = () => {
  const [entries, setEntries] = useState<IndexEntry[] | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch('./index.json')
      .then(response => response.json())
      .then((index: { entries: Record<string, IndexEntry> }) => setEntries(Object.values(index.entries)))
      .catch(e => setError(String(e)));
  }, []);

  if (error) return h('p', null, `Could not read the story index: ${error}`);
  if (!entries) return h('p', null, 'Reading the story index…');

  const rows = new Map<string, Map<string, Cell>>();
  for (const entry of entries) {
    const [root, name, topic] = entry.title.split('/');
    if (root !== 'Interactions' || !name || !topic || entry.type !== 'story') continue;
    const cells = rows.get(name) ?? new Map<string, Cell>();
    const cell = cells.get(topic) ?? { count: 0 };
    cell.count += 1;
    cell.firstId ??= entry.id;
    cells.set(topic, cell);
    rows.set(name, cells);
  }

  const covered = (topic: string) => [...rows.values()].filter(cells => (cells.get(topic)?.count ?? 0) > 0).length;
  const center: CSSProperties = { textAlign: 'center' };

  return h(
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
          h('th', null, 'Interaction'),
          ...TOPICS.map(topic => h('th', { key: topic.name, title: topic.proves, style: center }, topic.name))
        )
      ),
      h(
        'tbody',
        null,
        ...[...rows].map(([name, cells]) =>
          h(
            'tr',
            { key: name },
            h('td', null, name),
            ...TOPICS.map(topic => {
              const cell = cells.get(topic.name);
              return h(
                'td',
                { key: topic.name, style: cellStyle(cell?.count ?? 0) },
                cell ? h('a', { href: storyHref(cell.firstId!), target: '_top' }, String(cell.count)) : '–'
              );
            })
          )
        )
      ),
      h(
        'tfoot',
        null,
        h(
          'tr',
          null,
          h('th', null, 'Interactions covered'),
          ...TOPICS.map(topic => h('th', { key: topic.name, style: center }, `${covered(topic.name)} / ${rows.size}`))
        )
      )
    )
  );
};
