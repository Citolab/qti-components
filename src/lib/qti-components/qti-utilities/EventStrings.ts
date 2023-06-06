export * as QtiOutcomeChanged from './events/qti-outcome-changed';

export * as QtiInteractionChanged from './events/qti-interaction-changed';

export * as QtiRegisterVariable from './events/qti-register-variable';
export * as QtiRegisterInteraction from './events/qti-register-interaction';
export * as QtiRegisterChoice from './events/qti-register-choice';
export * as QtiRegisterHotspot from './events/qti-register-hotspot';
export * as QtiLooseChoice from './events/qti-loose-choice';
export * as QtiInteractionResponse from './events/qti-interaction-response';

export * as QtiChoiceElementSelected from './events/qti-choice-element-selected';

export const Events = {
  // PK: external event internal response from an interaction the qti-assessment-item
  ON_OUTCOME_CHANGED: 'qti-outcome-changed',

  // PK: external event internal response from an interaction the qti-assessment-item
  ON_INTERACTION_CHANGED: 'on-interaction-changed',

  // ***** INTERNAL EVENTS ******/
  ON_REGISTER_VARIABLE: 'on-register-variable',
  ON_REGISTER_FEEDBACK: 'on-register-feedback',
  ON_REGISTER_INTERACTION: 'on-register-interaction',
  ON_REGISTER_CHOICE: 'on-register-choice',
  ON_REGISTER_HOTSPOT: 'on-register-hotspot',
  ON_LOOSE_CHOICE: 'on-loose-choice',
  // PK: internal response from an interaction the qti-assessment-item
  ON_INTERACTION_RESPONSE: 'on-interaction-response',

  // PK: events specific to elements from interactions
  ON_DROPDOWN_SELECTED: 'on-dropdown-selected',
  ON_CHOICE_ELEMENT_SELECTED: 'choice-element-selected'
};
