import { withCorrectionRegistry } from './with-correction-registry.decorator';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Kennisnet items rendered against the correction registry, so `qti-choice-interaction`
 * resolves to `QtiChoiceInteractionCorrection` — see `with-correction-registry.decorator`.
 * Stories return markup strings, not lit templates.
 */
const meta: Meta = {
  title: 'qti-corrections/kennisnet all items stories',
  decorators: [withCorrectionRegistry]
};

export default meta;

/** ITEM001 — Meerkeuzevraag één antwoord (single-choice). */
export const MeerkeuzevraagEenAntwoord: Story = {
  name: 'ITEM001 — Meerkeuzevraag één antwoord',
  render: () => `
    <qti-item-body>
      <div class="qti-layout-row">
        <div class="qti-layout-col3">
          <img src="/assets/api/kennisnet/resources/atom.png" alt="Atoom" width="250" />
        </div>
        <div class="qti-layout-col9">
          <qti-choice-interaction
            response-identifier="RESPONSE"
            shuffle="true"
            min-choices="1"
            max-choices="1"
            response="choice1"
            correct-response="choice3"
            show-candidate-correction
            show-full-correct-response
          >
            <qti-prompt> Welke van de onderstaande elementen heeft de hoogste atoommassa? </qti-prompt>
            <qti-simple-choice identifier="choice1" fixed show-hide="show"> Tin (Sn) </qti-simple-choice>
            <qti-simple-choice identifier="choice2" fixed show-hide="show"> Jodium (I) </qti-simple-choice>
            <qti-simple-choice identifier="choice3" fixed show-hide="show"> Xenon (Xe) </qti-simple-choice>
          </qti-choice-interaction>
        </div>
      </div>

      <qti-rubric-block view="scorer" use="scoring">
        <qti-content-body> Xenon — atoommassa ≈ 131,29 u; Tin ≈ 118,71 u; Jodium ≈ 126,90 u </qti-content-body>
      </qti-rubric-block>
    </qti-item-body>
  `
};
