import { html } from 'lit';
import { expect, waitFor, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

const meta: Meta = {
  title: 'Implementation/Cookbook/PeilingLezen/A text beside its questions',
  tags: ['autodocs'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `A reading test: the text on the left, every question that belongs to it on the right. In QTI each
item points at the text with a \`qti-assessment-stimulus-ref\`, and a section groups the items that share it.

\`\`\`html
<qti-test navigate="section">
  <div class="reading">
    <div data-stimulus-idref="Stimulus1"></div>   <!-- the text goes here -->
    <test-navigation>
      <test-container test-url="reading-test.xml"></test-container>
    </test-navigation>
  </div>
</qti-test>
\`\`\`

- \`navigate="section"\` shows every item of the section together, so all questions about the text
  are on screen at once.
- The items do not place the text. The host puts one element with \`data-stimulus-idref\` (the
  stimulus-ref's \`identifier\`) wherever the layout wants it, and the test fills it.
- Items that refer to the same text load it once, however many there are.

Answer a question and the others stay as they are. The stimulus-ref stories under _QTI Item / Elements_
cover the other ways to place a text (inside the item, or through the test).`
      }
    }
  }
};
export default meta;

/** The text beside every question that belongs to it. */
export const TextBesideItsQuestions: StoryObj = {
  parameters: { testTimeout: 60000 },
  render: () => html`
    <style>
      .reading {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 2rem;
        align-items: start;
      }
    </style>
    <qti-test navigate="section">
      <div class="reading">
        <div data-stimulus-idref="Stimulus1"></div>
        <test-navigation>
          <test-container test-url="/assets/qti-assessment-stimulus-ref/unbelievable-night-test.xml"></test-container>
        </test-navigation>
      </div>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.querySelector('test-container')!;
    const target = canvasElement.querySelector('[data-stimulus-idref="Stimulus1"]')!;

    await waitFor(() => expect(canvas.getByText('An Unbelievable Night')).toBeTruthy(), {
      timeout: 15000
    });
    expect(target).toContainElement(canvas.getByText('An Unbelievable Night'));

    // Every question of the section is on screen, and the text appears once.
    await waitFor(() => expect(container.shadowRoot!.querySelectorAll('qti-assessment-item')).toHaveLength(3));
    expect(canvasElement.querySelectorAll('qti-assessment-stimulus')).toHaveLength(1);
  }
};
