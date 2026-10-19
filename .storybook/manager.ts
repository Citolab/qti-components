// .storybook/manager.ts
import { addons } from 'storybook/manager-api';
import { defaultConfig, type TagBadgeParameters } from 'storybook-addon-tag-badges/manager-helpers';

import { renderFolderLabel } from './extensions/folder-tags';

addons.setConfig({
  sidebar: {
    renderLabel: renderFolderLabel
  },
  tagBadges: [
    // Add an entry that matches 'frog' and displays a cool badge in the sidebar only
    {
      tags: 'frog',
      badge: {
        text: 'Frog 🐸',
        style: {
          backgroundColor: '#001c13',
          color: '#e0eb0b'
        },
        tooltip: 'This component can catch flies!'
      },
      display: {
        sidebar: [
          {
            type: 'component',
            skipInherited: true
          }
        ],
        toolbar: false,
        mdx: true
      }
    },
    // Conformance stories: a placeholder nothing tests yet, and a test that is written but known to fail.
    {
      tags: 'todo',
      badge: {
        text: 'To do',
        style: { backgroundColor: '#fff8c5', color: '#7d4e00' },
        tooltip: 'A placeholder: nothing tests this criterion yet'
      },
      display: { sidebar: [{ type: 'story' }], toolbar: false, mdx: true }
    },
    {
      tags: 'xfail',
      badge: {
        text: 'Failing',
        style: { backgroundColor: '#ffebe9', color: '#a40e26' },
        tooltip: 'Written, and known to fail: not run in CI'
      },
      display: { sidebar: [{ type: 'story' }], toolbar: false, mdx: true }
    },
    // Interaction maturity: computed by extensions/folder-tags.ts from the conformance stories.
    {
      tags: 'stable',
      badge: {
        text: 'Stable',
        style: { backgroundColor: '#dafbe1', color: '#116329' },
        tooltip: 'Stable: part of the public API, covered by evidence stories'
      },
      display: { sidebar: [{ type: 'group', skipInherited: false }], toolbar: false, mdx: false }
    },
    // Place the default config after your custom matchers.
    ...defaultConfig
  ] satisfies TagBadgeParameters
});
