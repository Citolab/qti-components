import type { ResponseVariable } from '@qti-components/base';
import type { QtiSimpleAssociableChoice } from '../../elements/qti-simple-associable-choice';

interface MatchInteractionHostBase {
  readonly responseVariable?: ResponseVariable;
  readonly targetChoices: QtiSimpleAssociableChoice[];
}

export interface MatchInternalCorrectResponseOptions extends MatchInteractionHostBase {
  readonly classList: DOMTokenList;
  getCorrectOptions(): { source: string; target: string }[] | null;
  setCorrectOptions(options: { source: string; target: string }[] | null): void;
  querySelector(selector: string): Element | null;
  querySelectorAll(selector: string): NodeListOf<Element>;
}

export type MatchCandidateCorrectionOptions = MatchInteractionHostBase;

export function toggleMatchInternalCorrectResponse(host: MatchInternalCorrectResponseOptions, show: boolean): void {
  const responseVariable = host.responseVariable;

  if (!responseVariable?.correctResponse) {
    removeCorrectOptionLabels(host);
    host.setCorrectOptions(null);
    return;
  }

  const matches = getMatchesFromResponse(responseVariable);
  const isTabular = host.classList.contains('qti-match-tabular');

  if (!isTabular) {
    if (show) {
      removeCorrectOptionLabels(host);
      host.targetChoices.forEach(targetChoice => {
        const targetId = targetChoice.getAttribute('identifier');
        const match = matches.find(m => m.target === targetId);

        if (!match?.source) {
          return;
        }

        const sourceChoice = host.querySelector(`qti-simple-associable-choice[identifier="${match.source}"]`);
        const text = sourceChoice?.textContent?.trim();

        if (text && !targetChoice.previousElementSibling?.classList.contains('correct-option')) {
          const textSpan = document.createElement('span');
          textSpan.classList.add('correct-option');
          textSpan.textContent = text;

          textSpan.style.border = '1px solid var(--qti-correct)';
          textSpan.style.borderRadius = '4px';
          textSpan.style.padding = '2px 4px';
          textSpan.style.display = 'inline-block';

          targetChoice.insertAdjacentElement('beforebegin', textSpan);
        }
      });
    } else {
      host.setCorrectOptions(null);
      removeCorrectOptionLabels(host);
    }
    return;
  }

  host.setCorrectOptions(show ? matches || [] : null);
}

export function toggleMatchCandidateCorrection(host: MatchCandidateCorrectionOptions, show: boolean): void {
  const responseVariable = host.responseVariable;

  if (!responseVariable?.correctResponse) {
    return;
  }

  const matches = getMatchesFromResponse(responseVariable);

  host.targetChoices.forEach(targetChoice => {
    const targetId = targetChoice.getAttribute('identifier');
    const targetMatches = matches.filter(match => match.target === targetId);

    const selectedChoices = targetChoice.querySelectorAll(`qti-simple-associable-choice`);

    selectedChoices.forEach(selectedChoice => {
      selectedChoice.internals.states.delete('candidate-correct');
      selectedChoice.internals.states.delete('candidate-incorrect');

      if (!show) {
        return;
      }

      const isCorrect = targetMatches.find(match => match.source === selectedChoice.identifier)?.source !== undefined;
      if (isCorrect) {
        selectedChoice.internals.states.add('candidate-correct');
      } else {
        selectedChoice.internals.states.add('candidate-incorrect');
      }
    });
  });
}

function removeCorrectOptionLabels(host: { querySelectorAll(selector: string): NodeListOf<Element> }) {
  host.querySelectorAll('.correct-option').forEach(element => element.remove());
}

function getMatchesFromResponse(responseVariable?: ResponseVariable): { source: string; target: string }[] {
  if (!responseVariable?.correctResponse) {
    return [];
  }

  const correctResponse = Array.isArray(responseVariable.correctResponse)
    ? responseVariable.correctResponse
    : [responseVariable.correctResponse];

  return correctResponse.reduce<{ source: string; target: string }[]>((acc, entry) => {
    const [source, target] = entry.split(' ');
    if (source && target) {
      acc.push({ source, target });
    }
    return acc;
  }, []);
}
