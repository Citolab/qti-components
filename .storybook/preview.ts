import { setCustomElementsManifest } from '@storybook/web-components-vite';
import { setStorybookHelpersConfig, type StorybookHelpersOptions } from '@wc-toolkit/storybook-helpers';
import prettier from 'prettier-v2'; /* https://github.com/storybookjs/storybook/issues/8078#issuecomment-2325332120 */
import HTMLParser from 'prettier-v2/parser-html'; /* https://github.com/storybookjs/storybook/issues/8078#issuecomment-2325332120 */
import { expect } from 'storybook/test';
import { withThemeByClassName } from '@storybook/addon-themes';
import { initialize, mswLoader } from 'msw-storybook-addon';

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize({
  onUnhandledRequest: 'bypass'
});
import customElements from '../custom-elements.json';
import { toBePositionedRelativeTo } from '../tools/testing/setup/toBePositionedRelativeTo';
import '../packages/qti-theme/src/item.css';
import kennisnetOverrideHref from '../packages/qti-theme/src/kennisnet-override.scss?url';
import '../packages/qti-components/src';

import type { Preview } from '@storybook/web-components-vite';

export const loaders = [mswLoader];

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

const OVERRIDE_LINK_CLASS = 'qti-vendor-override';
/*
 * Each substrate maps to an ordered list of stylesheet URLs the iframe loads
 * for that choice. Add a new vendor by adding (a) an entry here and (b) an
 * item in the `globalTypes.override.toolbar.items` array below.
 *
 * - citolab: minimal normalize, no opinionated reset.
 * - kennisnet: single self-contained file — pulls Bootstrap + Wikiwijs bridge +
 *   FontAwesome glyph CDN URLs internally (see kennisnet-override.scss).
 */
const OVERRIDE_STYLESHEETS: Record<string, string[]> = {
  citolab: ['https://cdn.jsdelivr.net/npm/normalize.css@8.0.1/normalize.css'],
  kennisnet: [kennisnetOverrideHref]
};

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light-theme',
        dark: 'dark-theme'
      },
      defaultTheme: 'light'
    }),
    (story, context) => {
      const choice = context.globals.override as string | undefined;
      const wantHrefs = (choice && OVERRIDE_STYLESHEETS[choice]) || [];
      const existing = Array.from(document.getElementsByClassName(OVERRIDE_LINK_CLASS)) as HTMLLinkElement[];
      const existingHrefs = existing.map(l => l.getAttribute('href'));
      const wantSet = new Set(wantHrefs);
      // Drop links no longer wanted.
      for (const link of existing) {
        if (!wantSet.has(link.getAttribute('href') || '')) link.remove();
      }
      // Add links not yet present, preserving order so the cascade stays predictable.
      for (const href of wantHrefs) {
        if (existingHrefs.includes(href)) continue;
        const link = document.createElement('link');
        link.className = OVERRIDE_LINK_CLASS;
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
      return story();
    }
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
      storySort: { method: 'alphabetical' }
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },

  globalTypes: {
    override: {
      name: 'Override',
      description: 'Choose which vendor substrate (reset + overrides) layers under the qti-theme baseline',
      defaultValue: 'citolab',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'citolab', title: 'Citolab' },
          { value: 'kennisnet', title: 'Kennisnet' }
        ],
        dynamicTitle: true
      }
    }
  },

  tags: ['!autodocs']
};

export default preview;
