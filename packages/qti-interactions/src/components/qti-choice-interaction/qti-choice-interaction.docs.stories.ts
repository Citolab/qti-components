import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fireEvent, fn, waitFor } from 'storybook/test';
import { getByShadowRole } from 'shadow-dom-testing-library';
import { within } from 'shadow-dom-testing-library';
import { spread } from '@open-wc/lit-helpers';

import type { QtiSimpleChoice } from '@qti-components/interactions';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiChoiceInteraction } from './qti-choice-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-choice-interaction');

type Story = StoryObj<QtiChoiceInteraction & typeof args>;

/**
 * [1.2.1 Choice Interaction](https://www.imsglobal.org/spec/qti/v3p0/vocab#choice-interaction)
 * Presents a set of choices to the candidate. The candidate's task is to select one or more of the choices, up to a maximum number of choices allowed.
 */
const meta: Meta<QtiChoiceInteraction> = {
  component: 'qti-choice-interaction',
  title: 'Shared Vocabulary/1.2.1 Choice Interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs']
};
export default meta;

// ${template(
//   { ...args, 'response-identifier': 'RESPONSE', 'max-choices': 1 },
//   html`
const TemplateThreeOptions = args =>
  html` <qti-choice-interaction ${spread({ ...args, 'response-identifier': 'RESPONSE', 'max-choices': 1 })}>
    <qti-simple-choice identifier="ChoiceA">You must stay with your luggage at all times.</qti-simple-choice>
    <qti-simple-choice identifier="ChoiceB">Do not let someone else look after your luggage.</qti-simple-choice>
    <qti-simple-choice identifier="ChoiceC">Remember your luggage when you leave.</qti-simple-choice>
  </qti-choice-interaction>`;
/**
 * ### [1.2.1.1 Choice Label](https://www.imsglobal.org/spec/qti/v3p0/vocab#choice-label)
 */
export const ChoiceLabelNone: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-labels-none'
  }
};

export const ChoiceLabelDecimal: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-labels-decimal'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByShadowText<QtiSimpleChoice>('1')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('2')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('3')).toBeTruthy();
  }
};

export const ChoiceLabelLowerAlpha: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-labels-lower-alpha'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByShadowText<QtiSimpleChoice>('a')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('b')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('c')).toBeTruthy();
  }
};

export const ChoiceLabelUpperAlpha: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-labels-upper-alpha'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByShadowText<QtiSimpleChoice>('A')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('B')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('C')).toBeTruthy();
  }
};

/**
 * ### [1.2.1.2 Choice Label Suffix](https://www.imsglobal.org/spec/qti/v3p0/vocab#choice-label-suffix)
 */

export const ChoiceLabelSuffixNone: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-labels-suffix-none'
  }
};

export const ChoiceLabelSuffixPeriod: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-labels-suffix-period'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByShadowText<QtiSimpleChoice>('A.')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('B.')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('C.')).toBeTruthy();
  }
};

export const ChoiceLabelSuffixParenthesis: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-labels-suffix-parenthesis'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByShadowText<QtiSimpleChoice>('A)')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('B)')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('C)')).toBeTruthy();
  }
};

/**
 * ### [1.2.1.3 Combining Choice Label and Choice Label Suffix](https://www.imsglobal.org/spec/qti/v3p0/vocab#choice-label-suffix)
 */

export const ChoiceLabelSuffixAlphaParenthesis: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-labels-lower-alpha qti-labels-suffix-parenthesis'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByShadowText<QtiSimpleChoice>('a)')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('b)')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('c)')).toBeTruthy();
  }
};

export const ChoiceLabelSuffixDecimalPeriod: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-labels-decimal qti-labels-suffix-period'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByShadowText<QtiSimpleChoice>('1.')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('2.')).toBeTruthy();
    expect(canvas.getByShadowText<QtiSimpleChoice>('3.')).toBeTruthy();
  }
};

/**
 * ### [1.2.1.4 Choice Orientation](https://www.imsglobal.org/spec/qti/v3p0/vocab#h.wwbbogz9iw9r)
 */

export const ChoiceOrientationVertical: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-orientation-vertical'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ChoiceA = canvas.getByText<QtiSimpleChoice>('You must stay with your luggage at all times.');
    const ChoiceB = canvas.getByText<QtiSimpleChoice>('Do not let someone else look after your luggage.');
    const ChoiceC = canvas.getByText<QtiSimpleChoice>('Remember your luggage when you leave.');
    expect(ChoiceB).toBePositionedRelativeTo(ChoiceA, 'below');
    expect(ChoiceC).toBePositionedRelativeTo(ChoiceB, 'below');
  }
};

export const ChoiceOrientationHorizontal: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-orientation-horizontal'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ChoiceA = canvas.getByText<QtiSimpleChoice>('You must stay with your luggage at all times.');
    const ChoiceB = canvas.getByText<QtiSimpleChoice>('Do not let someone else look after your luggage.');
    const ChoiceC = canvas.getByText<QtiSimpleChoice>('Remember your luggage when you leave.');
    expect(ChoiceB).toBePositionedRelativeTo(ChoiceA, 'right');
    expect(ChoiceC).toBePositionedRelativeTo(ChoiceB, 'right');
  }
};

/**
 * ### [1.2.1.4 Choice Stacking](https://www.imsglobal.org/spec/qti/v3p0/vocab#choice-stacking)
 */

// ${template(
//   { ...args, 'response-identifier': 'RESPONSE' },
//   html`

const TemplateSixOptions = args =>
  html` <qti-choice-interaction ${spread({ ...args, 'response-identifier': 'RESPONSE' })}>
    <qti-simple-choice fixed="false" identifier="H">Hydrogen</qti-simple-choice>
    <qti-simple-choice fixed="false" identifier="He">Helium</qti-simple-choice>
    <qti-simple-choice fixed="false" identifier="C">Carbon</qti-simple-choice>
    <qti-simple-choice fixed="false" identifier="O">Oxygen</qti-simple-choice>
    <qti-simple-choice fixed="false" identifier="N">Nitrogen</qti-simple-choice>
    <qti-simple-choice fixed="false" identifier="Cl">Chlorine</qti-simple-choice>
  </qti-choice-interaction>`;

export const ChoiceStacking1: Story = {
  render: args => TemplateSixOptions({ ...args, 'max-choices': '0' }),
  args: {
    class: 'qti-choices-stacking-1'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hydrogenChoice = canvas.getByText<QtiSimpleChoice>('Hydrogen');
    const heliumChoice = canvas.getByText<QtiSimpleChoice>('Helium');
    const carbonChoice = canvas.getByText<QtiSimpleChoice>('Carbon');
    const oxygenChoice = canvas.getByText<QtiSimpleChoice>('Oxygen');
    const nitrogenChoice = canvas.getByText<QtiSimpleChoice>('Nitrogen');
    const chlorineChoice = canvas.getByText<QtiSimpleChoice>('Chlorine');
    expect(heliumChoice).toBePositionedRelativeTo(hydrogenChoice, 'below');
    expect(carbonChoice).toBePositionedRelativeTo(hydrogenChoice, 'below');
    expect(oxygenChoice).toBePositionedRelativeTo(carbonChoice, 'below');
    expect(nitrogenChoice).toBePositionedRelativeTo(oxygenChoice, 'below');
    expect(chlorineChoice).toBePositionedRelativeTo(nitrogenChoice, 'below');
  }
};

export const ChoiceStacking2: Story = {
  render: args => TemplateSixOptions({ ...args, 'max-choices': '0' }),
  args: {
    class: 'qti-choices-stacking-2'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hydrogenChoice = canvas.getByText<QtiSimpleChoice>('Hydrogen');
    const heliumChoice = canvas.getByText<QtiSimpleChoice>('Helium');
    const carbonChoice = canvas.getByText<QtiSimpleChoice>('Carbon');
    const oxygenChoice = canvas.getByText<QtiSimpleChoice>('Oxygen');
    const nitrogenChoice = canvas.getByText<QtiSimpleChoice>('Nitrogen');
    const chlorineChoice = canvas.getByText<QtiSimpleChoice>('Chlorine');
    expect(heliumChoice).toBePositionedRelativeTo(hydrogenChoice, 'right');
    expect(carbonChoice).toBePositionedRelativeTo(hydrogenChoice, 'below');
    expect(oxygenChoice).toBePositionedRelativeTo(carbonChoice, 'right');
    expect(nitrogenChoice).toBePositionedRelativeTo(oxygenChoice, 'left');
    expect(chlorineChoice).toBePositionedRelativeTo(nitrogenChoice, 'right');
  }
};

export const ChoiceStacking3: Story = {
  render: args => TemplateSixOptions({ ...args, 'max-choices': '0' }),
  args: {
    class: 'qti-choices-stacking-3'
  }
};

export const ChoiceStacking4: Story = {
  render: args => TemplateSixOptions({ ...args, 'max-choices': '0' }),
  args: {
    class: 'qti-choices-stacking-4'
  }
};

export const ChoiceStacking5: Story = {
  render: args => TemplateSixOptions({ ...args, 'max-choices': '0' }),
  args: {
    class: 'qti-choices-stacking-5'
  }
};

/**
 * ### [1.2.1.6 Combining Orientation and Choice Stacking](https://www.imsglobal.org/spec/qti/v3p0/vocab#combining-orientation-and-choice-stacking)
 */

export const ChoiceOrientationStackingH3: Story = {
  render: args => TemplateSixOptions({ ...args, 'max-choices': '0' }),
  args: {
    class: 'qti-choices-stacking-3 qti-orientation-horizontal'
  }
};

export const ChoiceOrientationStackingV3: Story = {
  render: args => TemplateSixOptions({ ...args, 'max-choices': '0' }),
  args: {
    class: 'qti-choices-stacking-3 qti-orientation-vertical'
  }
};

export const ChoiceOrientationStackingV2: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-choices-stacking-2 qti-orientation-vertical'
  }
};

export const ChoiceOrientationStackingH2: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-choices-stacking-2 qti-orientation-horizontal'
  }
};

/**
 * ### [1.2.1.7 Choice with No Input Control](https://www.imsglobal.org/spec/qti/v3p0/vocab#choice-with-no-input-control)
 */

export const ChoiceNoInputControlHidden: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-input-control-hidden'
  }
};

export const ChoiceNoInputControlHiddenNone: Story = {
  render: TemplateThreeOptions,
  args: {
    class: 'qti-input-control-hidden qti-labels-none'
  }
};

/**
 * ### [1.2.1.8 Choice Interaction Custom max|min-choices Messages](https://www.imsglobal.org/spec/qti/v3p0/vocab#choice-interaction-custom-max-min-choices-messages)
 */

export const ChoiceMaxMessage: Story = {
  render: args =>
    html`${TemplateSixOptions(args)}
      <button
        id="validate-button"
        @click=${() => {
          const choiceInteraction = document.querySelector('qti-choice-interaction') as QtiChoiceInteraction;
          choiceInteraction?.reportValidity();
        }}
      >
        Validate
      </button>`,
  args: {
    'max-choices': '2',
    'data-max-selections-message': 'You can only select up to 2 options'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heliumChoice = canvas.getByText<QtiSimpleChoice>('Helium');
    const oxygenChoice = canvas.getByText<QtiSimpleChoice>('Oxygen');
    const nitrogenChoice = canvas.getByText<QtiSimpleChoice>('Nitrogen');
    const button = canvas.getByRole('button', { name: 'Validate' });

    await fireEvent.click(heliumChoice);
    await fireEvent.click(oxygenChoice);
    await fireEvent.click(nitrogenChoice);
    await fireEvent.click(button);
    const validationMessage = getByShadowRole(canvasElement, 'alert');
    await waitFor(() => expect(validationMessage).toBeVisible());
    expect(validationMessage.textContent).toBe('You can only select up to 2 options');
  }
};

export const ChoiceMinMessage: Story = {
  render: args =>
    html`${TemplateSixOptions(args)}
      <button
        id="validate-button"
        @click=${() => {
          const choiceInteraction = document.querySelector('qti-choice-interaction') as QtiChoiceInteraction;
          choiceInteraction?.reportValidity();
        }}
      >
        Validate
      </button>`,
  args: {
    'data-min-selections-message': 'You must select at least 2 options',
    'min-choices': '2',
    'max-choices': '0'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heliumChoice = canvas.getByText<QtiSimpleChoice>('Helium');
    const button = canvas.getByRole('button', { name: 'Validate' });

    await fireEvent.click(heliumChoice);
    await fireEvent.click(button);
    const validationMessage = getByShadowRole(canvasElement, 'alert');
    await waitFor(() => expect(validationMessage).toBeVisible());
    expect(validationMessage.textContent).toBe('You must select at least 2 options');
  }
};

/**
 * ### [1.2.1.9 Vertical Writing for Choice](https://www.imsglobal.org/spec/qti/v3p0/vocab#vertical-writing-for-choice)
 */

export const ChoiceVerticalWritingVerticalRL: Story = {
  render: TemplateSixOptions,
  tags: ['danger'],
  args: {
    class: 'qti-writing-orientation-vertical-rl'
  }
};

export const ChoiceVerticalWritingVerticalLR: Story = {
  render: TemplateSixOptions,
  tags: ['danger'],
  args: {
    class: 'qti-writing-orientation-vertical-lr'
  }
};

export const ChoiceVerticalWritingCJKIdeographic: Story = {
  render: TemplateSixOptions,
  tags: ['danger'],
  args: {
    class: 'qti-labels-cjk-ideographic'
  }
};

export const ChoiceVerticalWritingHiddenStacking2CJKIdeographic: Story = {
  render: TemplateSixOptions,
  tags: ['danger'],
  args: {
    class: 'qti-input-control-hidden qti-choices-stacking-2 qti-labels-cjk-ideographic'
  }
};
