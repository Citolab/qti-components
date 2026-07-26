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
/*
 * Shared CSS reset for every style substrate. modern-normalize = normalize + the universal
 * `box-sizing: border-box` rule that Bootstrap Reboot, Tailwind Preflight and every modern reset
 * agree on. Imported from the local dependency, not a CDN.
 *
 * It resets browser inconsistencies only. The *opinions* — paragraph/heading/list margins, body
 * typography — belong to whichever theme wants them (see kennisnet/_reboot.scss).
 */
import 'modern-normalize/modern-normalize.css';
// The single QTI theme, inlined into the preview document so every story is themed. This replaces
// the old multi-substrate switcher (one theme now — see the theme-architecture pivot); a story that
// scopes its own brand adopts its stylesheets into its own shadow instead (see kennisnet.stories.ts).
import itemCss from '../packages/qti-theme/src/item.css?inline';
import customElements from '../custom-elements.json';
import { toBePositionedRelativeTo } from '../tools/testing/setup/toBePositionedRelativeTo';
import { baselineOverlayDecorator, baselineOverlayGlobalTypes } from './extensions/baseline-overlay';
import { webComponentInspectDecorator, webComponentInspectGlobalTypes } from './extensions/webcomponent-inspect';
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

// Put the theme first in <head> so the reset/normalize imported above still wins where it should,
// mirroring how the old substrate loader injected it. One <style>, once, for the whole preview.
const qtiThemeStyle = document.createElement('style');
qtiThemeStyle.id = 'qti-theme-style';
qtiThemeStyle.textContent = itemCss;
document.head.insertBefore(qtiThemeStyle, document.head.firstChild);

const preview: Preview = {
  decorators: [
    /*
     * One class-based theme axis. `withThemeByClassName` applies the theme class to <html>. `light`
     * is the neutral default (a chip is a bordered box); `dark` is its dark counterpart. The
     * Kennisnet brand is NOT a global theme here — it is a brand overlay adopted straight into the
     * item shadow by its own story (apps/e2e/src/stories/kennisnet/kennisnet.stories.ts).
     */
    withThemeByClassName({
      themes: {
        light: 'light-theme',
        dark: 'dark-theme'
      },
      defaultTheme: 'light'
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
    ...baselineOverlayGlobalTypes,
    ...webComponentInspectGlobalTypes
  },

  tags: ['!autodocs']
};

export default preview;
