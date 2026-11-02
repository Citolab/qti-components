import { dispatchPublic } from '../public-events';

import type { FeedbackEventDetail } from '../public-events';

interface FeedbackElement extends Element {
  outcomeIdentifier: string;
}

/**
 * Send `qc-feedback-show` or `qc-feedback-hide` from a feedback element, just before it shows or
 * hides. Both are cancelable; this returns `false` when the host cancels, i.e. takes over.
 */
export function dispatchFeedback(
  element: FeedbackElement,
  name: 'qc-feedback-show' | 'qc-feedback-hide',
  kind: FeedbackEventDetail['kind'],
  identifier: string
): boolean {
  const itemIdentifier = element.closest('qti-assessment-item')?.getAttribute('identifier') ?? undefined;
  const detail: FeedbackEventDetail = {
    kind,
    identifier,
    outcomeIdentifier: element.outcomeIdentifier,
    element,
    ...(itemIdentifier ? { itemIdentifier } : {})
  };
  return dispatchPublic(element, name, detail, true);
}
