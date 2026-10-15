import { useEffect, useState } from 'react';

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
 * Plain React JSX (`jsx: react-jsx` in the root tsconfig).
 */

interface Entry {
  id: string;
  type: string;
  name: string;
  exportName: string;
  importPath: string;
  title: string;
  tags: string[];
}

type State = 'asserted' | 'todo' | 'shown';
interface Item {
  /** What the chip shows: the first criterion ID, with how many more the story covers. */
  criterion: string;
  /** Every criterion ID the story covers. */
  criteria: string[];
  /** Delivery, import, ... : the capability of the story's criteria (the first one's when they differ). */
  capability: string;
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

const ID = /[A-Z]{1,2}\d+[a-z]?-L\d-[EIAD]\d+/g;
const idsIn = (text: string) => [...new Set(text.replaceAll('_', '-').match(ID) ?? [])];

/**
 * The criteria a story covers: every ID in its name (`Q2-L1-D51`, `Q5_L1_D104`, or a list such as
 * `T4-L1-D1, T7-L1-D2`), else the ID in its export name, else the one in its title.
 */
const criteriaOf = (entry: Entry) => {
  const named = idsIn(entry.name);
  if (named.length) return named;
  const exported = idsIn(entry.exportName);
  if (exported.length) return exported;
  return idsIn(entry.title);
};

const groupsOf = (entries: Entry[]): Group[] => {
  const groups = new Map<string, Group>();
  for (const entry of entries) {
    const [profile, folder] = entry.importPath.split('/stories/conformance/')[1]?.split('/') ?? [];
    if (entry.type !== 'story' || !profile) continue;
    const key = `${profile}/${folder}`;
    const group = groups.get(key) ?? { profile, folder: folder.endsWith('.ts') ? profile : folder, items: [] };
    const criteria = criteriaOf(entry);
    // No suite ID (the PCI stories are `Q16-PCI-D11`): the export name still ends in a capability and number.
    const label = criteria[0] ?? entry.exportName.replaceAll('_', '-');
    group.items.push({
      criterion: criteria.length > 1 ? `${criteria[0]} +${criteria.length - 1}` : label,
      criteria,
      capability: capabilityOf(label),
      state: stateOf(entry.tags),
      storyId: entry.id
    });
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
  /** The cell last clicked: its row, and which of the row's stories it counts (a capability, `all` or `todo`). */
  const [picked, setPicked] = useState<{ group: string; filter: string } | null>(null);

  useEffect(() => {
    fetch('./index.json')
      .then(response => response.json())
      .then((index: { entries: Record<string, Entry> }) => setEntries(Object.values(index.entries)))
      .catch(e => setError(String(e)));
  }, []);

  if (error) return <p>Could not read the story index: {error}</p>;
  if (!entries) return <p>Reading the story index…</p>;

  const groups = groupsOf(entries);
  const all = count(groups.flatMap(g => g.items));
  const center: CSSProperties = { textAlign: 'center' };
  const text = (n: { asserted: number; total: number }) => (n.total ? `${n.asserted}/${n.total}` : '–');

  const groupKey = (group: Group) => `${group.profile}/${group.folder}`;
  const counts = (item: Item, filter: string) =>
    filter === 'all' ? true : filter === 'todo' ? item.state === 'todo' : item.capability === filter;

  /** A number in the table opens its row's stories below and marks the ones it counts. Again to clear. */
  const pick = (group: Group, filter: string) => {
    const key = groupKey(group);
    setPicked(picked?.group === key && picked.filter === filter ? null : { group: key, filter });
    setTimeout(() => {
      const details = document.getElementById(`conformance-${key}`) as HTMLDetailsElement | null;
      if (!details) return;
      details.open = true;
      details.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 0);
  };
  const link = (group: Group, filter: string, label: ReactNode) => (
    <a
      href="#"
      onClick={event => {
        event.preventDefault();
        pick(group, filter);
      }}
      title="Show these stories"
      style={{ color: 'inherit', textDecoration: 'underline dotted', cursor: 'pointer' }}
    >
      {label}
    </a>
  );

  const cell = (group: Group, key: string) => {
    const n = count(group.items.filter(i => i.capability === key));
    return (
      <td key={key} style={cellStyle(n)}>
        {n.total ? link(group, key, text(n)) : text(n)}
      </td>
    );
  };

  const table = (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Profile</th>
            <th>Feature</th>
            {CAPABILITIES.map(c => (
              <th key={c.key} title={c.proves} style={center}>
                {c.label}
              </th>
            ))}
            <th style={center}>Total</th>
            {all.todo > 0 && (
              <th style={center} title="Placeholders for criteria nothing tests yet">
                To do
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {groups.map(group => {
            const total = count(group.items);
            return (
              <tr key={groupKey(group)}>
                <td>{group.profile}</td>
                <td>{prettify(group.folder)}</td>
                {CAPABILITIES.map(c => cell(group, c.key))}
                <td style={cellStyle(total)}>{link(group, 'all', text(total))}</td>
                {all.todo > 0 && <td style={center}>{total.todo ? link(group, 'todo', total.todo) : '–'}</td>}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={2}>All conformance stories</th>
            {CAPABILITIES.map(c => {
              const n = count(groups.flatMap(g => g.items.filter(i => i.capability === c.key)));
              return (
                <th key={c.key} style={center}>
                  {text(n)}
                </th>
              );
            })}
            <th style={center}>{text(all)}</th>
            {all.todo > 0 && <th style={center}>{all.todo}</th>}
          </tr>
        </tfoot>
      </table>
    </div>
  );

  const lists = groups.map(group => (
    <details key={groupKey(group)} id={`conformance-${groupKey(group)}`}>
      <summary>{`${group.profile} · ${prettify(group.folder)} (${group.items.length})`}</summary>
      <p style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {group.items.map(item => (
          <a
            key={item.storyId}
            href={storyHref(item.storyId)}
            target="_top"
            title={`${item.state}${item.criteria.length ? ': ' + item.criteria.join(', ') : ''}`}
            style={{
              padding: '0 0.4rem',
              border: '1px solid currentColor',
              borderRadius: '0.25rem',
              fontSize: '0.8em',
              ...(picked?.group === groupKey(group)
                ? counts(item, picked.filter)
                  ? { fontWeight: 700, outline: '2px solid currentColor' }
                  : { opacity: 0.3 }
                : { opacity: item.state === 'asserted' ? 1 : 0.6 })
            }}
          >
            {`${MARK[item.state]} ${item.criterion}`}
          </a>
        ))}
      </p>
    </details>
  ));

  return (
    <div>
      <p>
        {`${all.asserted} of ${all.total} conformance stories assert something` +
          (all.todo ? `; ${all.todo} are placeholders for criteria nothing tests yet.` : '.')}
      </p>
      {table}
      <h3>Every story</h3>
      <p>✓ asserts it · ○ shows it, no assertion · ◻ placeholder, to do</p>
      {lists}
    </div>
  );
};
