import type { ResponseVariable } from '@qti-components/base';
import type { QtiGap } from '../../elements/qti-gap';
import type { QtiGapText } from '../../elements/qti-gap-text';

export interface GapMatchReviewContext {
  responseVariable?: ResponseVariable;
  querySelectorAll<T extends Element = Element>(selector: string): NodeListOf<T>;
  querySelector<T extends Element = Element>(selector: string): T | null;
}

export function toggleGapMatchCorrectResponse(context: GapMatchReviewContext, show: boolean): void {
  const { responseVariable } = context;

  if (!show || !responseVariable?.correctResponse) {
    context.querySelectorAll('.correct-option').forEach(option => option.remove());
    return;
  }

  const matches = normalizeMatches(responseVariable);

  const gaps = context.querySelectorAll<QtiGap>('qti-gap');
  gaps.forEach(gap => {
    const identifier = gap.getAttribute('identifier');
    const textIdentifier = matches.find(x => x.gap === identifier)?.text;
    const text = textIdentifier
      ? context.querySelector<QtiGapText>(`qti-gap-text[identifier="${textIdentifier}"]`)?.textContent?.trim()
      : null;
    const nextElement = gap.nextElementSibling;
    if (textIdentifier && text) {
      if (!nextElement?.classList.contains('correct-option')) {
        const textSpan = document.createElement('span');
        textSpan.classList.add('correct-option');
        textSpan.textContent = text;
        textSpan.style.border = '1px solid var(--qti-correct)';
        textSpan.style.borderRadius = '4px';
        textSpan.style.padding = '2px 4px';
        textSpan.style.display = 'inline-block';

        gap.insertAdjacentElement('afterend', textSpan);
      }
    } else if (nextElement?.classList.contains('correct-option')) {
      nextElement.remove();
    }
  });
}

export function toggleGapMatchCandidateCorrection(context: GapMatchReviewContext, show: boolean): void {
  const { responseVariable } = context;
  if (!responseVariable?.correctResponse) {
    return;
  }

  const matches = normalizeMatches(responseVariable);
  const targetChoices = Array.from(context.querySelectorAll<QtiGap>('qti-gap'));
  targetChoices.forEach(targetChoice => {
    const targetId = targetChoice.getAttribute('identifier');
    const targetMatches = matches.filter(m => m.gap === targetId);
    const selectedChoices = targetChoice.querySelectorAll<QtiGapText>('qti-gap-text');

    selectedChoices.forEach(selectedChoice => {
      selectedChoice.internals.states.delete('candidate-correct');
      selectedChoice.internals.states.delete('candidate-incorrect');
      if (!show) {
        return;
      }

      const isCorrect = targetMatches.some(m => m.text === selectedChoice.identifier);
      if (isCorrect) {
        selectedChoice.internals.states.add('candidate-correct');
      } else {
        selectedChoice.internals.states.add('candidate-incorrect');
      }
    });
  });
}

function normalizeMatches(responseVariable: ResponseVariable): { text: string; gap: string }[] {
  const response = Array.isArray(responseVariable.correctResponse)
    ? responseVariable.correctResponse
    : [responseVariable.correctResponse];

  return response
    .filter(Boolean)
    .map(match => {
      const split = match.split(' ');
      return { text: split[0], gap: split[1] };
    });
}
