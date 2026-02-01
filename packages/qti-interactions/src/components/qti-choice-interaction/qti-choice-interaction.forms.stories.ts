import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fireEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { Test } from './qti-choice-interaction.stories';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '../../elements/qti-simple-choice';
import type { QtiChoiceInteraction } from './qti-choice-interaction';

const { events, args, argTypes } = getStorybookHelpers('qti-choice-interaction');

type Story = StoryObj<QtiChoiceInteraction & typeof args>;

const meta: Meta<QtiChoiceInteraction> = {
  component: 'qti-choice-interaction',
  title: 'Form Associated/02 Choice',
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['form-associated']
};
export default meta;

const formTemplate = (storyArgs, context) => html`
  <form data-testid="form" role="form" @submit=${e => e.preventDefault()} @reset=${e => e.preventDefault()}>
    ${Test.render(storyArgs, context)}
    <input type="submit" value="submit" />
    <input type="reset" value="reset" />
  </form>
`;

const getFormDataValues = (form: HTMLFormElement, name: string) => {
  const formData = new FormData(form);
  return formData.getAll(name);
};

const getInteractionAndChoice = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
  const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
  return { canvas, form, interaction, choiceA };
};

const setChoiceValue = async (choice: QtiSimpleChoice) => {
  await fireEvent.click(choice);
};

export const Enabled: Story = {
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    'max-choices': 1
  },
  play: async ({ canvasElement }) => {
    const { form, choiceA } = getInteractionAndChoice(canvasElement);
    await setChoiceValue(choiceA);
    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toEqual(['A']);
  }
};

export const Disabled: Story = {
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    'max-choices': 1
  },
  play: async ({ canvasElement }) => {
    const { form, interaction, choiceA } = getInteractionAndChoice(canvasElement);
    interaction.disabled = true;
    await interaction.updateComplete;

    await setChoiceValue(choiceA);
    await fireEvent.submit(form);

    expect(getFormDataValues(form, 'RESPONSE')).toEqual([]);
  }
};

export const Readonly: Story = {
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    'max-choices': 1
  },
  play: async ({ canvasElement }) => {
    const { form, interaction, choiceA } = getInteractionAndChoice(canvasElement);
    interaction.readonly = true;
    await interaction.updateComplete;

    await setChoiceValue(choiceA);
    await fireEvent.submit(form);

    expect(getFormDataValues(form, 'RESPONSE')).toEqual(['A']);
  }
};

export const Reset: Story = {
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    'max-choices': 1
  },
  play: async ({ canvasElement }) => {
    const { form, choiceA } = getInteractionAndChoice(canvasElement);
    await setChoiceValue(choiceA);
    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toEqual(['A']);

    await fireEvent.reset(form);
    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toEqual([]);
  }
};

export const NoName: Story = {
  render: formTemplate,
  args: {
    'max-choices': 1
  },
  play: async ({ canvasElement }) => {
    const { form, interaction, choiceA } = getInteractionAndChoice(canvasElement);
    interaction.removeAttribute('name');
    await interaction.updateComplete;

    await setChoiceValue(choiceA);
    await fireEvent.submit(form);

    expect(getFormDataValues(form, 'RESPONSE')).toEqual([]);
  }
};

export const FormAssociation: Story = {
  render: formTemplate,
  args: {
    name: 'RESPONSE'
  },
  play: async ({ canvasElement }) => {
    const { form, interaction } = getInteractionAndChoice(canvasElement);
    expect((interaction as any).internals?.form).toBe(form);

    form.removeChild(interaction);
    document.body.appendChild(interaction);
    await interaction.updateComplete;

    expect((interaction as any).internals?.form).toBe(null);
  }
};

export const Validation: Story = {
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    'min-choices': 1,
    'max-choices': 1
  },
  play: async ({ canvasElement }) => {
    const { interaction, choiceA } = getInteractionAndChoice(canvasElement);
    if (typeof interaction.validate === 'function') {
      expect(interaction.validate()).toBe(false);
    }

    await setChoiceValue(choiceA);
    if (typeof interaction.validate === 'function') {
      expect(interaction.validate()).toBe(true);
    }
  }
};

export const Reenable: Story = {
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    'max-choices': 1
  },
  play: async ({ canvasElement }) => {
    const { form, interaction, choiceA } = getInteractionAndChoice(canvasElement);
    interaction.disabled = true;
    await interaction.updateComplete;

    await setChoiceValue(choiceA);
    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toEqual([]);

    interaction.disabled = false;
    await interaction.updateComplete;

    await setChoiceValue(choiceA);
    await fireEvent.submit(form);
    expect(getFormDataValues(form, 'RESPONSE')).toEqual(['A']);
  }
};

export const ComprehensiveTest: Story = {
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    'min-choices': 1,
    'max-choices': 1
  },
  play: async ({ canvasElement, step }) => {
    const { canvas, form, interaction, choiceA } = getInteractionAndChoice(canvasElement);

    await step('Test basic functionality - enabled state', async () => {
      await setChoiceValue(choiceA);
      await fireEvent.submit(form);
      expect(getFormDataValues(form, 'RESPONSE')).toEqual(['A']);
    });

    await step('Test reset functionality', async () => {
      await fireEvent.reset(form);
      await fireEvent.submit(form);
      expect(getFormDataValues(form, 'RESPONSE')).toEqual([]);
    });

    await step('Test disabled state', async () => {
      interaction.disabled = true;
      await interaction.updateComplete;

      await setChoiceValue(choiceA);
      await fireEvent.submit(form);
      expect(getFormDataValues(form, 'RESPONSE')).toEqual([]);

      // Re-enable for next tests
      interaction.disabled = false;
      await interaction.updateComplete;
    });

    await step('Test readonly state', async () => {
      interaction.readonly = true;
      await interaction.updateComplete;

      await setChoiceValue(choiceA);
      await fireEvent.submit(form);
      expect(getFormDataValues(form, 'RESPONSE')).toEqual(['A']);

      // Reset readonly for next tests
      interaction.readonly = false;
      await interaction.updateComplete;
      await fireEvent.reset(form);
    });

    await step('Test validation', async () => {
      if (typeof interaction.validate === 'function') {
        // Should be invalid when no choice is selected
        expect(interaction.validate()).toBe(false);

        await setChoiceValue(choiceA);
        // Should be valid when required choice is selected
        expect(interaction.validate()).toBe(true);
      }
    });

    await step('Test form association', async () => {
      expect((interaction as any).internals?.form).toBe(form);

      form.removeChild(interaction);
      document.body.appendChild(interaction);
      await interaction.updateComplete;

      expect((interaction as any).internals?.form).toBe(null);

      // Restore to form for final test
      document.body.removeChild(interaction);
      form.appendChild(interaction);
      await interaction.updateComplete;
    });

    await step('Test without name attribute', async () => {
      const originalName = interaction.getAttribute('name');
      interaction.removeAttribute('name');
      await interaction.updateComplete;

      await setChoiceValue(choiceA);
      await fireEvent.submit(form);
      expect(getFormDataValues(form, 'RESPONSE')).toEqual([]);

      // Restore name attribute
      if (originalName) {
        interaction.setAttribute('name', originalName);
        await interaction.updateComplete;
      }
    });

    await step('Test re-enable after disable', async () => {
      interaction.disabled = true;
      await interaction.updateComplete;

      await setChoiceValue(choiceA);
      await fireEvent.submit(form);
      expect(getFormDataValues(form, 'RESPONSE')).toEqual([]);

      interaction.disabled = false;
      await interaction.updateComplete;

      await setChoiceValue(choiceA);
      await fireEvent.submit(form);
      expect(getFormDataValues(form, 'RESPONSE')).toEqual(['A']);
    });
  }
};
