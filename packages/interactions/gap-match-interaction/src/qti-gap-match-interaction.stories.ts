import { action } from 'storybook/actions';
import { expect, fn, waitFor } from 'storybook/test';
// Dropped chips land in the qti-gap's shadow root; light-DOM textContent/querySelector can't see
// them, so use shadow-piercing queries to assert placement.
import { within, deepQuerySelector, deepQuerySelectorAll } from 'shadow-dom-testing-library';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import { getItemByUri } from '@qti-components/loader';

import drag from '../../../../tools/testing/drag';

import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiGapText } from '@qti-components/interactions-core/elements/qti-gap-text';
import type { QtiGapMatchInteraction } from './qti-gap-match-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-gap-match-interaction', {
  excludeCategories: ['methods', 'events', 'properties']
});

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
  tags: ['autodocs', 'iol']
};
export default meta;

const settleInteraction = async (interaction: QtiGapMatchInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getGap = (interaction: QtiGapMatchInteraction, identifier: string) =>
  interaction.querySelector(`qti-gap[identifier="${identifier}"]`) as HTMLElement;

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
    <qti-gap-match-interaction data-testid="gap-match-interaction" response-identifier="RESPONSE" max-associations="3">
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

        expect((await within(gap1).findAllByShadowText('winter')).length).toBeGreaterThan(0);
        expect((await within(gap2).findAllByShadowText('spring')).length).toBeGreaterThan(0);
        expect((await within(gap3).findAllByShadowText('summer')).length).toBeGreaterThan(0);
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['W G1', 'Sp G2', 'Su G3']);
      });

      await step('Drag placed winter from G1 onto occupied G2 to trigger sortable swap', async () => {
        const placedWinter = deepQuerySelector(getGap(interaction, 'G1'), '[identifier="W"]') as HTMLElement;
        await drag(placedWinter, { to: gap2, duration: 300 });
        await settleInteraction(interaction);

        expect((await within(gap1).findAllByShadowText('spring')).length).toBeGreaterThan(0);
        expect((await within(gap2).findAllByShadowText('winter')).length).toBeGreaterThan(0);
        expect((await within(gap3).findAllByShadowText('summer')).length).toBeGreaterThan(0);
      });

      await step('Response and associations are updated after swap', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['Sp G1', 'W G2', 'Su G3']);
        expect(deepQuerySelectorAll(getGap(interaction, 'G1'), '[qti-draggable="true"]').length).toBe(1);
        expect(deepQuerySelectorAll(getGap(interaction, 'G2'), '[qti-draggable="true"]').length).toBe(1);
        expect(deepQuerySelectorAll(getGap(interaction, 'G3'), '[qti-draggable="true"]').length).toBe(1);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const SortableSwapPartialGaps: Story = {
  name: 'Behavior: sortable swap with one gap still empty',
  render: () => html`
    <qti-gap-match-interaction data-testid="gap-match-interaction" response-identifier="RESPONSE" max-associations="3">
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

        expect((await within(gap1).findAllByShadowText('winter')).length).toBeGreaterThan(0);
        expect((await within(gap2).findAllByShadowText('spring')).length).toBeGreaterThan(0);
        expect(within(gap3).queryAllByShadowText('summer')).toHaveLength(0);
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['W G1', 'Sp G2']);
      });

      await step('Drag placed winter onto occupied G2 to swap with spring', async () => {
        const placedWinter = deepQuerySelector(getGap(interaction, 'G1'), '[identifier="W"]') as HTMLElement;
        await drag(placedWinter, { to: gap2, duration: 300 });
        await settleInteraction(interaction);

        expect((await within(gap1).findAllByShadowText('spring')).length).toBeGreaterThan(0);
        expect((await within(gap2).findAllByShadowText('winter')).length).toBeGreaterThan(0);
        expect(within(gap3).queryAllByShadowText('summer')).toHaveLength(0);
      });

      await step('Response remains partial and reflects swapped assignments', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['Sp G1', 'W G2']);
        expect(deepQuerySelectorAll(getGap(interaction, 'G1'), '[qti-draggable="true"]').length).toBe(1);
        expect(deepQuerySelectorAll(getGap(interaction, 'G2'), '[qti-draggable="true"]').length).toBe(1);
        expect(deepQuerySelectorAll(getGap(interaction, 'G3'), '[qti-draggable="true"]').length).toBe(0);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const SortableAppendWhenGapAllowsMultiple: Story = {
  name: 'Behavior: sortable move appends on occupied gap when match-max > 1',
  render: () => html`
    <qti-gap-match-interaction data-testid="gap-match-interaction" response-identifier="RESPONSE" max-associations="4">
      <qti-prompt>Append into an occupied multi-capacity gap.</qti-prompt>
      <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text>
      <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text>
      <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text>
      <blockquote>
        <p>
          <qti-gap identifier="G1" match-max="1"></qti-gap>
          <qti-gap identifier="G2" match-max="2"></qti-gap>
          <qti-gap identifier="G3" match-max="1"></qti-gap>
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
      await step('Place winter in G1 and spring in G2', async () => {
        await drag(winter, { to: gap1, duration: 300 });
        await settleInteraction(interaction);
        await drag(spring, { to: gap2, duration: 300 });
        await settleInteraction(interaction);

        expect((await within(gap1).findAllByShadowText('winter')).length).toBeGreaterThan(0);
        expect((await within(gap2).findAllByShadowText('spring')).length).toBeGreaterThan(0);
        expect(deepQuerySelectorAll(gap2, '[qti-draggable="true"]').length).toBe(1);
      });

      await step('Move winter from G1 onto occupied G2 to append (no swap-out)', async () => {
        const placedWinter = deepQuerySelector(getGap(interaction, 'G1'), '[identifier="W"]') as HTMLElement;
        await drag(placedWinter, { to: gap2, duration: 300 });
        await settleInteraction(interaction);

        expect(within(gap1).queryAllByShadowText('winter')).toHaveLength(0);
        expect((await within(gap2).findAllByShadowText('winter')).length).toBeGreaterThan(0);
        expect((await within(gap2).findAllByShadowText('spring')).length).toBeGreaterThan(0);
        expect(deepQuerySelectorAll(gap2, '[qti-draggable="true"]').length).toBe(2);
        expect(deepQuerySelectorAll(gap3, '[qti-draggable="true"]').length).toBe(0);
      });

      await step('Response reflects both associations on G2', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response ?? [];
        const sorted = [...lastResponse].sort();
        expect(sorted).toEqual(['Sp G2', 'W G2']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const SortableAppendBlockedAtGapMatchMax: Story = {
  name: 'Behavior: sortable append blocks when occupied gap reached match-max',
  render: () => html`
    <qti-gap-match-interaction data-testid="gap-match-interaction" response-identifier="RESPONSE" max-associations="4">
      <qti-prompt>Block append into a full multi-capacity gap.</qti-prompt>
      <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text>
      <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text>
      <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text>
      <blockquote>
        <p>
          <qti-gap identifier="G1" match-max="1"></qti-gap>
          <qti-gap identifier="G2" match-max="2"></qti-gap>
          <qti-gap identifier="G3" match-max="1"></qti-gap>
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

    const callback = fn((event: CustomEvent<{ response: string[] }>) => event.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Fill G2 to capacity and keep winter in G1', async () => {
        await drag(winter, { to: gap1, duration: 300 });
        await settleInteraction(interaction);
        await drag(spring, { to: gap2, duration: 300 });
        await settleInteraction(interaction);
        await drag(summer, { to: gap2, duration: 300 });
        await settleInteraction(interaction);

        expect(deepQuerySelectorAll(gap2, '[qti-draggable="true"]').length).toBe(2);
      });

      await step('Move winter from G1 onto full G2; drop should be blocked', async () => {
        const placedWinter = deepQuerySelector(getGap(interaction, 'G1'), '[identifier="W"]') as HTMLElement;
        await drag(placedWinter, { to: gap2, duration: 300 });
        await settleInteraction(interaction);

        expect((await within(gap1).findAllByShadowText('winter')).length).toBeGreaterThan(0);
        expect(deepQuerySelectorAll(gap2, '[qti-draggable="true"]').length).toBe(2);
        expect((await within(gap2).findAllByShadowText('spring')).length).toBeGreaterThan(0);
        expect((await within(gap2).findAllByShadowText('summer')).length).toBeGreaterThan(0);
      });

      await step('Response remains unchanged after blocked append attempt', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response ?? [];
        const sorted = [...lastResponse].sort();
        expect(sorted).toEqual(['Sp G2', 'Su G2', 'W G1']);
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

    // check if the first dragged value is in the gap (chip lives in the gap's shadow root)
    expect((await within(gapG1).findAllByShadowText('winter')).length).toBeGreaterThan(0);
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
    const gapTextWinter = assessmentItem.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;
    const gapG1 = assessmentItem.querySelector('qti-gap[identifier="G1"]') as QtiGapText;
    const qtiGapMatchInteraction = assessmentItem.querySelector('qti-gap-match-interaction') as QtiGapMatchInteraction;

    await step('dragging a choice puts the interaction in the dropzone-active state', async () => {
      // State, not CSS: while a choice is in flight the interaction exposes the `dragzone-active`
      // custom state (see drag-drop-core.mixin), and the theme is free to paint that state however it
      // likes — a border, a background, an outline. Asserting the STATE keeps this test valid across
      // restyles of the drop indication (e.g. the drop-highlight border→background change) instead of
      // pinning it to a specific computed colour.
      const dragging = drag(gapTextWinter, { to: gapG1, duration: 400 });
      await waitFor(() => expect(qtiGapMatchInteraction.matches(':state(dragzone-active)')).toBe(true));
      await dragging;

      // The transient drop-indication state clears once the drop completes.
      expect(qtiGapMatchInteraction.matches(':state(dragzone-active)')).toBe(false);
      // …and the choice landed in the gap (chip lives in the gap's shadow root).
      expect((await within(gapG1).findAllByShadowText('winter')).length).toBeGreaterThan(0);
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
