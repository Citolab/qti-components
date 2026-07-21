import { describe, expect, it } from 'vitest';

import { QtiChoiceInteraction } from '@qti-components/choice-interaction/elements';
import { QtiAssessmentItem } from '@qti-components/elements/elements';

import { allQtiElements } from './all-qti-elements';
import { qtiCorrectionElements } from './elements';
import { QtiChoiceInteractionCorrection } from './interactions/qti-choice-interaction-correction';
import { QtiAssessmentItemCorrection } from './components/qti-assessment-item-correction';
import { createCorrectionRegistry } from './registry';

import type { QtiTextEntryInteractionCorrection } from './interactions';

class ExtraElement extends HTMLElement {}

describe('createCorrectionRegistry', () => {
  it('defines every normal manifest entry and replaces correction-capable tags', () => {
    const registry = createCorrectionRegistry();

    for (const definition of allQtiElements) {
      expect(registry.get(definition.tag), definition.tag).toBeDefined();
    }

    for (const definition of qtiCorrectionElements) {
      expect(registry.get(definition.tag), definition.tag).toBe(definition.ctor);
    }

    expect(registry.get('qti-choice-interaction')).toBe(QtiChoiceInteractionCorrection);
    expect(registry.get('qti-choice-interaction')).not.toBe(QtiChoiceInteraction);
    expect(registry.get('qti-assessment-item')).toBe(QtiAssessmentItemCorrection);
    expect(registry.get('qti-assessment-item')).not.toBe(QtiAssessmentItem);
  });

  it('accepts additional third-party definitions', () => {
    const registry = createCorrectionRegistry([{ tag: 'third-party-interaction', ctor: ExtraElement }]);

    expect(registry.get('third-party-interaction')).toBe(ExtraElement);
  });

  it('upgrades standard tags against the scoped correction constructor', () => {
    const registry = createCorrectionRegistry();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open', customElementRegistry: registry });

    shadowRoot.innerHTML = '<qti-choice-interaction></qti-choice-interaction>';

    expect(shadowRoot.firstElementChild).toBeInstanceOf(QtiChoiceInteractionCorrection);
  });

  it('applies candidate correction to text-entry interactions', async () => {
    const registry = createCorrectionRegistry();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open', customElementRegistry: registry });
    document.body.append(host);
    shadowRoot.innerHTML = `
      <qti-text-entry-interaction
        response-identifier="RESPONSE"
        response="candidate"
        correct-response="correct"
        show-candidate-correction
      ></qti-text-entry-interaction>
    `;
    const interaction = shadowRoot.querySelector('qti-text-entry-interaction') as QtiTextEntryInteractionCorrection;

    await interaction.updateComplete;
    await Promise.resolve();

    expect(interaction.internals.states.has('candidate-incorrect')).toBe(true);
    host.remove();
  });

  it('keeps the normal and correction variants behaviorally isolated', async () => {
    const normalRegistry = new CustomElementRegistry();
    for (const { tag, ctor } of allQtiElements) {
      normalRegistry.define(tag, ctor);
    }
    const correctionRegistry = createCorrectionRegistry();
    const normalHost = document.createElement('div');
    const correctionHost = document.createElement('div');
    const normalRoot = normalHost.attachShadow({ mode: 'open', customElementRegistry: normalRegistry });
    const correctionRoot = correctionHost.attachShadow({ mode: 'open', customElementRegistry: correctionRegistry });
    const markup = `
      <qti-text-entry-interaction
        response="candidate"
        correct-response="correct"
        show-candidate-correction
      ></qti-text-entry-interaction>
    `;
    normalRoot.innerHTML = markup;
    correctionRoot.innerHTML = markup;
    document.body.append(normalHost, correctionHost);
    const normalInteraction = normalRoot.querySelector('qti-text-entry-interaction')!;
    const correctionInteraction = correctionRoot.querySelector(
      'qti-text-entry-interaction'
    ) as QtiTextEntryInteractionCorrection;

    await Promise.all([
      (normalInteraction as QtiTextEntryInteractionCorrection).updateComplete,
      correctionInteraction.updateComplete
    ]);
    await Promise.resolve();

    expect('toggleCandidateCorrection' in normalInteraction).toBe(false);
    expect((normalInteraction as QtiTextEntryInteractionCorrection).internals.states.has('candidate-incorrect')).toBe(
      false
    );
    expect('toggleCandidateCorrection' in correctionInteraction).toBe(true);
    expect(correctionInteraction.internals.states.has('candidate-incorrect')).toBe(true);

    normalHost.remove();
    correctionHost.remove();
  });
});
