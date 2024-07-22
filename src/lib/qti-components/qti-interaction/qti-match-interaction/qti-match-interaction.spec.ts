import '@citolab/qti-components/qti-components';

import { render } from 'lit';
import { Tabular } from './qti-match-interaction.stories';

const getMatchInteraction = () => document.body.querySelector('qti-match-interaction');

const getChoices = () => {
  const matchInteractionShadowRoot = document.body.querySelector('qti-match-interaction').shadowRoot;
  const choices = Array.from(matchInteractionShadowRoot.querySelectorAll('input')) as HTMLInputElement[];

  console.log('********', matchInteractionShadowRoot.querySelectorAll('input'));

  const map = new Map<string, HTMLInputElement>();
  choices.forEach(qtiSimpleAssociableChoice => map.set(qtiSimpleAssociableChoice.id, qtiSimpleAssociableChoice));
  return map;
};

const getCorrectResponses = () =>
  Array.from(
    document.body.querySelector('qti-correct-response')?.querySelectorAll('qti-value'),
    qtiValue => qtiValue.textContent
  );

describe('qti-match-interaction', () => {
  afterEach(async () => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  }); // MANDATORY
  describe('maxChoicesLargeThan1', () => {
    beforeEach(async () => {
      render(Tabular.render({ matchMax: 2 }), document.body);
    });

    it('should show as checkboxes', () => {
      const choices = Array.from(getChoices().values());
      expect(choices[0][0].getAttribute('type')).toMatch('checkbox');
      expect(choices[1][0].getAttribute('role')).toMatch('checkbox');
      expect(choices[2][0].getAttribute('role')).toMatch('checkbox');
      expect(choices[3][0].getAttribute('role')).toMatch('checkbox');
    });
  });
  //   describe('maxChoices1', () => {
  //     beforeEach(async () => {
  //       render(Default.render({ matchMax: 1 }), document.body);
  //     });

  //     it('should show as radiobuttons', () => {
  //       const choices = Array.from(getQtiSimpleAssociableChoices().values());
  //       expect(choices[0][0].getAttribute('role')).toMatch('radio');
  //       expect(choices[1][0].getAttribute('role')).toMatch('radio');
  //       expect(choices[2][0].getAttribute('role')).toMatch('radio');
  //       expect(choices[3][0].getAttribute('role')).toMatch('radio');
  //     });

  //     it('check scoring correct', () => {
  //       const matchInteraction = getMatchInteraction();
  //       let score = 0;
  //       const setScore = (e: QtiOutcomeChanged) => (score = +e.detail.value);
  //       matchInteraction.addEventListener('qti-interaction-response', setScore);

  //       const correctResponses = getCorrectResponses();
  //       const choices = getQtiSimpleAssociableChoices();
  //       for (let i = 0; i < correctResponses.length; i++) {
  //         const matchIngChoice = choices.get(correctResponses[i]);
  //         matchIngChoice.click();
  //       }
  //       matchInteraction.removeEventListener('qti-interaction-response', setScore);
  //       expect(score).toBe(1);
  //     });
  //   });
});
