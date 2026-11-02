import { addons, type API } from 'storybook/manager-api';
import { renderLabel } from 'storybook-addon-tag-badges/manager-helpers';

/**
 * Folder badges for the sidebar.
 *
 * Storybook gives sidebar folders (groups) an empty `tags` list, so the tag-badges addon never badges a
 * folder. Use `renderFolderLabel` as `sidebar.renderLabel` in the manager config and give folders the
 * tags computed here; the badge itself is a normal `tagBadges` entry with `display.sidebar: [{ type: 'group' }]`.
 *
 * `stable`: an `Interactions/<Name>` folder is stable when its QTI 3 conformance folder
 * (`Testing/Conformance/<profile>/Q.. <Name> Interaction`) has stories and every one of them asserts: no
 * `todo` placeholder, no `xfail`, no story that only shows something. A known failure (`xfail`) in the
 * interaction's own `Interactions/<Name>` stories also withholds it. Nothing is tagged by hand.
 *
 * Manager code is not hot-reloaded: restart Storybook after changing this file.
 */
let storybookApi: API | undefined;
addons.register('qti/folder-tags', api => {
  storybookApi = api;
});

type IndexEntry = { title: string; type: string; tags?: string[] };

const sanitize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

/** `Q-6 Gap Match Interaction` and `Q11 - Hot-text Interaction` both reduce to the interaction's name. */
const conformanceName = (folder: string) =>
  /^q-?\d+[a-z]?\b/i.test(folder) && /interaction$/i.test(folder)
    ? squash(folder.replace(/^q-?\d+[a-z]?[\s-]*/i, '').replace(/\s*interaction$/i, ''))
    : undefined;

const isStable = (name: string, entries: IndexEntry[]) => {
  const stories = entries.filter(
    entry =>
      entry.type === 'story' &&
      entry.title.startsWith('Testing/Conformance/') &&
      conformanceName(entry.title.split('/')[3] ?? '') === squash(name)
  );
  const knownFailures = entries.some(
    ({ title, type, tags = [] }) =>
      type === 'story' &&
      title.split('/')[0] === 'Interactions' &&
      title.split('/')[1] === name &&
      tags.includes('xfail')
  );
  return (
    !knownFailures &&
    stories.length > 0 &&
    stories.every(({ tags = [] }) => tags.includes('play-fn') && !tags.includes('todo') && !tags.includes('xfail'))
  );
};

const folderTags = (id: string): string[] => {
  const entries = Object.values(storybookApi?.getIndex()?.entries ?? {}) as IndexEntry[];
  const name = entries
    .map(entry => entry.title.split('/'))
    .find(([root, folder]) => root === 'Interactions' && folder && sanitize(`${root}-${folder}`) === id)?.[1];
  return name && isStable(name, entries) ? ['stable'] : [];
};

export const renderFolderLabel: typeof renderLabel = item =>
  renderLabel(item.type === 'group' ? { ...item, tags: folderTags(item.id) } : item);
