import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { QtiInlineChoiceInteraction } from '../qti-inline-choice-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { args, template } = getStorybookHelpers('qti-inline-choice-interaction', {
  excludeCategories: ['methods', 'events', 'properties']
});

type Story = StoryObj<QtiInlineChoiceInteraction & typeof args>;

/**
 * ## Config Context Stories
 *
 * Options the host sets on the test or item: the prompt and automatic sizing. Each story is also a test.
 */
const meta: Meta<QtiInlineChoiceInteraction> = {
  component: 'qti-inline-choice-interaction',
  title: 'Interactions/Inline Choice/Config Context',
  tags: ['configuration', 'specific', 'iol']
};
export default meta;

export const WithConfigContext: Story = {
  render: args => html`
    <qti-item>
      ${template(
        args,
        html`
          <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
          <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
        `
      )}
    </qti-item>
  `,
  args: {},
  play: async ({ canvasElement, step }) => {
    const item = canvasElement.querySelector('qti-item')!;
    item.configContext = {
      inlineChoicePrompt: 'Select city'
    };

    const interaction = item.querySelector('qti-inline-choice-interaction')!;
    await interaction.updateComplete;

    await step('Prompt from configContext is displayed', async () => {
      const root = interaction.shadowRoot!;
      const select = root.querySelector<HTMLSelectElement>('select');
      if (select) {
        const firstOption = select.options[0];
        expect(firstOption).toBeDefined();
        expect(firstOption.textContent?.trim()).toBe('Select city');
        return;
      }

      const trigger = root.querySelector<HTMLElement>('[part="trigger"]');
      expect(trigger).toBeDefined();
      expect(trigger?.textContent?.trim()).toContain('Select city');
    });
  }
};

export const WithConfigContextEmpty: Story = {
  render: args => html`
    <qti-item>
      ${template(
        args,
        html`
          <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
          <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
        `
      )}
    </qti-item>
  `,
  args: {},
  play: async ({ canvasElement, step }) => {
    const item = canvasElement.querySelector('qti-item')!;
    item.configContext = {
      inlineChoicePrompt: ' '
    };

    const interaction = item.querySelector('qti-inline-choice-interaction')!;
    await interaction.updateComplete;

    await step('Prompt from configContext is displayed', async () => {
      const root = interaction.shadowRoot!;
      const select = root.querySelector<HTMLSelectElement>('select');
      if (select) {
        const firstOption = select.options[0];
        expect(firstOption).toBeDefined();
        expect(firstOption.textContent?.trim()).toBe('');
        return;
      }

      const trigger = root.querySelector<HTMLElement>('[part="trigger"]');
      expect(trigger).toBeDefined();
      expect(trigger?.textContent?.trim()).toContain('');
    });
  }
};

/**
 * Autosizing is opt-in through `configContext.inlineChoiceAutosize`. With it off (the default) the
 * trigger keeps the theme's base width and a long option is clipped to it; with it on the component
 * measures the widest option and writes the result to `--qti-inline-choice-width` as an inline style
 * ON THE TRIGGER, inside the shadow root, so the closed trigger is already wide enough for whatever
 * the candidate picks. The property is written there rather than on the host so the same mixin works
 * in a ProseMirror document, where an attribute on a light-DOM node is reverted — see
 * MenuAutoSizeMixin.
 *
 * The config is bound declaratively as a property in the template rather than assigned in `play`,
 * and that matters here: the measurement runs from `connectedCallback`, so a context set after the
 * element has connected would arrive too late to size the first render. A lit-html property binding
 * is committed on the detached template clone, before the fragment is inserted, so it lands first.
 */
export const AutosizeViaConfigContext: Story = {
  name: 'Config Wrapper: inlineChoiceAutosize = true',
  render: () => html`
    <p>
      Default (no autosize):
      <qti-inline-choice-interaction data-testid="plain">
        <qti-inline-choice identifier="S">Ely</qti-inline-choice>
        <qti-inline-choice identifier="L">Kingston upon Kingston-upon-Hull</qti-inline-choice>
      </qti-inline-choice-interaction>
    </p>

    <p>
      Autosized:
      <qti-inline-choice-interaction data-testid="autosized" .configContext=${{ inlineChoiceAutosize: true }}>
        <qti-inline-choice identifier="S">Ely</qti-inline-choice>
        <qti-inline-choice identifier="L">Kingston upon Kingston-upon-Hull</qti-inline-choice>
      </qti-inline-choice-interaction>
    </p>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'The interaction measures its widest option and sizes the closed trigger to match, so selecting a long option does not reflow the surrounding text.'
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const plain = canvas.getByTestId<QtiInlineChoiceInteraction>('plain');
    const autosized = canvas.getByTestId<QtiInlineChoiceInteraction>('autosized');

    await plain.updateComplete;
    await autosized.updateComplete;

    // The measured width lands on the trigger in the shadow root, not on the host.
    const triggerOf = (el: QtiInlineChoiceInteraction) =>
      el.shadowRoot?.querySelector<HTMLElement>('button[part="trigger"]');

    await step('Autosized interaction publishes a measured --qti-inline-choice-width', async () => {
      await waitFor(() => {
        const measured = triggerOf(autosized)?.style.getPropertyValue('--qti-inline-choice-width') ?? '';
        expect(measured).toMatch(/^\d+(\.\d+)?px$/);
        expect(parseFloat(measured)).toBeGreaterThan(0);
      });
    });

    await step('Interaction without the config keeps the width unset', async () => {
      expect(triggerOf(plain)?.style.getPropertyValue('--qti-inline-choice-width') ?? '').toBe('');
      // and nothing is written to the host either, by anyone
      expect(plain.style.getPropertyValue('--qti-inline-choice-width')).toBe('');
    });

    await step('Autosizing makes the closed trigger wider than the default', async () => {
      await waitFor(() => {
        expect(autosized.getBoundingClientRect().width).toBeGreaterThan(plain.getBoundingClientRect().width);
      });
    });
  }
};

/**
 * The documented precedence: a `qti-input-width-*` class already sets `--qti-inline-choice-width`
 * from CSS, so the component skips measurement entirely and the class wins — even with autosizing
 * switched on.
 */
export const AutosizeYieldsToWidthClass: Story = {
  name: 'Config Wrapper: inlineChoiceAutosize vs qti-input-width-*',
  render: () => html`
    <p>
      Class wins:
      <qti-inline-choice-interaction
        class="qti-input-width-6"
        data-testid="classed"
        .configContext=${{ inlineChoiceAutosize: true }}
      >
        <qti-inline-choice identifier="S">Ely</qti-inline-choice>
        <qti-inline-choice identifier="L">Kingston upon Kingston-upon-Hull</qti-inline-choice>
      </qti-inline-choice-interaction>
    </p>
  `,
  parameters: {
    docs: {
      description: {
        story: 'A qti-input-width-* class takes precedence: measurement is skipped and no inline width is written.'
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const classed = canvas.getByTestId<QtiInlineChoiceInteraction>('classed');
    await classed.updateComplete;

    await step('No inline width is written when a width class is present', async () => {
      // On the trigger, which is where a measurement would land and where it would out-rank the
      // :host(.qti-input-width-6) rule if one were ever written. Skipping the measurement is what
      // makes the class win; see QtiInlineChoiceInteraction.shouldAutoSizeMenu.
      const trigger = classed.shadowRoot?.querySelector<HTMLElement>('button[part="trigger"]');
      expect(trigger?.style.getPropertyValue('--qti-inline-choice-width') ?? '').toBe('');
      expect(classed.style.getPropertyValue('--qti-inline-choice-width')).toBe('');
    });
  }
};
