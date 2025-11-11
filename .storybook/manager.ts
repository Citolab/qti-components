// .storybook/manager.ts
import { addons } from 'storybook/manager-api';
import { defaultConfig, type TagBadgeParameters } from 'storybook-addon-tag-badges/manager-helpers';

addons.setConfig({
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
    // Place the default config after your custom matchers.
    ...defaultConfig
  ] satisfies TagBadgeParameters
});
