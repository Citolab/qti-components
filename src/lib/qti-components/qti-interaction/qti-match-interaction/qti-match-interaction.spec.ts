import '@citolab/qti-components/qti-components';

import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { userEvent } from '@storybook/test';
import { render } from 'lit';
import { Tabular, TabularMultiple } from './qti-match-interaction.stories';

const getChoices = () => {
  const matchInteractionShadowRoot = document.body.querySelector('qti-match-interaction').shadowRoot;
  const choices = Array.from(matchInteractionShadowRoot.querySelectorAll('input')) as HTMLInputElement[];
  const map = new Map<string, HTMLInputElement>();
  choices.forEach(input => map.set(input.value, input));
  return map;
};

describe('qti-match-interaction', () => {
  afterEach(async () => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  }); // MANDATORY
  describe('maxChoices 1', () => {
    beforeEach(async () => {
      render(Tabular.render(), document.body);
    });

    it('should show as radiobuttons', () => {
      const choices = Array.from(getChoices().values());
      expect(choices[0].getAttribute('type')).toMatch('radio');
      expect(choices[1].getAttribute('type')).toMatch('radio');
      expect(choices[2].getAttribute('type')).toMatch('radio');
      expect(choices[3].getAttribute('type')).toMatch('radio');
    });
    it('should score correct', async () => {
      const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
      const correctResponses = ['P T', 'L M', 'D M', 'C R'];

      const choices = getChoices();
      for (const correctResponse of correctResponses) {
        const choice = choices.get(correctResponse);
        await userEvent.click(choice);
      }
      assessmentItem.processResponse();
      const score = assessmentItem.variables.find(v => v.identifier === 'SCORE');

      expect(score.value).toEqual('3');
    });
    it('should score correct clicking 3 times', async () => {
      const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
      const correctResponses = ['P T', 'L M', 'D M', 'C R'];

      const choices = getChoices();
      for (const correctResponse of correctResponses) {
        const choice = choices.get(correctResponse);

        await userEvent.click(choice);
        await userEvent.click(choice);
        await userEvent.click(choice);
      }
      assessmentItem.processResponse();
      const score = assessmentItem.variables.find(v => v.identifier === 'SCORE');

      expect(score.value).toEqual('3');
    });
    it('should score incorrect clicking twice', async () => {
      const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
      const correctResponses = ['P T', 'L M', 'D M', 'C R'];

      const choices = getChoices();
      for (const correctResponse of correctResponses) {
        const choice = choices.get(correctResponse);
        await userEvent.click(choice);
        await userEvent.click(choice);
      }
      assessmentItem.processResponse();
      const score = assessmentItem.variables.find(v => v.identifier === 'SCORE');

      expect(score.value).toEqual('0');
    });
  });
  describe('maxChoices > 1', () => {
    beforeEach(async () => {
      render(TabularMultiple.render(), document.body);
    });

    it('should show as checkboxes', () => {
      const choices = Array.from(getChoices().values());
      expect(choices[0].getAttribute('type')).toMatch('checkbox');
      expect(choices[1].getAttribute('type')).toMatch('checkbox');
      expect(choices[2].getAttribute('type')).toMatch('checkbox');
      expect(choices[3].getAttribute('type')).toMatch('checkbox');
    });

    it('trying to check 4 boxes while max-choice = 2 should not work', async () => {
      const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
      const choices = Array.from(getChoices().values());
      const firstRow = choices.filter(c => c.value.startsWith('C'));
      for (const choice of firstRow) {
        await userEvent.click(choice);
      }
      const response = assessmentItem.getResponse('RESPONSE');
      expect(response.value.length).toBe(2);
    });
  });
  // describe('play', () => {
  //   beforeEach(async () => {
  //     // render(TabularMultiple.render(), document.body);

  //     render(Play.render({ 'max-choices': 3, 'min-choices': 2 }), document.body);
  //   });
  // });
});
