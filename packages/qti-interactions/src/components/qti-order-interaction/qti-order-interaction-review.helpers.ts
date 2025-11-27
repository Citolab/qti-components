import type { ResponseVariable } from '@qti-components/base';
import type { QtiSimpleChoice } from '../../elements/qti-simple-choice';

export interface OrderReviewContext {
  responseVariable?: ResponseVariable;
  shadowRoot: ShadowRoot | null;
  choices: NodeListOf<QtiSimpleChoice>;
}

export function toggleOrderInteractionCorrectResponse(context: OrderReviewContext, show: boolean): void {
  const { responseVariable, shadowRoot, choices } = context;
  if (!shadowRoot) {
    return;
  }

  shadowRoot.querySelectorAll('.correct-option').forEach(option => option.remove());
  if (!show || !responseVariable?.correctResponse) {
    return;
  }

  const response = Array.isArray(responseVariable.correctResponse)
    ? responseVariable.correctResponse
    : [responseVariable.correctResponse];

  const correctIds = response.map(r => r.split(' ')[0]);
  const used = new Set<string>();

  Array.from(choices).forEach((choice, index) => {
    const identifier = choice.getAttribute('identifier');
    if (!identifier || !correctIds.includes(identifier) || used.has(identifier)) {
      return;
    }
    used.add(identifier);

    const text = choice.textContent?.trim();
    if (!text) {
      return;
    }

    const relativeDrop = shadowRoot.querySelector(`drop-list[identifier="droplist${index}"]`);
    if (!relativeDrop) {
      return;
    }

    const span = document.createElement('span');
    span.classList.add('correct-option');
    span.textContent = text;
    span.style.border = '1px solid var(--qti-correct)';
    span.style.borderRadius = '4px';
    span.style.padding = '2px 4px';
    span.style.display = 'inline-block';
    span.style.marginTop = '4px';

    relativeDrop.insertAdjacentElement('afterend', span);
  });
}
