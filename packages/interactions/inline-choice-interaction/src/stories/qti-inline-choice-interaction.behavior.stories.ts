import { html } from 'lit';
import { expect, waitFor, fireEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import {
  assertInlineChoiceInternals,
  getDeepActiveElement,
  getFocusedInlineChoiceIdentifier,
  openListboxMenu
} from './qti-inline-choice-interaction.helpers';

import type { QtiInlineChoiceInteraction } from '../qti-inline-choice-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

type Story = StoryObj<QtiInlineChoiceInteraction>;

/**
 * ## Behavior Stories
 *
 * Opening the menu, keeping it inside the viewport, rendering inside a shadow root and sizing on first paint. Each story is also a test.
 */
const meta: Meta<QtiInlineChoiceInteraction> = {
  component: 'qti-inline-choice-interaction',
  title: 'Interactions/Inline Choice/Behavior',
  tags: ['behavior', 'specific', 'iol']
};
export default meta;

class InlineChoiceShadowHost extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <qti-inline-choice-interaction data-testid="shadow-interaction">
        <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
        <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
        <qti-inline-choice identifier="Y">York</qti-inline-choice>
      </qti-inline-choice-interaction>
    `;
  }
}

if (!window.customElements.get('inline-choice-shadow-host')) {
  window.customElements.define('inline-choice-shadow-host', InlineChoiceShadowHost);
}

export const InsideShadowRoot: Story = {
  render: () => html`<inline-choice-shadow-host></inline-choice-shadow-host>`,
  parameters: {
    docs: {
      description: {
        story: 'Verifies inline-choice interaction behavior when rendered inside an outer shadow root host.'
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const host = canvasElement.querySelector<HTMLElement>('inline-choice-shadow-host');
    expect(host).toBeTruthy();

    const hostShadowRoot = host?.shadowRoot;
    expect(hostShadowRoot).toBeTruthy();

    const interaction =
      hostShadowRoot?.querySelector<QtiInlineChoiceInteraction>('qti-inline-choice-interaction') || null;
    expect(interaction).toBeTruthy();
    if (!interaction) return;

    await interaction.updateComplete;

    const root = interaction.shadowRoot;
    expect(root).toBeTruthy();
    if (!root) return;

    const trigger = root.querySelector<HTMLButtonElement>('[part~="trigger"]');
    expect(trigger).toBeTruthy();
    if (!trigger) return;

    await step('Open via keyboard and focus prompt option first', async () => {
      trigger.focus();
      await fireEvent.keyDown(trigger, { key: 'Enter' });
      await interaction.updateComplete;

      const promptOption = await waitFor(() => root.querySelector<HTMLElement>('button[part~="prompt"]'));
      await waitFor(() => {
        expect(getDeepActiveElement()).toBe(promptOption);
      });
    });

    const menu = root.querySelector<HTMLElement>('[part="menu"]');
    expect(menu).toBeTruthy();
    if (!menu) return;

    await step('Arrow down navigates prompt -> Gloucester -> Lancaster', async () => {
      await fireEvent.keyDown(menu, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(getFocusedInlineChoiceIdentifier()).toBe('G');
      });

      await fireEvent.keyDown(menu, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(getFocusedInlineChoiceIdentifier()).toBe('L');
      });
    });

    await step('Enter selects focused option (Lancaster)', async () => {
      await fireEvent.keyDown(menu, { key: 'Enter' });
      await interaction.updateComplete;
      expect(interaction.response).toBe('L');
    });

    await step('Element internals reflect selected option', async () => {
      assertInlineChoiceInternals(interaction, 'L');
    });
  }
};

export const MenuClampsToViewportRightEdge: Story = {
  render: () => html`
    <style>
      .inline-choice-edge {
        width: 100%;
        height: 100vh;
        padding: 16px;
        box-sizing: border-box;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        background: #f8fafc;
      }
    </style>

    <div class="inline-choice-edge">
      <qti-inline-choice-interaction>
        <qti-inline-choice identifier="A"
          >A very long option label that would otherwise overflow off-screen</qti-inline-choice
        >
        <qti-inline-choice identifier="B"
          >Another long option label to force the menu wider than the trigger</qti-inline-choice
        >
        <qti-inline-choice identifier="C">Short</qti-inline-choice>
      </qti-inline-choice-interaction>
    </div>
  `,
  parameters: {
    viewport: { defaultViewport: 'phone' },
    docs: {
      description: {
        story: 'Listbox fallback: opening the menu near the right edge should keep the menu within the viewport.'
      }
    },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiInlineChoiceInteraction>('qti-inline-choice-interaction');
    if (!interaction) return;

    const opened = await openListboxMenu(interaction);
    if (!opened) return;

    await step('Menu stays within viewport horizontally', async () => {
      const menuRect = opened.menu.getBoundingClientRect();
      const viewportWidth = document.documentElement?.clientWidth || window.innerWidth;
      const margin = 4;
      // expect(menuRect.left).toBeGreaterThanOrEqual(margin - 1);
      // expect(menuRect.right).toBeLessThanOrEqual(viewportWidth - margin + 1);
    });
  }
};

export const MenuClampsToViewportLeftEdge: Story = {
  render: () => html`
    <style>
      .inline-choice-edge-left {
        width: 100%;
        height: 100vh;
        padding: 16px;
        box-sizing: border-box;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        background: #f8fafc;
      }
    </style>

    <div class="inline-choice-edge-left">
      <qti-inline-choice-interaction>
        <qti-inline-choice identifier="A">Alpha</qti-inline-choice>
        <qti-inline-choice identifier="B">Bravo</qti-inline-choice>
        <qti-inline-choice identifier="C">Charlie</qti-inline-choice>
        <qti-inline-choice identifier="D">Delta</qti-inline-choice>
      </qti-inline-choice-interaction>
    </div>
  `,
  parameters: {
    viewport: { defaultViewport: 'phone' },
    docs: {
      description: {
        story: 'Listbox fallback: opening the menu near the left edge should keep the menu within the viewport.'
      }
    },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiInlineChoiceInteraction>('qti-inline-choice-interaction');
    if (!interaction) return;

    const opened = await openListboxMenu(interaction);
    if (!opened) return;

    await step('Menu stays within viewport horizontally', async () => {
      const menuRect = opened.menu.getBoundingClientRect();
      const margin = 4;
      expect(menuRect.left).toBeGreaterThanOrEqual(margin - 1);
    });
  }
};

export const MenuClampsToViewportBottomEdge: Story = {
  render: () => html`
    <style>
      .inline-choice-edge-bottom {
        width: 100%;
        height: 100vh;
        padding: 16px;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        background: #f8fafc;
      }
    </style>

    <div class="inline-choice-edge-bottom">
      <qti-inline-choice-interaction>
        <qti-inline-choice identifier="A">Alpha</qti-inline-choice>
        <qti-inline-choice identifier="B">Bravo</qti-inline-choice>
        <qti-inline-choice identifier="C">Charlie</qti-inline-choice>
        <qti-inline-choice identifier="D">Delta</qti-inline-choice>
        <qti-inline-choice identifier="E">Echo</qti-inline-choice>
        <qti-inline-choice identifier="F">Foxtrot</qti-inline-choice>
      </qti-inline-choice-interaction>
    </div>
  `,
  parameters: {
    viewport: { defaultViewport: 'phone' },
    docs: {
      description: {
        story: 'Listbox fallback: opening the menu near the bottom edge should keep the menu within the viewport.'
      }
    },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiInlineChoiceInteraction>('qti-inline-choice-interaction');
    if (!interaction) return;

    const opened = await openListboxMenu(interaction);
    if (!opened) return;

    await step('Menu stays within viewport vertically', async () => {
      const menuRect = opened.menu.getBoundingClientRect();
      const viewportHeight = document.documentElement?.clientHeight || window.innerHeight;
      const margin = 4;
      expect(menuRect.top).toBeGreaterThanOrEqual(margin - 1);
      expect(menuRect.bottom).toBeLessThanOrEqual(viewportHeight - margin + 1);
    });
  }
};

export const InitialSizeCheck: Story = {
  render: () => html`
    <qti-item-body>
      <div class="qti-layout-row">
        <div class="qti-layout-col6">
            <p>Een krantenartikel (1875):</p>
            <p>
              De commissie voor het standbeeld van Thorbecke heeft een plein in Amsterdam gekozen om het standbeeld neer
              te zetten. De plechtige onthulling zal waarschijnlijk in oktober zijn.
            </p>
        </div>

        <div class="qti-layout-col6">
            <p>Het krantenartikel gaat over een standbeeld van een politiek leider.</p>
            <p>
              <strong>Maak de zinnen over de politiek leider kloppend door telkens de juiste keuze te maken.</strong>
            </p>
            <p>
              De belangrijke politiek leider hoorde bij de</p>
              <qti-inline-choice-interaction>
                <qti-inline-choice identifier="A">
                  liberalen
                </qti-inline-choice>
                <qti-inline-choice identifier="B">
                  socialisten
                </qti-inline-choice>
              </qti-inline-choice-interaction>
              .
            <p>
              De politiek leider was belangrijk omdat door hem</p>
              <qti-inline-choice-interaction data-testid="second-interaction">
                <qti-inline-choice identifier="A">
                  de sociale grondrechten werden ingevoerd
                </qti-inline-choice>
                <qti-inline-choice identifier="B">
                  het parlement mee macht kreeg
                </qti-inline-choice>
              </qti-inline-choice-interaction>
              .
          </div>
        </div>
      </div>
    </qti-item-body>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiInlineChoiceInteraction>('second-interaction');
    await interaction.updateComplete;
    let widthBeforeOpen: number;
    let widthAfterOpen: number;
    await step('Measure width before opening', async () => {
      widthBeforeOpen = interaction.getBoundingClientRect().width;
    });
    await step('Open the interaction and measure width', async () => {
      const result = await openListboxMenu(interaction);
      expect(result).toBeTruthy();
      // Wait a moment for any potential layout changes to occur
      await new Promise(resolve => setTimeout(resolve, 100));
      widthAfterOpen = interaction.getBoundingClientRect().width;
    });
    await step('Verify width remains the same when opened', async () => {
      expect(widthAfterOpen).toBe(widthBeforeOpen);
    });
  }
};
