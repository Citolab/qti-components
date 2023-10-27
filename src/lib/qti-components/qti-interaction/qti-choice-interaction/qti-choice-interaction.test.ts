import crypto from 'crypto';

// FIXME: Check if this is still needed, only when using choice this should be available
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length)
  }
});

import '../qti-simple-choice';
import './qti-choice-interaction';
import { describe, expect, it } from '@jest/globals';
import { Default } from './qti-choice-interaction.stories';
import { render } from 'lit';

const getQtiSimpleChoices = () => Array.from(document.body.querySelectorAll('qti-simple-choice'));
const getQtiChoiceInteraction = () => document.body.querySelector('qti-choice-interaction');

describe('qti-choice-interaction', () => {
  afterEach(() => (document.getElementsByTagName('html')[0].innerHTML = '')); // MANDATORY

  describe('maxChoices0', () => {
    beforeEach(async () => {
      render(Default.render({ 'max-choices': 3, 'min-choices': 2 }), document.body);
    });

    it('should validate because min-choices is 0', () => {
      getQtiSimpleChoices()[0].click();
      getQtiSimpleChoices()[1].click();
      expect(getQtiChoiceInteraction().validate()).toBeTruthy();
    });

    it('should show as checkbox', () => {
      const input = Array.from(getQtiSimpleChoices())[0];
      expect(input.getAttribute('role')).toBe('checkbox');
    });
  });

  describe('maxChoices1', () => {
    beforeEach(async () => {
      render(Default.render({ 'max-choices': 1, 'min-choices': 1 }), document.body);
    });

    it('should not validate because min-choices is 1', () => {
      expect(getQtiChoiceInteraction().validate()).toBeFalsy();
    });

    it('should show as radiobutton', async () => {
      const el = getQtiSimpleChoices()[0];
      expect(el.getAttribute('role')).toMatch('radio');
    });
  });

  describe('maxChoices2', () => {
    beforeEach(() => {
      render(Default.render({ maxChoices: 1, minChoices: 1 }), document.body);
    });

    it('should dispatch qti-interaction-response when clicked', () => {
      const ci = getQtiChoiceInteraction();
      const si = Array.from(getQtiSimpleChoices())[0];

      const dispatchEventSpy = jest.spyOn(ci, 'dispatchEvent');

      si.click();

      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('qti-interaction-response');
    });
  });
});
