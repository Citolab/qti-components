import { QtiAssessmentItem, QtiGap, QtiGapText } from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect, fireEvent, within } from '@storybook/test';
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getItemByUri } from '../../../../lib/qti-loader';
import drag from 'src/testing/drag';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q-6 Gap Match Interaction'
};
export default meta;

export const Default: Story = {
  name: 'Q6-L2-D1',
  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
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
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').innerHTML = `
      For gap-match-example-1.xml, each Gap can have at most one choice associated with it.
      
      ${assessmentItem.querySelector('qti-prompt').textContent}
    `;

    const gapTextWinter = assessmentItem.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;
    const gapTextSpring = assessmentItem.querySelector('qti-gap-text[identifier="Sp"]') as QtiGapText;
    const gapTextSummer = assessmentItem.querySelector('qti-gap-text[identifier="Su"]') as QtiGapText;
    const gapTextAutumn = assessmentItem.querySelector('qti-gap-text[identifier="A"]') as QtiGapText;

    const gapG1 = assessmentItem.querySelector('qti-gap[identifier="G1"]') as QtiGapText;
    const gapG2 = assessmentItem.querySelector('qti-gap[identifier="G2"]') as QtiGapText;
    await step('drag Winter to G1', async () => {
      // Simulate the drag and drop operation
      await drag(gapTextWinter, { to: gapG1, duration: 300 });
    });
    await step('drag Spring to G1', async () => {
      // Simulate the drag and drop operation
      await drag(gapTextSpring, { to: gapG1, duration: 300 });
    });
    await step('drag Summer to G2', async () => {
      // Simulate the drag and drop operation
      await drag(gapTextSummer, { to: gapG2, duration: 300 });
    });
    await step('drag Autumn to G2', async () => {
      // Simulate the drag and drop operation
      await drag(gapTextAutumn, { to: gapG2, duration: 300 });
    });

    // check if the first dragged value is in the gap
    expect(gapG1.textContent).toBe('winter');
    // check if the second dragged value is in the gap
    expect(gapG2.textContent).toBe('summer');
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-example-1.xml`)
    })
  ]
};

export const D2: Story = {
  name: 'Q6-L2-D2',
  render: Default.render,
  args: {
    // docsHint: 'I9-L1-D1: If the value of the RESPONSE Response Variable is set to NULL or an empty Multiple Container when ending the attempt, the value of the SCORE Outcome Variable is set to 0.'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').textContent = `For gap-match-example-1.xml, uses a scoring template.

        ${assessmentItem.querySelector('qti-prompt').textContent}
        `;

    const gapTextWinter = assessmentItem.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;
    const gapTextSummer = assessmentItem.querySelector('qti-gap-text[identifier="Su"]') as QtiGapText;

    const gapG1 = assessmentItem.querySelector('qti-gap[identifier="G1"]') as QtiGapText;
    const gapG2 = assessmentItem.querySelector('qti-gap[identifier="G2"]') as QtiGapText;

    await fireEvent.click(submitButton);
    let score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    let response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;

    expect(+score, 'SCORE = 0').toBe(0);
    expect(response).toBeNull();

    await step('drag Winter to G1', async () => {
      // Simulate the drag and drop operation
      await drag(gapTextWinter, { to: gapG1, duration: 300 });
    });

    await fireEvent.click(submitButton);
    score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 1').toBe(1);
    expect(JSON.stringify(response)).toBe(JSON.stringify(['W G1']));

    await step('drag Summer to G2', async () => {
      // Simulate the drag and drop operation
      await drag(gapTextSummer, { to: gapG2, duration: 300 });
    });

    await fireEvent.click(submitButton);
    score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 3').toBe(3);
    expect(JSON.stringify(response)).toBe(JSON.stringify(['W G1', 'Su G2']));
    //
    // fireEvent.click(submitButton);
    // expect(+score, 'SCORE = 0').toBe(0);
    // expect(response, 'RESPONSE = NULL').toBe(null);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-example-1.xml`)
    })
  ]
};

export const D3: Story = {
  name: 'Q6-L2-D3',
  render: Default.render,
  args: {
    // docsHint: 'For gap-match-example-2.xml, delivery/presentation systems MUST visually present the Math as equations, not as MathML. The MathML MUST be programmatically available for Assistive Technology.'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('p').textContent =
      `For gap-match-example-2.xml, delivery/presentation systems MUST visually present the Math as equations, not as MathML. The MathML MUST be programmatically available for Assistive Technology.

        ${assessmentItem.querySelector('p').textContent}
        `;
    // const gapTextWinter = assessmentItem.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;
    // const gapTextSummer = assessmentItem.querySelector('qti-gap-text[identifier="Su"]') as QtiGapText;

    // const gapG1 = assessmentItem.querySelector('qti-gap[identifier="G1"]') as QtiGapText;
    // const gapG2 = assessmentItem.querySelector('qti-gap[identifier="G2"]') as QtiGapText;

    // await fireEvent.click(submitButton);
    // let score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    // let response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;

    // expect(+score, 'SCORE = 0').toBe(0);
    // expect(response).toBeNull();

    // await step('drag Winter to G1', async () => {
    //   // Simulate the drag and drop operation
    //   await drag(gapTextWinter, { to: gapG1, duration: 100 });
    // });

    // await fireEvent.click(submitButton);
    // score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    // response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    // expect(+score, 'SCORE = 1').toBe(1);
    // expect(JSON.stringify(response)).toBe(JSON.stringify(['W G1']));

    // await step('drag Summer to G2', async () => {
    //   // Simulate the drag and drop operation
    //   await drag(gapTextSummer, { to: gapG2, duration: 100 });
    // });

    // await fireEvent.click(submitButton);
    // score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    // response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    // expect(+score, 'SCORE = 3').toBe(3);
    // expect(JSON.stringify(response)).toBe(JSON.stringify(['W G1', 'Su G2']));
    //
    // fireEvent.click(submitButton);
    // expect(+score, 'SCORE = 0').toBe(0);
    // expect(response, 'RESPONSE = NULL').toBe(null);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-example-2.xml`)
    })
  ]
};

export const D4: Story = {
  name: 'Q6-L2-D4',
  render: Default.render,
  args: {
    // docsHint: Q6-L2-D4: For gap-match-example-3.xml, delivery/presentation systems MUST score each correct pairing as 1 point with a maximum of 4 points.
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('p').textContent =
      `Q6-L2-D4: For gap-match-example-3.xml, delivery/presentation systems MUST score each correct pairing as 1 point with a maximum of 4 points.

        ${assessmentItem.querySelector('p').textContent}
        `;

    const gapTextS1 = assessmentItem.querySelector('qti-gap-text[identifier="s1"]') as QtiGapText;
    const gapTextS2 = assessmentItem.querySelector('qti-gap-text[identifier="s2"]') as QtiGapText;
    const gapTextS3 = assessmentItem.querySelector('qti-gap-text[identifier="s3"]') as QtiGapText;
    const gapTextS4 = assessmentItem.querySelector('qti-gap-text[identifier="s4"]') as QtiGapText;
    const gapTextS5 = assessmentItem.querySelector('qti-gap-text[identifier="s5"]') as QtiGapText;

    const gapT1 = assessmentItem.querySelector('qti-gap[identifier="t1"]') as QtiGap;
    const gapT2 = assessmentItem.querySelector('qti-gap[identifier="t2"]') as QtiGap;
    const gapT3 = assessmentItem.querySelector('qti-gap[identifier="t3"]') as QtiGap;
    const gapT4 = assessmentItem.querySelector('qti-gap[identifier="t4"]') as QtiGap;

    await step('fill in correct response', async () => {
      // Simulate the drag and drop operation
      await drag(gapTextS1, { to: gapT1, duration: 300 });
      await drag(gapTextS5, { to: gapT2, duration: 300 });
      await drag(gapTextS2, { to: gapT3, duration: 300 });
      await drag(gapTextS3, { to: gapT4, duration: 300 });
    });

    await fireEvent.click(submitButton);
    const score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value;
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE').value;
    expect(+score, 'SCORE = 1').toBe(1);
    expect(JSON.stringify(response)).toBe(JSON.stringify(['s1 t1', 's5 t2', 's2 t3', 's3 t4']));
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-example-3.xml`)
    })
  ]
};
