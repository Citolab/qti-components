import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { computedContext } from '@citolab/qti-components/qti-base';

import type { View } from '@citolab/qti-components/qti-base';
import type { OutcomeVariable } from '@citolab/qti-components/qti-base';
import type { ComputedContext } from '@citolab/qti-components/qti-base';

export class TestScoringFeedback extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  protected computedContext?: ComputedContext;

  @property({ type: String, attribute: 'view' })
  public view: View = null;

  override render() {
    const activeItem = this.computedContext?.testParts
      .flatMap(testPart => testPart.sections.flatMap(section => section.items))
      .find(item => item.active);

    if (!activeItem || !activeItem.variables) return html``;

    if ((activeItem as any)['category'] === 'dep-informational') return html`<div>${this.dataset.informational}</div>`;

    const scoreOutcome = activeItem?.variables.find(vr => vr.identifier == 'SCORE') as OutcomeVariable;

    const score = parseFloat(scoreOutcome?.value as string);
    const externalScored = (activeItem as any)['externalScored'];

    const feedbackText = () => {
      // No (valid) answer: completionStatus is QTI's, set by response processing, not "answered".
      if (activeItem.valid === false || activeItem.isDefaultResponse) {
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
