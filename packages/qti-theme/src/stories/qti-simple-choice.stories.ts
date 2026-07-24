import type { QtiAssessmentItem } from '@qti-components/elements';
import type { Meta } from '@storybook/web-components-vite';

const html = String.raw;

const meta: Meta<QtiAssessmentItem> = {
  title: 'theme/qti-simple-choice',
  parameters: {
    backgrounds: {
      // 👇 Set default background value for all component stories
      default: 'light'
    }
  }
};
export default meta;

export const QtiSimpleChoice = () => html`
  <qti-choice-interaction
    response-identifier="RESPONSE"
    shuffle="true"
    min-choices="1"
    max-choices="1"
    response="choice1"
    correct-response="choice2"
  >
    <qti-prompt> Welke van de onderstaande elementen heeft de hoogste atoommassa? </qti-prompt>
    <qti-simple-choice identifier="choice1" fixed show-hide="show"> Tin (Sn) </qti-simple-choice>
    <qti-simple-choice identifier="choice2" fixed show-hide="show"> Jodium (I) </qti-simple-choice>
    <qti-simple-choice identifier="choice3" fixed show-hide="show"> Xenon (Xe) </qti-simple-choice>
  </qti-choice-interaction>

  <qti-choice-interaction
    response-identifier="RESPONSE"
    shuffle="true"
    min-choices="0"
    max-choices="0"
    response="choice1,choice3"
  >
    <qti-prompt> Welke van de volgende landen zijn volledig door één enkel ander land ingesloten? </qti-prompt>
    <qti-simple-choice identifier="choice1" fixed show-hide="show"> Lesotho </qti-simple-choice>
    <qti-simple-choice identifier="choice2" fixed show-hide="show"> San Marino </qti-simple-choice>
    <qti-simple-choice identifier="choice3" fixed show-hide="show"> Bolivia </qti-simple-choice>
    <qti-simple-choice identifier="choice4" fixed show-hide="show"> Vaticaanstad </qti-simple-choice>
  </qti-choice-interaction>

  <qti-order-interaction
    response-identifier="RESPONSE"
    shuffle="false"
    orientation="horizontal"
    response="step_hypothese"
  >
    <qti-simple-choice identifier="step_hypothese">Hypothese formuleren</qti-simple-choice>
    <qti-simple-choice identifier="step_conclusies">Conclusies trekken</qti-simple-choice>
    <qti-simple-choice identifier="step_data">Data verzamelen</qti-simple-choice>
  </qti-order-interaction>

  <qti-order-interaction response-identifier="RESPONSE" shuffle="false" orientation="vertical" response="num_sqrt2">
    <qti-simple-choice identifier="num_sqrt2">√2 (≈ 1,414)</qti-simple-choice>
    <qti-simple-choice identifier="num_1">1</qti-simple-choice>
    <qti-simple-choice identifier="num_pi">π (≈ 3,14159)</qti-simple-choice>
  </qti-order-interaction>
`;
