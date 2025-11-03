// .storybook/manager.ts
import { addons } from 'storybook/manager-api';
import { defaultConfig, type TagBadgeParameters } from 'storybook-addon-tag-badges';

addons.setConfig({
  tagBadges: [
    // Add an entry that matches 'frog' and displays a cool badge in the sidebar only
    {
      tags: 'frog',
      badge: {
        text: 'Frog 🐸',
        tooltip: 'This component can catch flies!'
      },
      display: {
        sidebar: ['component'],
        toolbar: false
      }
    },
    // Place the default config after your custom matchers.
    ...defaultConfig
  ] satisfies TagBadgeParameters
});
