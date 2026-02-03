import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect } from 'storybook/test';

import type { QtiInlineChoiceInteraction } from './qti-inline-choice-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-inline-choice-interaction');

type Story = StoryObj<QtiInlineChoiceInteraction & typeof args>;

/**
 *
 * ### [3.2.8 Inline Choice Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.y2th8rh73267)
 * an inline interaction that presents the user with a set of choices, each of which is an answer option (usually text). The candidate's task is to select one of the choices.
 *
 */
const meta: Meta<QtiInlineChoiceInteraction> = {
  component: 'qti-inline-choice-interaction',
  title: '08 Inline Choice',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const Default: Story = {
  render: args =>
    template(
      args,
      html` <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
        <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
        <qti-inline-choice identifier="Y">York</qti-inline-choice>`
    )
};

export const DataPrompt: Story = {
  render: Default.render,
  args: {
    dataPrompt: 'Select the correct answer'
  }
};

export const WithImages: Story = {
  render: () => html`
    <style>
      .inline-choice-icons img {
        width: 16px;
        height: 16px;
      }
    </style>
    <div class="inline-choice-icons">
      <qti-inline-choice-interaction>
        <qti-inline-choice identifier="G">
          <img
            alt=""
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='7' fill='%230ea5e9'/%3E%3C/svg%3E"
          />
          Gloucester
        </qti-inline-choice>
        <qti-inline-choice identifier="L">
          <img
            alt=""
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect x='1' y='1' width='14' height='14' rx='3' fill='%2322c55e'/%3E%3C/svg%3E"
          />
          Lancaster
        </qti-inline-choice>
        <qti-inline-choice identifier="Y">
          <img
            alt=""
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='M8 1l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L.8 6.3l5-.7L8 1z' fill='%23f59e0b'/%3E%3C/svg%3E"
          />
          York
        </qti-inline-choice>
      </qti-inline-choice-interaction>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates rich content (icons/images) inside inline choice options.'
      }
    }
  }
};

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

export const InlineInText: Story = {
  render: args => html`
    <style>
      .inline-choice-story {
        font-size: 18px;
        line-height: 1.6;
      }

      .inline-choice-story qti-inline-choice-interaction {
        margin: 0 0.25rem;
      }
    </style>

    <div class="inline-choice-story">
      <p>
        Select the correct city:
        ${template(
          args,
          html`
            <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
            <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
            <qti-inline-choice identifier="Y">York</qti-inline-choice>
          `
        )}
        is in the north of England.
      </p>
    </div>
  `,
  parameters: {
    viewport: { defaultViewport: 'phone' },
    docs: {
      description: {
        story:
          'Baseline story for inline choice used inside running text (no transforms, no nested scrolling containers).'
      }
    }
  }
};

export const InlineInTextScaledAndScrollable: Story = {
  render: () => html`
    <style>
      .inline-choice-viewport {
        width: 412px;
        height: 780px;
        overflow: auto;
        border: 1px solid #d1d5db;
        background: white;
      }

      .inline-choice-scaled {
        width: 820px;
        padding: 16px;
        transform: scale(0.5);
        transform-origin: top left;
      }

      .inline-choice-scaled p {
        font-size: 18px;
        line-height: 1.6;
        margin: 0 0 24px;
      }

      .inline-choice-scaled qti-inline-choice-interaction {
        margin: 0 0.25rem;
      }
    </style>

    <div class="inline-choice-viewport">
      <div class="inline-choice-scaled">
        <p>
          This story intentionally wraps the interaction in a scaled (transform: scale(...)) container and forces a
          scrollable viewport. On some mobile browsers, native select popups can appear with a tiny font and/or at the
          wrong screen position when a parent is transformed.
        </p>

        <p>
          Scroll a bit, then open the dropdown:
          <qti-inline-choice-interaction>
            <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
            <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
            <qti-inline-choice identifier="Y">York</qti-inline-choice>
          </qti-inline-choice-interaction>
          .
        </p>

        <div style="height: 900px"></div>

        <p>
          Open this dropdown near the bottom of a scrolled page:
          <qti-inline-choice-interaction>
            <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
            <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
            <qti-inline-choice identifier="Y">York</qti-inline-choice>
          </qti-inline-choice-interaction>
          .
        </p>
      </div>
    </div>
  `,
  parameters: {
    viewport: { defaultViewport: 'phone' },
    docs: {
      description: {
        story:
          'Regression repro: transformed/scaled parent + nested scrolling. Depending on browser support, this interaction uses either the customizable `<select>` (appearance: base-select) or the fallback DOM listbox.'
      }
    },
    chromatic: { disableSnapshot: true }
  }
};

export const InlineInTextScaledAndScrollableFixed: Story = {
  render: () => html`
    <style>
      .inline-choice-viewport {
        width: 412px;
        height: 780px;
        overflow: auto;
        border: 1px solid #d1d5db;
        background: white;
      }

      .inline-choice-scaled {
        width: 820px;
        padding: 16px;
        transform: scale(0.5);
        transform-origin: top left;
      }

      .inline-choice-scaled p {
        font-size: 18px;
        line-height: 1.6;
        margin: 0 0 24px;
      }

      .inline-choice-scaled qti-inline-choice-interaction {
        margin: 0 0.25rem;
      }
    </style>

    <div class="inline-choice-viewport">
      <div class="inline-choice-scaled">
        <p>
          This story exercises the interaction inside a transformed/scaled + scrollable container. On browsers without
          customizable select support, the component falls back to a DOM-rendered listbox to avoid native-popup quirks.
        </p>

        <p>
          Scroll a bit, then open the dropdown:
          <qti-inline-choice-interaction>
            <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
            <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
            <qti-inline-choice identifier="Y">York</qti-inline-choice>
          </qti-inline-choice-interaction>
          .
        </p>

        <div style="height: 900px"></div>

        <p>
          Open this dropdown near the bottom of a scrolled page:
          <qti-inline-choice-interaction>
            <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
            <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
            <qti-inline-choice identifier="Y">York</qti-inline-choice>
          </qti-inline-choice-interaction>
          .
        </p>
      </div>
    </div>
  `,
  parameters: {
    viewport: { defaultViewport: 'phone' },
    docs: {
      description: {
        story:
          'Fix verification: on browsers without customizable select support, the component uses a DOM-rendered listbox so the menu inherits the correct font size and anchors to the trigger under transforms.'
      }
    },
    chromatic: { disableSnapshot: true }
  }
};
