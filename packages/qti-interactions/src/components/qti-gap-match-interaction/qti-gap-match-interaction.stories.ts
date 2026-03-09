import { action } from 'storybook/actions';
import { expect, fn } from 'storybook/test';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import { getItemByUri } from '@qti-components/loader';

import drag from '../../../../../tools/testing/drag';

import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiGapText } from '../../elements/qti-gap-text';
import type { QtiGapMatchInteraction } from './qti-gap-match-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-gap-match-interaction');

type Story = StoryObj<QtiGapMatchInteraction & typeof args>;

/**
 *
 * ### [3.2.5 Gap Match Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.7sroqk3xl8e1)
 * a block interaction that contains a number of gaps that the candidate can fill from an associated set of choices.
 *
 */
const meta: Meta<QtiGapMatchInteraction> = {
  component: 'qti-gap-match-interaction',
  title: '05 Gap Match',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs', 'no-tests']
};
export default meta;

const settleInteraction = async (interaction: QtiGapMatchInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getGap = (interaction: QtiGapMatchInteraction, identifier: string) =>
  interaction.querySelector(`qti-gap[identifier="${identifier}"]`) as HTMLElement;

// Compare the RGB values
const rgbIsEqual = (color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }) =>
  color1 && color2 && color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;

// Utility function to convert hex color to RGB
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

// Utility function to convert RGB string to RGB object
function rgbStringToRgb(rgbString) {
  const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgbString);
  return result
    ? {
        r: parseInt(result[1], 10),
        g: parseInt(result[2], 10),
        b: parseInt(result[3], 10)
      }
    : null;
}

export const Default: Story = {
  name: 'qti-gap-match-interaction',
  render: args => {
    return html`
      ${template(
        args,
        html`<qti-prompt>Identify the missing words in this famous quote from Shakespeare's Richard III.</qti-prompt>
          <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text>
          <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text>
          <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text>
          <qti-gap-text identifier="A" match-max="1">autumn</qti-gap-text>
          <blockquote>
            <p>
              Now is the <qti-gap identifier="G1"></qti-gap> of our discontent<br />
              Made glorious <qti-gap identifier="G2"></qti-gap> by this sun of York;<br />
              And all the clouds that lour'd upon our house<br />
              In the deep bosom of the ocean buried.
            </p>
          </blockquote>`
      )}
    `;
  }
};

export const SortableSwapFilledGaps: Story = {
  name: 'Behavior: sortable swap across occupied gaps',
  render: () => html`
    <qti-gap-match-interaction
      data-testid="gap-match-interaction"
      response-identifier="RESPONSE"
      max-associations="3"
    >
      <qti-prompt>Fill and reorder the gaps.</qti-prompt>
      <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text>
      <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text>
      <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text>
      <blockquote>
        <p>
          <qti-gap identifier="G1"></qti-gap>
          <qti-gap identifier="G2"></qti-gap>
          <qti-gap identifier="G3"></qti-gap>
        </p>
      </blockquote>
    </qti-gap-match-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector('[data-testid="gap-match-interaction"]') as QtiGapMatchInteraction;
    await settleInteraction(interaction);

    const winter = interaction.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;
    const spring = interaction.querySelector('qti-gap-text[identifier="Sp"]') as QtiGapText;
    const summer = interaction.querySelector('qti-gap-text[identifier="Su"]') as QtiGapText;
    const gap1 = getGap(interaction, 'G1');
    const gap2 = getGap(interaction, 'G2');
    const gap3 = getGap(interaction, 'G3');

    const callback = fn((event: CustomEvent<{ response: string[] }>) => event.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Place all choices into gaps', async () => {
        await drag(winter, { to: gap1, duration: 300 });
        await settleInteraction(interaction);
        await drag(spring, { to: gap2, duration: 300 });
        await settleInteraction(interaction);
        await drag(summer, { to: gap3, duration: 300 });
        await settleInteraction(interaction);

        expect(gap1).toHaveTextContent('winter');
        expect(gap2).toHaveTextContent('spring');
        expect(gap3).toHaveTextContent('summer');
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['W G1', 'Sp G2', 'Su G3']);
      });

      await step('Drag placed winter from G1 onto occupied G2 to trigger sortable swap', async () => {
        const placedWinter = getGap(interaction, 'G1').querySelector('[identifier="W"]') as HTMLElement;
        await drag(placedWinter, { to: gap2, duration: 300 });
        await settleInteraction(interaction);

        expect(gap1).toHaveTextContent('spring');
        expect(gap2).toHaveTextContent('winter');
        expect(gap3).toHaveTextContent('summer');
      });

      await step('Response and associations are updated after swap', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['Sp G1', 'W G2', 'Su G3']);
        expect(getGap(interaction, 'G1').querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(getGap(interaction, 'G2').querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(getGap(interaction, 'G3').querySelectorAll('[qti-draggable="true"]').length).toBe(1);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const SortableSwapPartialGaps: Story = {
  name: 'Behavior: sortable swap with one gap still empty',
  render: () => html`
    <qti-gap-match-interaction
      data-testid="gap-match-interaction"
      response-identifier="RESPONSE"
      max-associations="3"
    >
      <qti-prompt>Fill some gaps and reorder.</qti-prompt>
      <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text>
      <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text>
      <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text>
      <blockquote>
        <p>
          <qti-gap identifier="G1"></qti-gap>
          <qti-gap identifier="G2"></qti-gap>
          <qti-gap identifier="G3"></qti-gap>
        </p>
      </blockquote>
    </qti-gap-match-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector('[data-testid="gap-match-interaction"]') as QtiGapMatchInteraction;
    await settleInteraction(interaction);

    const winter = interaction.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;
    const spring = interaction.querySelector('qti-gap-text[identifier="Sp"]') as QtiGapText;
    const gap1 = getGap(interaction, 'G1');
    const gap2 = getGap(interaction, 'G2');
    const gap3 = getGap(interaction, 'G3');

    const callback = fn((event: CustomEvent<{ response: string[] }>) => event.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Place only winter and spring; leave G3 empty', async () => {
        await drag(winter, { to: gap1, duration: 300 });
        await settleInteraction(interaction);
        await drag(spring, { to: gap2, duration: 300 });
        await settleInteraction(interaction);

        expect(gap1).toHaveTextContent('winter');
        expect(gap2).toHaveTextContent('spring');
        expect(gap3).not.toHaveTextContent('summer');
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['W G1', 'Sp G2']);
      });

      await step('Drag placed winter onto occupied G2 to swap with spring', async () => {
        const placedWinter = getGap(interaction, 'G1').querySelector('[identifier="W"]') as HTMLElement;
        await drag(placedWinter, { to: gap2, duration: 300 });
        await settleInteraction(interaction);

        expect(gap1).toHaveTextContent('spring');
        expect(gap2).toHaveTextContent('winter');
        expect(gap3).not.toHaveTextContent('summer');
      });

      await step('Response remains partial and reflects swapped assignments', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['Sp G1', 'W G2']);
        expect(getGap(interaction, 'G1').querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(getGap(interaction, 'G2').querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(getGap(interaction, 'G3').querySelectorAll('[qti-draggable="true"]').length).toBe(0);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const DontDropInOtherInteraction = {
  name: 'Not-Allowed-To-Drop-In-Other-Interaction',
  render: (_args, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button
        @click=${() => {
          item?.processResponse();
        }}
      >
        Submit
      </button>
    `;
  },
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').innerHTML = `
      Don't allow to drop a Gap from interaction 1 to interaction 2.
      
      ${assessmentItem.querySelector('qti-prompt').textContent}
    `;
    const interaction1 = assessmentItem.querySelector(`qti-gap-match-interaction[response-identifier='RESPONSE1'`);

    const interaction2 = assessmentItem.querySelector(`qti-gap-match-interaction[response-identifier='RESPONSE2'`);
    const gapTextWinter1 = interaction1.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;
    const dropInteraction1 = interaction1.querySelector('qti-gap[identifier="G2"]') as QtiGapText;

    const dropInteraction2 = interaction2.querySelector('qti-gap[identifier="G1"]') as QtiGapText;
    await step('drag a Gap from interaction 1 to interaction 2', async () => {
      // Simulate the drag and drop operation
      await drag(gapTextWinter1, { to: dropInteraction2, duration: 300 });
    });

    await timeoutPromise(300);
    // check if the first dragged value is in the gap
    expect(dropInteraction2.textContent).toBe('');
    // check if the second dragged value is in the gap
    expect(
      dropInteraction2.shadowRoot.querySelector('qti-gap-text') ||
        dropInteraction2.shadowRoot?.querySelector('qti-gap-text')
    ).toBeFalsy();

    expect(
      dropInteraction1.querySelector('qti-gap-text') || dropInteraction1.shadowRoot?.querySelector('qti-gap-text')
    ).toBeDefined();
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q6/gap-match-sv-1.xml`)
    })
  ]
};

export const CanRedrop: Story = {
  name: 'Can-Redrop-In-Same-Gap',
  render: (_args, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button
        @click=${() => {
          item?.processResponse();
        }}
      >
        Submit
      </button>
    `;
  },
  args: {
    // docsHint: 'Some other value than the default'
  },
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').innerHTML = `
      For gap-match-example-1.xml, each Gap can have at most one choice associated with it.`;

    const gapTextWinter = assessmentItem.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;
    // const gapTextSpring = assessmentItem.querySelector('qti-gap-text[identifier="Sp"]') as QtiGapText;
    // const gapTextSummer = assessmentItem.querySelector('qti-gap-text[identifier="Su"]') as QtiGapText;
    // const gapTextAutumn = assessmentItem.querySelector('qti-gap-text[identifier="A"]') as QtiGapText;

    const gapG1 = assessmentItem.querySelector('qti-gap[identifier="G1"]') as QtiGapText;
    // const gapG2 = assessmentItem.querySelector('qti-gap[identifier="G2"]') as QtiGapText;
    await step('drag Winter to G1', async () => {
      // Simulate the drag and drop operation
      await drag(gapTextWinter, { to: gapG1, duration: 300 });
    });

    await step('drag Winter to G1 again', async () => {
      // Second drag: Pick up and drag within the target
      // Ensure at least 1 pixel of movement
      await drag(gapTextWinter, { delta: { x: 1, y: 1 } });
    });

    // check if the first dragged value is in the gap
    expect(gapG1.textContent).toBe('winter');
    expect(gapG1.hasAttribute('disabled')).toBe(true);
    expect(gapG1.hasAttribute('enable')).toBe(false);
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q6/gap-match-example-1.xml`)
    })
  ]
};

export const DraggableContainerHasDropInDication: Story = {
  name: 'Dropzone-has-drop-indication',
  render: (_args, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button
        @click=${() => {
          item?.processResponse();
        }}
      >
        Submit
      </button>
    `;
  },
  args: {
    // docsHint: 'Some other value than the default'
  },
  play: async ({ canvasElement, step }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').innerHTML = `
      When a draggable is dragged, the dragzone should indicate that it can be dropped`;
    const rootElement = document.documentElement;
    const rootStyles = window.getComputedStyle(rootElement);
    const qtiBorderActive = rootStyles.getPropertyValue('--qti-border-active').trim();
    const gapTextWinter = assessmentItem.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;
    // const gapTextSpring = assessmentItem.querySelector('qti-gap-text[identifier="Sp"]') as QtiGapText;
    // const gapTextSummer = assessmentItem.querySelector('qti-gap-text[identifier="Su"]') as QtiGapText;
    // const gapTextAutumn = assessmentItem.querySelector('qti-gap-text[identifier="A"]') as QtiGapText;

    const gapG1 = assessmentItem.querySelector('qti-gap[identifier="G1"]') as QtiGapText;

    // const gapG2 = assessmentItem.querySelector('qti-gap[identifier="G2"]') as QtiGapText;
    await step('drag Winter to G1', async () => {
      // Simulate the drag and drop operation

      const qtiGapMatchInteraction = assessmentItem.querySelector('qti-gap-match-interaction');
      const slots = qtiGapMatchInteraction.shadowRoot.querySelectorAll('slot');
      const dragsPart = Array.from(slots).find(slot => slot.getAttribute('part') === 'drags');
      // Convert both colors to RGB
      const dragStyles = window.getComputedStyle(dragsPart);
      const borderColorOrg = dragStyles.getPropertyValue('border-color').trim();
      const qtiBorderActiveRgb = rgbStringToRgb(qtiBorderActive) || hexToRgb(qtiBorderActive);

      drag(gapTextWinter, { to: gapG1, duration: 300 }).then(async () => {
        const computedStylesGap1 = window.getComputedStyle(gapG1);
        const borderColorGap1 = computedStylesGap1.getPropertyValue('border-color').trim();
        const borderColorGap1Rgb = rgbStringToRgb(borderColorGap1) || hexToRgb(borderColorGap1);
        expect(rgbIsEqual(qtiBorderActiveRgb, borderColorGap1Rgb)).toBe(true);
        await timeoutPromise(50);

        // Convert both colors to RGB
        const computedStyles = window.getComputedStyle(dragsPart);
        const borderColor = computedStyles.getPropertyValue('border-color').trim();
        expect(borderColor).toBe(borderColorOrg);
      });
      await timeoutPromise(50);
      // Convert both colors to RGB
      const computedStyles = window.getComputedStyle(dragsPart);
      const borderColor = computedStyles.getPropertyValue('border-color').trim();
      const borderColorRgb = rgbStringToRgb(borderColor) || hexToRgb(borderColor);
      expect(rgbIsEqual(qtiBorderActiveRgb, borderColorRgb)).toBe(true);
    });

    // --qti-border-active
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q6/gap-match-example-1-removed.xml`)
    })
  ]
};

const timeoutPromise = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));
