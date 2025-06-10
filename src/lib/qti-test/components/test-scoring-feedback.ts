import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { computedContext } from '../../exports/computed.context';

import type { OutcomeVariable } from '../../exports/variables';
import type { ComputedContext } from '../../exports/computed.context';
import type { ViewMode } from 'storybook/internal/types';

@customElement('test-scoring-feedback')
export class TestScoringFeedback extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  protected computedContext?: ComputedContext;

  @property({ type: String, attribute: 'view' })
  public view: ViewMode = null;

  render() {
    const activeItem = this.computedContext?.testParts
      .flatMap(testPart => testPart.sections.flatMap(section => section.items))
      .find(item => item.active);

    if (!activeItem || !activeItem.variables) return html``;

    if (activeItem['category'] === 'dep-informational') return html`<div>${this.dataset.informational}</div>`;

    const completionStatus = activeItem?.variables.find(v => v.identifier === 'completionStatus')?.value;
    const scoreOutcome = activeItem?.variables.find(vr => vr.identifier == 'SCORE') as OutcomeVariable;

    const score = parseFloat(scoreOutcome?.value as string);
    const externalScored = activeItem['externalScored'];

    const feedbackText = () => {
      if (completionStatus !== 'completed') {
        return this.dataset.textNoResponse;
      }

      if (!externalScored && score !== undefined && !Number.isNaN(score)) {
        return score > 0 ? this.dataset.textCorrect : this.dataset.textIncorrect;
      }

      if (externalScored === 'externalMachine') {
        return Number.isNaN(score) || score === undefined
          ? this.dataset.scoreUnknown
          : `We hebben je antwoord ${score === 0 ? 'geen punten' : score == 1 ? 'één punt' : `${score} punten`} gegeven. Je kunt je score zelf aanpassen als je denkt dat dat niet klopt.`;
      }

      if (externalScored === 'human') {
        return Number.isNaN(score) ? '' : 'Deze score heb je zelf toegekend.';
      }

      return this.dataset.inProgress;
    };

    return html`<div>${feedbackText()}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-scoring-feedback': TestScoringFeedback;
  }
}
