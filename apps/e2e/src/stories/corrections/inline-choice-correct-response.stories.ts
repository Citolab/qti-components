import { html } from 'lit';

import { withCorrection } from '../kennisnet/with-correction';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * `show-correct-response` is the INTERNAL correct-response mode, and on an inline interaction it
 * hands over to the FULL variant: the key arrives as a second, inert copy of the dropdown in a
 * `div.full-correct-response-inline` beside the field, the same presentation an item gets from
 * `show-full-correct-response`. Text-entry, the other inline interaction, has always worked this way.
 *
 * There used to be a third presentation here — a `part="correct-option"` marker painted inside the
 * field — and it is gone. It competed with the sentence it sat in, and when the candidate had picked
 * the correct option it printed the same word twice while stealing the DOM nodes the candidate's own
 * answer was made of (Citolab/qti-components#178).
 *
 * Unlike the base default, the key is shown whether or not the candidate was right: asking for the
 * correct response and being shown nothing reads as a broken feature. The correctness badge is what
 * says who was right.
 */
const meta: Meta = {
  title: 'corrections/inline choice',
  decorators: [withCorrection],
  parameters: {
    layout: 'padded',
    chromatic: { disableSnapshot: true }
  }
};

export default meta;

const question = (label: string, response: string) => html`
  <qti-item-body>
    <p style="margin-block-end:1.5rem"><strong>${label}</strong></p>
    <p>
      De Doppler-verschuiving treedt op wanneer een geluidsbron en een waarnemer zich ten opzichte van elkaar bewegen.
      Het waargenomen geluid wordt dan
      <qti-inline-choice-interaction
        response-identifier="RESPONSE"
        shuffle="false"
        data-prompt="kies het juiste antwoord…"
        response=${response}
        correct-response="choice_hoger"
        show-correct-response
      >
        <qti-inline-choice identifier="choice_lager">lager</qti-inline-choice>
        <qti-inline-choice identifier="choice_hoger">hoger</qti-inline-choice>
        <qti-inline-choice identifier="choice_onveranderd">onveranderd</qti-inline-choice>
      </qti-inline-choice-interaction>
      wanneer de bron dichterbij komt.
    </p>
  </qti-item-body>
`;

/** The ordinary case: two different options, so the trigger and the key never wanted the same nodes. */
export const AnswerDiffersFromKey: Story = {
  name: 'answer differs from the key',
  render: () => question('Candidate answered “lager”, the key is “hoger”.', 'choice_lager')
};

/**
 * The case the old inline marker handled worst. The key still appears — this element overrides the
 * base's withholding — but as a copy of the dropdown beside the field, not as a second “hoger”
 * crammed inside it.
 */
export const AnswerIsTheKey: Story = {
  name: 'answer IS the key',
  render: () => question('Candidate answered “hoger”, which is also the key.', 'choice_hoger')
};

/**
 * Toggle it and watch the wrapper come and go while the candidate's own answer stays put. With the
 * old marker this was the unrecoverable case: once the nodes had moved into it, lit dirty-checked the
 * unchanged reference on the way back and the dropdown stayed empty for good.
 */
export const ToggleTheKey: Story = {
  name: 'toggle the key on and off',
  render: () => html`
    <qti-item-body>
      <p style="margin-block-end:1.5rem">
        <strong>Candidate answered “hoger”, which is also the key.</strong>
      </p>
      <p>
        Het waargenomen geluid wordt
        <qti-inline-choice-interaction
          id="toggling"
          response-identifier="RESPONSE"
          shuffle="false"
          data-prompt="kies het juiste antwoord…"
          response="choice_hoger"
          correct-response="choice_hoger"
        >
          <qti-inline-choice identifier="choice_lager">lager</qti-inline-choice>
          <qti-inline-choice identifier="choice_hoger">hoger</qti-inline-choice>
          <qti-inline-choice identifier="choice_onveranderd">onveranderd</qti-inline-choice>
        </qti-inline-choice-interaction>
        wanneer de bron dichterbij komt.
      </p>
      <!--
        An inline handler, not lit's \`@click\`: \`withCorrection\` re-renders a story that has no
        item-container through \`shadow.innerHTML = markup\`, which keeps the markup and drops every
        lit event binding. An attribute survives that round-trip. \`this.getRootNode()\` because the
        story lives in the decorator's shadow root, where \`document\` cannot reach it.
      -->
      <button
        type="button"
        style="margin-block-start:1.5rem"
        onclick="const i = this.getRootNode().querySelector('#toggling'); i.showCorrectResponse = !i.showCorrectResponse;"
      >
        Toggle the answer key
      </button>
    </qti-item-body>
  `
};
