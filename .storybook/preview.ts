import { setCustomElementsManifest } from '@storybook/web-components-vite';
import { setStorybookHelpersConfig, type StorybookHelpersOptions } from '@wc-toolkit/storybook-helpers';
import prettier from 'prettier-v2'; /* https://github.com/storybookjs/storybook/issues/8078#issuecomment-2325332120 */
import HTMLParser from 'prettier-v2/parser-html'; /* https://github.com/storybookjs/storybook/issues/8078#issuecomment-2325332120 */
import { expect } from 'storybook/test';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { mswLoader } from 'msw-storybook-addon/csf3';

/*
 * Initializes MSW. Since msw-storybook-addon v3 there is no `initialize()`; the worker is created
 * lazily by a setup function handed to `mswLoader`.
 * See https://github.com/mswjs/msw-storybook-addon/blob/main/MIGRATION.md#from-2xx-to-3xx
 */
const mswSetup = async () => {
  const { setupWorker } = await import('msw/browser');
  const worker = setupWorker();
  await worker.start({ quiet: true, onUnhandledRequest: 'bypass' });
  return worker;
};
/*
 * Shared CSS reset for every style substrate. modern-normalize = normalize + the universal
 * `box-sizing: border-box` rule that Bootstrap Reboot, Tailwind Preflight and every modern reset
 * agree on. Imported from the local dependency, not a CDN.
 *
 * It resets browser inconsistencies only. The *opinions* — paragraph/heading/list margins, body
 * typography — belong to whichever theme wants them (see kennisnet/_reboot.scss).
 */
import 'modern-normalize/modern-normalize.css';
import '../packages/qti-theme/src/item.css';
import './themes.css';
// The single QTI theme, inlined into the preview document so every story is themed. This replaces
// the old multi-substrate switcher (one theme now — see the theme-architecture pivot); a story that
// scopes its own brand adopts its stylesheets into its own shadow instead (see kennisnet.stories.ts).
import customElements from '../custom-elements.json';
import { toBePositionedRelativeTo } from '../tools/testing/setup/toBePositionedRelativeTo';
import { baselineOverlayDecorator, baselineOverlayGlobalTypes } from './extensions/baseline-overlay';
import { webComponentInspectDecorator, webComponentInspectGlobalTypes } from './extensions/webcomponent-inspect';
import '../packages/qti-components/src';

import type { Preview } from '@storybook/web-components-vite';

export const loaders = [mswLoader(mswSetup)];

export const customViewports = {
  default: {
    name: 'Default',
    styles: {
      width: '412px',
      height: '780px'
    }
  },
  phone: {
    name: 'Phone',
    styles: {
      width: '412px',
      height: '780px'
    }
  },
  laptop: {
    name: 'Laptop',
    styles: {
      width: '1257px',
      height: '598px'
    }
  },
  vrtBaseline: {
    name: 'VRT baseline',
    styles: {
      width: '960px',
      height: '900px'
    }
  }
};

const options: StorybookHelpersOptions = {
  /** hides the `arg ref` label on each control */
  hideArgRef: true,
  /** sets the custom type reference in the Custom Elements Manifest */
  typeRef: 'expandedType',
  /** Adds a <script> tag where a `component` variable will reference the story's component */
  setComponentVariable: false,
  /** renders default values for attributes and CSS properties */
  renderDefaultValues: false,
  categoryOrder: ['attributes', 'properties', 'slots', 'cssParts', 'cssStates', 'cssProps', 'events', 'methods']
};

setStorybookHelpersConfig(options);

expect.extend({ toBePositionedRelativeTo });

setCustomElementsManifest(customElements);

const preview: Preview = {
  decorators: [
    /*
     * The theme presets in the toolbar. Each sets `data-qti-theme` on <html>; themes.css gives each
     * value its tier-1 tokens, and the theme re-derives everything else there. `default` sets
     * nothing, so every story and test renders as a host with no configuration would. The Kennisnet
     * VRT suite does not depend on this: it adopts kennisnet.css into its own item shadows.
     */
    withThemeByDataAttribute({
      themes: {
        Default: 'default',
        Light: 'light',
        Dark: 'dark',
        Kennisnet: 'kennisnet',
        Cito: 'cito',
        Playful: 'playful',
        Soft: 'soft'
      },
      defaultTheme: 'Default',
      attributeName: 'data-qti-theme'
    }),
    baselineOverlayDecorator,
    webComponentInspectDecorator
  ],

  parameters: {
    docs: {
      toc: true,
      codePanel: true,
      source: {
        /* FIXME EVENTUALLY https://github.com/storybookjs/storybook/issues/8078#issuecomment-2325332120 */
        transform: (input: any) =>
          prettier.format(input, {
            parser: 'html',
            plugins: [HTMLParser],
            printWidth: 140,
            htmlWhitespaceSensitivity: 'ignore'
          })
      }
    },

    viewport: { options: customViewports },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i
      }
    },

    options: {
      storySort: {
        method: 'alphabetical',
        // Sidebar order = reading order; 'Testing' is last.
        order: [
          'Introduction',
          'Getting started',
          'Implementation',
          ['Build a player', 'Theming', 'State', 'Cookbook'],
          'QTI Test',
          [
            'Overview',
            'Navigation',
            'Examples',
            'Persist and restore',
            'Plugins',
            ['Text to speech', 'Bookmark', 'Print', 'Scoring', 'Stamp', 'View'],
            'Building blocks'
          ],
          'QTI Item',
          'Interactions',
          // Each interaction is a folder: its Overview first, then the evidence topics (Choice is the
          // reference). Written out because Storybook reads storySort statically. A new interaction sorts
          // alphabetically after these.
          [
            'Evidence',
            'Choice',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Text Entry',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Extended Text',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Inline Choice',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Match',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Order',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Gap Match',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Associate',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Hot Text',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Hotspot',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Graphic Order',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Graphic Associate',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Graphic Gap Match',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Select Point',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Position Object',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Slider',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Media',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Upload',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'End Attempt',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Portable Custom Interaction',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ],
            'Custom',
            [
              'Overview',
              'Accessibility',
              'API',
              'Behavior',
              'Configuration',
              'Config Context',
              'DOM Manipulation',
              'Forms',
              'Theming',
              'Validation',
              'Vocabulary'
            ]
          ],
          'Corrections',
          ['Kennisnet'],
          'Extending QTI',
          ['Creating an extended interaction', 'Creating a plugin', 'Public API'],
          'API Reference',
          'Testing'
        ]
      }
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      // CLI Vitest runs define QTI_A11Y_TEST as 'off' (see vitest.config.ts): 'todo' never fails a
      // run, yet axe after every story costs ~15% of the suite. Storybook dev and its Vitest panel
      // leave it undefined and keep 'todo'.
      test: import.meta.env.QTI_A11Y_TEST ?? 'todo'
    }
  },

  globalTypes: {
    ...baselineOverlayGlobalTypes,
    ...webComponentInspectGlobalTypes
  },

  tags: ['!autodocs']
};

export default preview;
