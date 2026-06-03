import { createSeededRandom } from '../shared/prng';
import { shuffleKeepingFixed } from '../shared/shuffle';

function getShuffleQuerySelectorByTagName(tagName: string): string | string[] | null {
  switch (tagName) {
    case 'qti-choice-interaction':
    case 'qti-order-interaction':
      return 'qti-simple-choice';
    case 'qti-inline-choice-interaction':
      return 'qti-inline-choice';
    case 'qti-match-interaction':
      return [
        'qti-simple-match-set:first-of-type qti-simple-associable-choice',
        'qti-simple-match-set:last-of-type > qti-simple-associable-choice'
      ];
    case 'qti-gap-match-interaction':
      return 'qti-gap-text';
    case 'qti-associate-interaction':
      return 'qti-simple-associable-choice';
    default:
      return null;
  }
}

/**
 * Shuffles the choices inside every interaction marked `shuffle="true"`. When
 * `seed` is supplied, shuffling is deterministic and reproducible across
 * reloads; each interaction/group draws its own stream so they are independent
 * and stable even if siblings change. When `seed` is null/undefined, falls back
 * to Math.random.
 */
export function shuffleInteractions(xmlFragment: XMLDocument, seed?: string | number | null): void {
  const shuffleElements = xmlFragment.querySelectorAll(`[shuffle="true"]`);
  const shuffleInteractions = Array.from(shuffleElements).filter(e =>
    e.tagName?.toLowerCase().endsWith('-interaction')
  );

  const seeded = seed != null && `${seed}`.length > 0;
  const itemId = xmlFragment.querySelector?.('qti-assessment-item')?.getAttribute('identifier') ?? '';

  let interactionIndex = 0;
  for (const shuffleInteraction of shuffleInteractions) {
    const responseId = shuffleInteraction.getAttribute('response-identifier') ?? `${interactionIndex}`;
    interactionIndex++;
    const query = getShuffleQuerySelectorByTagName(shuffleInteraction.tagName.toLowerCase());
    const queries = Array.isArray(query) ? query : [query];
    let shuffledAny = false;

    let queryIndex = 0;
    for (const q of queries) {
      if (!q) continue;
      const random = seeded ? createSeededRandom(`${seed}:${itemId}:${responseId}:${queryIndex}`) : Math.random;
      queryIndex++;
      const choices = (Array.from(shuffleInteraction.querySelectorAll(q)) as HTMLElement[]).filter(
        choice => choice.parentElement !== null
      );

      if (choices.filter(choice => choice.getAttribute('fixed') !== 'true').length <= 1) {
        console.warn('Shuffling is not possible with fewer than 2 non-fixed elements.');
        continue;
      }

      const parent = choices[0].parentElement;
      if (!parent || choices.some(choice => choice.parentElement !== parent)) {
        console.warn('Shuffling is not possible when choices do not share the same parent element.');
        continue;
      }

      const anchor = choices[choices.length - 1].nextSibling;
      const orderedChoices = shuffleKeepingFixed(
        choices.map(choice => ({
          element: choice,
          fixed: choice.getAttribute('fixed') === 'true'
        })),
        random
      );

      for (const choice of choices) {
        choice.remove();
      }
      for (const { element } of orderedChoices) {
        parent.insertBefore(element, anchor);
      }

      shuffledAny = true;
    }

    if (shuffledAny) {
      shuffleInteraction.removeAttribute('shuffle');
    }
  }
}
