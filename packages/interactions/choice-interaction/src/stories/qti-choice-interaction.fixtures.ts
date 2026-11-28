import { html } from 'lit';

import { spreadArgs } from '@qti-components/utilities';

/** Four options under a prompt: the fixture most choice stories render. */
export const optionsRender = (args: object, _context?: unknown) => {
  return html` <qti-choice-interaction ${spreadArgs(args as Record<string, unknown>)} data-testid="interaction">
    <qti-prompt>
      <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
    </qti-prompt>
    <qti-simple-choice identifier="A">Option A</qti-simple-choice>
    <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    <qti-simple-choice identifier="D">Option D</qti-simple-choice>
  </qti-choice-interaction>`;
};

/** The same, in a 300px container, with one option long enough to wrap. */
export const textOverflowRender = args => {
  // Create a wrapper with fixed width to test text wrapping
  return html`
    <div style="width: 300px; border: 1px solid #ccc;">
      <qti-choice-interaction ${spreadArgs(args as Record<string, unknown>)} data-testid="interaction">
        <qti-prompt>
          <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
        </qti-prompt>
        <qti-simple-choice identifier="A">Option A</qti-simple-choice>
        <qti-simple-choice identifier="B">Option B</qti-simple-choice>
        <qti-simple-choice identifier="C">Option C</qti-simple-choice>
        <qti-simple-choice identifier="D"
          >This is a very long option text that should wrap to the next line instead of overflowing outside its
          container when rendered properly. The text should respect the container boundaries and not break the
          layout.</qti-simple-choice
        >
      </qti-choice-interaction>
    </div>
  `;
};
