import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiUploadInteraction } from '../qti-upload-interaction';

type Story = StoryObj<QtiUploadInteraction>;

/**
 * ## Form Association Stories
 *
 * The upload interaction inside a plain `<form>`: the chosen file, as a base64 data URL, reaches
 * `FormData` under its `name`, and `form.reset()` empties it. Upload has no minimum or maximum, so
 * there is no validation flow to show.
 */
const meta: Meta<QtiUploadInteraction> = {
  component: 'qti-upload-interaction',
  title: 'Interactions/Upload/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formTemplate = () => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-upload-interaction name="RESPONSE" response-identifier="RESPONSE" data-testid="interaction">
    </qti-upload-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiUploadInteraction>('interaction');
  await interaction.updateComplete;

  /** Choose a file in the interaction's file input, as the browser's picker would. */
  const choose = async (file: File) => {
    // Exception: a file input has no ARIA role and this one has no label, so no testing query
    // reaches it; its part is the public handle.
    const input = interaction.shadowRoot!.querySelector<HTMLInputElement>('input[type="file"]')!;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    // The file is read asynchronously; the form value is set once it is.
    await waitFor(() => expect(new FormData(form).get('RESPONSE')).not.toBe(null));
  };
  return { form, interaction, choose };
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM DATA AND RESET
// ═══════════════════════════════════════════════════════════════════════════════

export const FormDataAndReset: Story = {
  name: 'FormData - holds the file as a data URL, reset empties it',
  render: () => formTemplate(),
  play: async ({ canvasElement }) => {
    const { form, interaction, choose } = await getElements(canvasElement);

    await choose(new File(['hello'], 'answer.txt', { type: 'text/plain' }));
    expect(new FormData(form).get('RESPONSE')).toBe(`data:text/plain;base64,${btoa('hello')}`);
    expect(interaction.response).toBe(`data:text/plain;base64,${btoa('hello')}`);

    form.reset();
    await interaction.updateComplete;
    expect(new FormData(form).get('RESPONSE')).toBe(null);
    expect(interaction.response).toBe(null);
  }
};
