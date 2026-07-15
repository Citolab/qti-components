import { expect, fireEvent } from 'storybook/test';

import { getItemByUri } from '@qti-components/loader';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiHottextInteraction } from '@qti-components/interactions';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q11 - Hot-text Interaction',
  tags: ['autodocs'],
  beforeEach: async () => {}
};
export default meta;

const getElements = (canvasElement: HTMLElement) => {
  const assessmentItem = (canvasElement.querySelector('qti-assessment-item') ||
    canvasElement.querySelector('qti-item qti-assessment-item')) as QtiAssessmentItem;
  const hottextInteraction = assessmentItem.querySelector('qti-hottext-interaction') as QtiHottextInteraction;
  return { assessmentItem, hottextInteraction };
};

const getHottext = (hottextInteraction: QtiHottextInteraction, identifier: string) =>
  hottextInteraction.querySelector(`qti-hottext[identifier="${identifier}"]`) as HTMLElement;

const getResponse = (assessmentItem: QtiAssessmentItem, identifier = 'RESPONSE') =>
  assessmentItem.variables.find(v => v.identifier === identifier)?.value;

const loaderSingle = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q11-hottext/hot-text-interaction-1.xml')
});

const loaderMultiple = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q11-hottext/hot-text-interaction-2.xml')
});

const loaderSv1 = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q11-hottext/hottext-sv-1.xml')
});

const loaderSv2 = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q11-hottext/hottext-sv-2.xml')
});

/**
 * hot-text-interaction-1.xml contains an example of a hot text interaction with single cardinality.
 * The candidate MUST be restricted to selecting only a single choice. The correct response is B.
 * All other responses are incorrect.
 *
 * _Scenario: no selection — RESPONSE must be null._
 */
export const Q11_L2_D1: Story = {
  name: 'Q11-L2-D1',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toBeNull();
  },
  loaders: [loaderSingle]
};

/**
 * hot-text-interaction-1.xml contains an example of a hot text interaction with single cardinality.
 * The candidate MUST be restricted to selecting only a single choice. The correct response is B.
 * All other responses are incorrect.
 *
 * _Scenario: select B (correct) — RESPONSE is 'B' and SCORE is 1._
 */
export const Q11_L2_D1b: Story = {
  name: 'Q11-L2-D1b',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hottextInteraction } = getElements(canvasElement);

    fireEvent.click(getHottext(hottextInteraction, 'B'));

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toBe('B');
    expect(Number(assessmentItem.variables.find(v => v.identifier === 'SCORE')?.value)).toBe(1);
  },
  loaders: [loaderSingle]
};

/**
 * hot-text-interaction-1.xml contains an example of a hot text interaction with single cardinality.
 * The candidate MUST be restricted to selecting only a single choice. The correct response is B.
 * All other responses are incorrect.
 *
 * _Scenario: select A (incorrect) — RESPONSE is 'A' and SCORE is 0._
 */
export const Q11_L2_D1c: Story = {
  name: 'Q11-L2-D1c',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hottextInteraction } = getElements(canvasElement);

    fireEvent.click(getHottext(hottextInteraction, 'A'));

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toBe('A');
    expect(Number(assessmentItem.variables.find(v => v.identifier === 'SCORE')?.value)).toBe(0);
  },
  loaders: [loaderSingle]
};

/**
 * hot-text-interaction-1.xml contains an example of a hot text interaction with single cardinality.
 * The candidate MUST be restricted to selecting only a single choice. The correct response is B.
 * All other responses are incorrect.
 *
 * _Scenario: select B then C — only C must remain selected (single-choice enforcement)._
 */
export const Q11_L2_D1d: Story = {
  name: 'Q11-L2-D1d',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hottextInteraction } = getElements(canvasElement);

    fireEvent.click(getHottext(hottextInteraction, 'B'));
    fireEvent.click(getHottext(hottextInteraction, 'C'));

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toBe('C');
  },
  loaders: [loaderSingle]
};

/**
 * The Second example (hot-text-interaction-2.xml) is a hot text interaction with multiple cardinality.
 * The candidate may choose as many choices as they desire up to the max-choices.
 * The correct response is A and B. Selecting only A or B is incorrect.
 * Any other combinations other than A and B are incorrect.
 *
 * _Scenario: no selection — RESPONSE must be null._
 */
export const Q11_L2_D2: Story = {
  name: 'Q11-L2-D2',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toBeNull();
  },
  loaders: [loaderMultiple]
};

/**
 * The Second example (hot-text-interaction-2.xml) is a hot text interaction with multiple cardinality.
 * The candidate may choose as many choices as they desire up to the max-choices.
 * The correct response is A and B. Selecting only A or B is incorrect.
 * Any other combinations other than A and B are incorrect.
 *
 * _Scenario: select A and B (correct) — RESPONSE is ['A', 'B'] and SCORE is 1._
 */
export const Q11_L2_D2b: Story = {
  name: 'Q11-L2-D2b',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hottextInteraction } = getElements(canvasElement);

    fireEvent.click(getHottext(hottextInteraction, 'A'));
    fireEvent.click(getHottext(hottextInteraction, 'B'));

    assessmentItem.processResponse();
    expect(Array.isArray(getResponse(assessmentItem))).toBe(true);
    expect(getResponse(assessmentItem)).toEqual(['A', 'B']);
    expect(Number(assessmentItem.variables.find(v => v.identifier === 'SCORE')?.value)).toBe(1);
  },
  loaders: [loaderMultiple]
};

/**
 * The Second example (hot-text-interaction-2.xml) is a hot text interaction with multiple cardinality.
 * The candidate may choose as many choices as they desire up to the max-choices.
 * The correct response is A and B. Selecting only A or B is incorrect.
 * Any other combinations other than A and B are incorrect.
 *
 * _Scenario: select A only (incorrect) — RESPONSE is ['A'] and SCORE is 0._
 */
export const Q11_L2_D2c: Story = {
  name: 'Q11-L2-D2c',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hottextInteraction } = getElements(canvasElement);

    fireEvent.click(getHottext(hottextInteraction, 'A'));

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toEqual(['A']);
    expect(Number(assessmentItem.variables.find(v => v.identifier === 'SCORE')?.value)).toBe(0);
  },
  loaders: [loaderMultiple]
};

/**
 * For multiple cardinality example, the delivery system should enforce the maximum choices of 2.
 *
 * _Scenario: select 3 choices — the interaction becomes invalid and a validation message is shown._
 */
export const Q11_L2_D3: Story = {
  name: 'Q11-L2-D3',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hottextInteraction } = getElements(canvasElement);
    const validationMessage = hottextInteraction.shadowRoot?.querySelector('#validation-message') as HTMLElement;

    fireEvent.click(getHottext(hottextInteraction, 'A'));
    fireEvent.click(getHottext(hottextInteraction, 'B'));
    fireEvent.click(getHottext(hottextInteraction, 'C'));

    assessmentItem.processResponse();

    expect((hottextInteraction as any).internals.validity.valid).toBe(false);
    expect(validationMessage).toBeTruthy();
    expect(validationMessage).toBeVisible();
  },
  loaders: [loaderMultiple]
};

/**
 * hottext-sv-1.xml : The hottext interaction uses the QTI shared vocabulary class of
 * **"qti-input-control-hidden"** and therefore the presentation/delivery system MUST NOT
 * visually display the input controls (radio buttons or checkboxes) for the text entry
 * interaction choices. The hottext choices MUST be available by keyboard control and allow
 * the selection and deselection of the hottext choices.
 */
export const Q11_L2_D101: Story = {
  name: 'Q11-L2-D101',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { hottextInteraction } = getElements(canvasElement);
    expect((hottextInteraction as HTMLElement).classList.contains('qti-input-control-hidden')).toBe(true);
  },
  loaders: [loaderSv1]
};

/**
 * hottext-sv-2.xml : the interface MUST display the text strings found in the shared vocabulary
 * attributes within the interaction element when the item is submitted with values outside the
 * stated min and max choices values. For the attribute **"data-min-selections-message"**, the text
 * string MUST be presented to the candidate when the item is submitted with the number of choices
 * selected which is BELOW the **min-choices** value. For the attribute **"data-max-selections-message"**,
 * the text string MUST be presented to the candidate when the candidate attempts to select the number
 * of choices ABOVE the **max-choices** value - and - when the item is submitted with the number of
 * choices selected which is ABOVE the max-choices value.
 *
 * _Scenario: select 3 choices (above max-choices=2) — the max-selections message must be shown._
 */
export const Q11_L2_D102: Story = {
  name: 'Q11-L2-D102',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hottextInteraction } = getElements(canvasElement);
    const interaction = hottextInteraction as HTMLElement;
    const validationMessage = hottextInteraction.shadowRoot?.querySelector('#validation-message') as HTMLElement;

    expect(interaction.getAttribute('min-choices')).toBe('1');
    expect(interaction.getAttribute('max-choices')).toBe('2');
    expect(interaction.getAttribute('data-min-selections-message')).toBe("You haven't selected enough.");
    expect(interaction.getAttribute('data-max-selections-message')).toBe("You've selected too many!");

    // Select 3 choices to exceed max-choices=2
    fireEvent.click(getHottext(hottextInteraction, 'A'));
    fireEvent.click(getHottext(hottextInteraction, 'B'));
    fireEvent.click(getHottext(hottextInteraction, 'D'));

    assessmentItem.processResponse();

    expect(validationMessage).toBeTruthy();
    expect(validationMessage.textContent).toBe("You've selected too many!");
    expect(validationMessage).toBeVisible();
  },
  loaders: [loaderSv2]
};

/**
 * hottext-sv-2.xml : the interface MUST display the text strings found in the shared vocabulary
 * attributes within the interaction element when the item is submitted with values outside the
 * stated min and max choices values. For the attribute **"data-min-selections-message"**, the text
 * string MUST be presented to the candidate when the item is submitted with the number of choices
 * selected which is BELOW the **min-choices** value. For the attribute **"data-max-selections-message"**,
 * the text string MUST be presented to the candidate when the candidate attempts to select the number
 * of choices ABOVE the **max-choices** value - and - when the item is submitted with the number of
 * choices selected which is ABOVE the max-choices value.
 *
 * _Scenario: submit with no selection (below min-choices=1) — the min-selections message must be shown._
 */
export const Q11_L2_D102b: Story = {
  name: 'Q11-L2-D102b',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hottextInteraction } = getElements(canvasElement);
    const validationMessage = hottextInteraction.shadowRoot?.querySelector('#validation-message') as HTMLElement;

    // Submit with no selection — below min-choices=1
    assessmentItem.processResponse();

    expect(validationMessage).toBeTruthy();
    expect(validationMessage.textContent).toBe("You haven't selected enough.");
    expect(validationMessage).toBeVisible();
  },
  loaders: [loaderSv2]
};
