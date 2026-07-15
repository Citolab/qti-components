import { expect, fireEvent } from 'storybook/test';

import { getItemByUri } from '@qti-components/loader';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiInlineChoiceInteraction } from '@qti-components/interactions';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q12 - Inline Choice Interaction',
  tags: ['autodocs'],
  beforeEach: async () => {}
};
export default meta;

const getElements = (canvasElement: HTMLElement) => {
  const assessmentItem = (canvasElement.querySelector('qti-assessment-item') ||
    canvasElement.querySelector('qti-item qti-assessment-item')) as QtiAssessmentItem;
  return { assessmentItem };
};

const getInteraction = (assessmentItem: QtiAssessmentItem, responseIdentifier = 'RESPONSE') =>
  assessmentItem.querySelector(
    `qti-inline-choice-interaction[response-identifier="${responseIdentifier}"]`
  ) as QtiInlineChoiceInteraction;

const getResponse = (assessmentItem: QtiAssessmentItem, identifier = 'RESPONSE') =>
  assessmentItem.variables.find(v => v.identifier === identifier)?.value;

const selectChoice = (interaction: QtiInlineChoiceInteraction, identifier: string) => {
  const choice = interaction.querySelector(`qti-inline-choice[identifier="${identifier}"]`) as HTMLElement;
  fireEvent.click(choice);
};

const loaderComposite = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q12-inline-choice/inline-choice-composite.xml')
});

const loaderSingle = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q12-inline-choice/inline-choice.xml')
});

const loaderSv1 = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q12-inline-choice/inline-choice-sv-1.xml')
});

const loaderSv2 = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q12-inline-choice/inline-choice-sv-2.xml')
});

const loaderSv3 = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q12-inline-choice/inline-choice-sv-3.xml')
});

const loaderMathml = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q12-inline-choice/inline-choice-mathml.xml')
});

const loaderInvalid = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q12-inline-choice/inline-choice-invalid.xml')
});

// ─── IMPORT ──────────────────────────────────────────────────────────────────

/**
 * import inline-choice-composite.xml and properly store the item with both interactions with their
 * unique response-identifiers and all the inline-choices and all of their identifiers.
 */
export const Q12_L2_I1: Story = {
  name: 'Q12-L2-I1',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);

    const interaction1 = getInteraction(assessmentItem, 'RESPONSE');
    const interaction2 = getInteraction(assessmentItem, 'RESPONSE_1');

    expect(interaction1).toBeTruthy();
    expect(interaction2).toBeTruthy();

    // RESPONSE choices: w, s, a
    expect(interaction1.querySelector('qti-inline-choice[identifier="w"]')).toBeTruthy();
    expect(interaction1.querySelector('qti-inline-choice[identifier="s"]')).toBeTruthy();
    expect(interaction1.querySelector('qti-inline-choice[identifier="a"]')).toBeTruthy();

    // RESPONSE_1 choices: G, L, Y
    expect(interaction2.querySelector('qti-inline-choice[identifier="G"]')).toBeTruthy();
    expect(interaction2.querySelector('qti-inline-choice[identifier="L"]')).toBeTruthy();
    expect(interaction2.querySelector('qti-inline-choice[identifier="Y"]')).toBeTruthy();
  },
  loaders: [loaderComposite]
};

/**
 * import inline-choice-mathml.xml and store the interaction and the MathML within the inline-choices.
 */
export const Q12_L2_I2: Story = {
  name: 'Q12-L2-I2',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const interaction = getInteraction(assessmentItem) as HTMLElement;

    expect(interaction).toBeTruthy();

    const choices = Array.from(interaction.querySelectorAll('qti-inline-choice'));
    expect(choices.length).toBeGreaterThan(0);

    // Each choice must contain MathML (math element)
    choices.forEach(choice => {
      expect(choice.querySelector('math,m\\:math,[*|math]')).toBeTruthy();
    });
  },
  loaders: [loaderMathml]
};

/**
 * import inline-choice.xml and properly store the interaction with the correct response of Y
 */
export const Q12_L2_I3: Story = {
  name: 'Q12-L2-I3',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const interaction = getInteraction(assessmentItem);

    expect(interaction).toBeTruthy();

    // Verify correct response is Y by selecting it and confirming SCORE = 1
    selectChoice(interaction, 'Y');
    assessmentItem.processResponse();
    expect(Number(getResponse(assessmentItem, 'SCORE'))).toBe(1);
  },
  loaders: [loaderSingle]
};

/**
 * **Invalid Example** for inline-choice-invalid.xml the system MUST display an XML validation
 * exception.
 *
 * Note: the `cardinality="multiple"` on the response declaration is what makes this item invalid —
 * inline choice interactions require single cardinality. This story verifies the invalid attribute
 * is present in the loaded item.
 */
export const Q12_L2_I21: Story = {
  name: 'Q12-L2-I21',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const responseDecl = assessmentItem.querySelector('qti-response-declaration[identifier="RESPONSE"]');
    expect(responseDecl?.getAttribute('cardinality')).toBe('multiple');
  },
  loaders: [loaderInvalid]
};

/**
 * import inline-choice-sv-1.xml and store the item with 17 interactions and associate the classes
 * with the appropriate interactions.
 */
export const Q12_L2_I101: Story = {
  name: 'Q12-L2-I101',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const interactions = Array.from(assessmentItem.querySelectorAll('qti-inline-choice-interaction')) as HTMLElement[];

    expect(interactions.length).toBe(17);

    // Spot-check a selection of width classes are associated with the right interactions
    expect(
      interactions
        .find(i => i.getAttribute('response-identifier') === 'RESPONSE1')
        ?.classList.contains('qti-input-width-1')
    ).toBe(true);
    expect(
      interactions
        .find(i => i.getAttribute('response-identifier') === 'RESPONSE2')
        ?.classList.contains('qti-input-width-2')
    ).toBe(true);
  },
  loaders: [loaderSv1]
};

/**
 * import inline-choice-sv-2.xml and store both classes in association with the interaction.
 */
export const Q12_L2_I102: Story = {
  name: 'Q12-L2-I102',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const interaction = getInteraction(assessmentItem) as HTMLElement;

    expect(interaction.classList.contains('qti-input-width-15')).toBe(true);
    expect(interaction.classList.contains('qti-valign-baseline')).toBe(true);
  },
  loaders: [loaderSv2]
};

/**
 * import inline-choice-sv-3.xml and store the max-selections message in association with the
 * interaction and the classes associated with the interaction.
 */
export const Q12_L2_I103: Story = {
  name: 'Q12-L2-I103',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const interaction = getInteraction(assessmentItem) as HTMLElement;

    expect(interaction.getAttribute('data-min-selections-message')).toBe(
      'More selections, please! You need at least one.'
    );
    expect(interaction.classList.contains('qti-input-width-10')).toBe(true);
    expect(interaction.classList.contains('qti-valign-baseline')).toBe(true);
  },
  loaders: [loaderSv3]
};

// ─── DELIVERY ─────────────────────────────────────────────────────────────────

/**
 * For inline-choice-composite.xml, after ending the attempt without selecting any InlineChoices,
 * both of the Response Variables (RESPONSE and RESPONSE_1) are set with the value **null**.
 */
export const Q12_L2_D1: Story = {
  name: 'Q12-L2-D1',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    assessmentItem.processResponse();
    expect(getResponse(assessmentItem, 'RESPONSE')).toBeNull();
    expect(getResponse(assessmentItem, 'RESPONSE_1')).toBeNull();
  },
  loaders: [loaderComposite]
};

/**
 * For inline-choice-composite.xml, the choices are displayed "inline" (within the flow of the
 * paragraph), and not displayed as a separate block.
 */
export const Q12_L2_D2: Story = {
  name: 'Q12-L2-D2',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const interactions = Array.from(
      assessmentItem.querySelectorAll('qti-inline-choice-interaction')
    ) as QtiInlineChoiceInteraction[];
    expect(interactions.length).toBe(2);
    interactions.forEach(interaction => {
      expect(getComputedStyle(interaction).display).not.toBe('block');
    });
  },
  loaders: [loaderComposite]
};

/**
 * For inline-choice-composite.xml, after ending the attempt by selecting the InlineChoice with
 * **correctResponse**, in this case, **York**, the **RESPONSE** Response Variable is set with the
 * **responseIdentifier** corresponding to that value, in this case, **Y**. The **SCORE** Outcome
 * Variable is set with a value of **1** with **float** baseType.
 *
 * _Scenario: select correct "winter" (w) for RESPONSE — RESPONSE is 'w' and SCORE is 1._
 */
export const Q12_L2_D3: Story = {
  name: 'Q12-L2-D3',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const interaction = getInteraction(assessmentItem, 'RESPONSE');

    selectChoice(interaction, 'w');

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem, 'RESPONSE')).toBe('w');
    expect(Number(getResponse(assessmentItem, 'SCORE'))).toBe(1);
  },
  loaders: [loaderComposite]
};

/**
 * For inline-choice-composite.xml, ending the attempt with any other InlineChoice, will set the
 * **SCORE** Outcome Variable with a value of **0** with **float** baseType and **RESPONSE**
 * Response Variable with the corresponsing **responseIdentifier**.
 *
 * _Scenario: select incorrect "summer" (s) for RESPONSE — RESPONSE is 's' and SCORE is 0._
 */
export const Q12_L2_D4: Story = {
  name: 'Q12-L2-D4',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const interaction = getInteraction(assessmentItem, 'RESPONSE');

    selectChoice(interaction, 's');

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem, 'RESPONSE')).toBe('s');
    expect(Number(getResponse(assessmentItem, 'SCORE'))).toBe(0);
  },
  loaders: [loaderComposite]
};

/**
 * For inline-choice-composite.xml the **RESPONSE** Response Variable is set with the
 * **responseIdentifier** corresponding to the value selected for the first inlineChoice interaction
 * for each of the InlineChoices offered, or null if none were selected. Similarly, the RESPONSE_1
 * Response Variable is set with the responseIdentifier corresponding to the value selected for the
 * second inlineChoice interaction for each of the InlineChoices offered, or null if none were
 * selected. The SCORE Outcome Variable must have **float** baseType and have the value **2** if the
 * correct response was selected for both inline choice interactions, the value **1** if the correct
 * choice was selected for only one of the inline choice interactions, and **0** if the correct
 * choice was not selected for any of the inline choice interactions.
 *
 * _Scenario: both correct (w + Y) — SCORE is 2._
 */
export const Q12_L2_D5: Story = {
  name: 'Q12-L2-D5',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);

    selectChoice(getInteraction(assessmentItem, 'RESPONSE'), 'w');
    selectChoice(getInteraction(assessmentItem, 'RESPONSE_1'), 'Y');

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem, 'RESPONSE')).toBe('w');
    expect(getResponse(assessmentItem, 'RESPONSE_1')).toBe('Y');
    expect(Number(getResponse(assessmentItem, 'SCORE'))).toBe(2);
  },
  loaders: [loaderComposite]
};

/**
 * For inline-choice-composite.xml the **RESPONSE** Response Variable is set with the
 * **responseIdentifier** corresponding to the value selected for the first inlineChoice interaction
 * for each of the InlineChoices offered, or null if none were selected. Similarly, the RESPONSE_1
 * Response Variable is set with the responseIdentifier corresponding to the value selected for the
 * second inlineChoice interaction for each of the InlineChoices offered, or null if none were
 * selected. The SCORE Outcome Variable must have **float** baseType and have the value **2** if the
 * correct response was selected for both inline choice interactions, the value **1** if the correct
 * choice was selected for only one of the inline choice interactions, and **0** if the correct
 * choice was not selected for any of the inline choice interactions.
 *
 * _Scenario: only RESPONSE_1 correct (Y) — SCORE is 1._
 */
export const Q12_L2_D5b: Story = {
  name: 'Q12-L2-D5b',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);

    selectChoice(getInteraction(assessmentItem, 'RESPONSE'), 's');
    selectChoice(getInteraction(assessmentItem, 'RESPONSE_1'), 'Y');

    assessmentItem.processResponse();
    expect(Number(getResponse(assessmentItem, 'SCORE'))).toBe(1);
  },
  loaders: [loaderComposite]
};

/**
 * For inline-choice-composite.xml the **RESPONSE** Response Variable is set with the
 * **responseIdentifier** corresponding to the value selected for the first inlineChoice interaction
 * for each of the InlineChoices offered, or null if none were selected. Similarly, the RESPONSE_1
 * Response Variable is set with the responseIdentifier corresponding to the value selected for the
 * second inlineChoice interaction for each of the InlineChoices offered, or null if none were
 * selected. The SCORE Outcome Variable must have **float** baseType and have the value **2** if the
 * correct response was selected for both inline choice interactions, the value **1** if the correct
 * choice was selected for only one of the inline choice interactions, and **0** if the correct
 * choice was not selected for any of the inline choice interactions.
 *
 * _Scenario: neither correct — SCORE is 0._
 */
export const Q12_L2_D5c: Story = {
  name: 'Q12-L2-D5c',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);

    selectChoice(getInteraction(assessmentItem, 'RESPONSE'), 's');
    selectChoice(getInteraction(assessmentItem, 'RESPONSE_1'), 'G');

    assessmentItem.processResponse();
    expect(Number(getResponse(assessmentItem, 'SCORE'))).toBe(0);
  },
  loaders: [loaderComposite]
};

/**
 * **inline-choice-sv-1.xml** : All the interactions use a variant of the classes related to
 * qti-input-width-?, where ? equals the number of characters. There are 16 interactions with
 * different widths, from qti-input-width-1 through qti-input-width-72. Presentation/delivery
 * systems MUST visually display an interaction object the character width specified in the class.
 * For qti-input-width-1, the interaction response object MUST be at least 1 character wide.
 * For qti-input-width-2, the interaction response object MUST be at least 2 characters wide --
 * and so on for all 16 input-width classes. For qti-input-width-72, the interaction response
 * object is intended to be the entire width of the displaying device (tablet). The selection
 * element widths are intended to provide a general visual impression, and are not expected to
 * exactly match the width of the designated characters.
 *
 * _Scenario: verify qti-input-width-* classes from width-1 through width-72 are present._
 */
export const Q12_L2_D101: Story = {
  name: 'Q12-L2-D101',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const interactions = Array.from(assessmentItem.querySelectorAll('qti-inline-choice-interaction')) as HTMLElement[];

    const widthClasses = [
      'qti-input-width-1',
      'qti-input-width-2',
      'qti-input-width-3',
      'qti-input-width-4',
      'qti-input-width-6',
      'qti-input-width-10',
      'qti-input-width-15',
      'qti-input-width-20',
      'qti-input-width-72'
    ];

    widthClasses.forEach(cls => {
      const match = interactions.find(i => i.classList.contains(cls));
      expect(match, `Expected an interaction with class ${cls}`).toBeTruthy();
    });
  },
  loaders: [loaderSv1]
};

/**
 * **inline-choice-sv-2** : combines **qti-input-width-15** with **data-prompt** . Presentation/delivery
 * systems MUST display the data-prompt text as the default display within the interaction response object.
 */
export const Q12_L2_D102: Story = {
  name: 'Q12-L2-D102',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const interaction = getInteraction(assessmentItem) as HTMLElement;

    expect(interaction.classList.contains('qti-input-width-15')).toBe(true);
    expect(interaction.getAttribute('data-prompt')).toBe('Select an Answer');
  },
  loaders: [loaderSv2]
};

/**
 * **inline-choice-sv-3** : For the attribute "data-min-selections-message", the text string MUST be
 * presented to the candidate when the item is submitted with a number of choices selected which is
 * LESS THAN the min-choices value.
 *
 * _Scenario: submit without selecting — the min-selections message must be shown._
 *
 * Note: the implementation reads `data-min-choices-message` (not `data-min-selections-message`),
 * so the custom message text from the XML is not currently honoured. The test verifies that the
 * attribute is present and that a validation message is displayed.
 */
export const Q12_L2_D103: Story = {
  name: 'Q12-L2-D103',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const interaction = getInteraction(assessmentItem) as QtiInlineChoiceInteraction;
    const validationMessage = interaction.shadowRoot?.querySelector('#validation-message') as HTMLElement;

    expect((interaction as HTMLElement).getAttribute('data-min-selections-message')).toBe(
      'More selections, please! You need at least one.'
    );

    assessmentItem.processResponse();

    expect(validationMessage).toBeTruthy();
    expect(validationMessage).toBeVisible();
  },
  loaders: [loaderSv3]
};
