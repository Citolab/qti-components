import { itemRefsInOrder, ownItemRefs, sectionsInOrder } from '@qti-components/delivery';

import type { ComputedContext, ComputedItem, ItemContext, ResponseVariable } from '@qti-components/base';
import type { SessionContext, TestContext } from '@qti-components/base';
import type { ItemFacts, ItemRefModel, TestModel } from '@qti-components/delivery';
import type { ItemFactsByRef } from './item-facts.context';

/**
 * Whether an item's ended attempt reached the best achievable outcome:
 * 'optimal' (nothing to improve), 'suboptimal' (a better attempt is possible),
 * or 'unscored' (no machine-judgeable optimal value — see `assessOptimality`).
 */
export type ItemOptimality = 'optimal' | 'suboptimal' | 'unscored';

/** Everything `computedContext` is derived from. Nothing here is the previous `computedContext`. */
export interface ComputedContextInputs {
  /** The test's structure and resolved session control, from its XML (`buildTestModel`). */
  readonly model: TestModel;
  /** The facts of every item fetched so far, by item-ref identifier. */
  readonly itemFacts?: ItemFactsByRef;
  /** The candidate's responses and outcomes, per item. */
  readonly testContext?: Readonly<TestContext>;
  /** Where the candidate is, the view and the plugin state. */
  readonly sessionContext?: Readonly<SessionContext>;
  /** `config.infoItemCategory`: items with it are not numbered. */
  readonly infoItemCategory?: string;
  /** The host's per-item fields (`initContext`). */
  readonly itemData?: readonly { identifier: string; [key: string]: unknown }[];
  /**
   * The optimality of each item's last ended attempt, by item-ref identifier (see `ItemOptimality`).
   * Kept by `test-navigation`, since it is not in the contexts: it is written when an attempt ends,
   * never on a plain change of the answer.
   */
  readonly optimality: ReadonlyMap<string, ItemOptimality>;
  /** `computedContext.itemElement`, passed through. */
  readonly itemElement?: ComputedContext['itemElement'];
}

/**
 * `computedContext`, derived from its inputs alone: built anew on every call, never from the previous
 * context, and never changing an input. The same inputs give an equal context.
 *
 * Roadmap 1, T2c. `DeliveryState` is not live at runtime yet, so the candidate's state comes from
 * `testContext` and `sessionContext`; T3 and T8 move it into `DeliveryState`, and add their fields here.
 */
export function deriveComputedContext(inputs: ComputedContextInputs): ComputedContext {
  const { model, sessionContext, itemElement } = inputs;
  const itemIndexes = indexesInDocumentOrder(
    model.testParts.flatMap(part => itemRefsInOrder(part.sections)),
    inputs.infoItemCategory
  );
  return {
    itemElement,
    identifier: model.identifier,
    title: model.title,
    view: sessionContext?.view,
    plugins: sessionContext?.plugins ?? {},
    testParts: model.testParts.map(testPart => ({
      active: sessionContext?.navPartId === testPart.identifier,
      identifier: testPart.identifier,
      navigationMode: testPart.navigationMode,
      submissionMode: testPart.submissionMode,
      allowSkipping: testPart.sessionControl.allowSkipping,
      itemOrder: itemRefsInOrder(testPart.sections).map(item => item.identifier),
      // Flat, depth first: every section once, each with only its own item-refs, so every item is
      // listed once. Where a section's item-refs and subsections interleave, this list is not in
      // document order; `index` is.
      sections: sectionsInOrder(testPart.sections).map(section => ({
        active: sessionContext?.navSectionId === section.identifier,
        identifier: section.identifier,
        title: section.title,
        allowSkipping: section.sessionControl.allowSkipping,
        // A section that only holds subsections is completed when theirs are.
        completed: itemRefsInOrder(section.content).every(
          item => variableValue(itemContextFor(inputs, item.identifier), 'completionStatus') === 'completed'
        ),
        items: ownItemRefs(section).map(item => deriveItem(inputs, item, itemIndexes.get(item.identifier) ?? null))
      }))
    }))
  };
}

function deriveItem(inputs: ComputedContextInputs, item: ItemRefModel, index: number | null): ComputedItem {
  const itemContext = itemContextFor(inputs, item.identifier);
  const computedItem = {
    active: false,
    identifier: item.identifier,
    categories: [...item.categories],
    href: item.href,
    variables: [] as ComputedItem['variables'],
    sessionControl: { ...item.sessionControl },
    ...factsFor(inputs.itemFacts, item.identifier),
    ...itemContext,
    ...inputs.itemData?.find(data => data.identifier === item.identifier)
  } as ComputedItem;

  const rawScore = variableValue(computedItem, 'SCORE');
  const score = rawScore === undefined || rawScore === null ? null : parseFloat(rawScore.toString());
  const rawMaxScore = variableValue(computedItem, 'MAXSCORE');
  const maxScore = rawMaxScore === undefined || rawMaxScore === null ? null : parseFloat(rawMaxScore.toString());
  const completionStatus = variableValue(computedItem, 'completionStatus') as string;
  const response = variableValue(computedItem, 'RESPONSE') || '';
  const numAttempts = Number(variableValue(computedItem, 'numAttempts')) || 0;

  // Optimality comes from the last *ended attempt*, never from a live mid-attempt selection.
  // `test-navigation` seeds the latch once from a restored context, which still holds the submitted
  // response; before that, an item with no ended attempt is assessed on what it holds.
  const latched = inputs.optimality.get(item.identifier);
  const optimality = latched ?? (itemContext ? assessOptimality(itemContext) : 'unscored');

  return {
    ...computedItem,
    completionStatus,
    numAttempts,
    score,
    response,
    index,
    active: inputs.sessionContext?.navItemRefId === item.identifier,
    // Published by the item. One that is not on screen has nothing to be invalid.
    valid: itemContext?.valid ?? true,
    isDefaultResponse: isDefaultResponse(itemContext),
    maxScore,
    done: isItemDone(
      numAttempts,
      optimality,
      computedItem.sessionControl?.maxAttempts,
      computedItem.adaptive,
      completionStatus
    ),
    // Reflects the last *ended* attempt only: the latch, not the fallback above.
    optimal: latched === 'optimal'
  } as ComputedItem;
}

function itemContextFor(inputs: ComputedContextInputs, identifier: string): ItemContext | undefined {
  return inputs.testContext?.items?.find(item => item.identifier === identifier);
}

function variableValue(item: { variables?: ItemContext['variables'] } | undefined, identifier: string) {
  return item?.variables?.find(variable => variable.identifier === identifier)?.value;
}

/** An item's facts as `computedContext` carries them; nothing until the item is fetched. */
function factsFor(
  itemFacts: ItemFactsByRef | undefined,
  identifier: string
): Partial<Omit<ItemFacts, 'identifier'>> & { assessmentItemIdentifier?: string } {
  const facts = itemFacts?.get(identifier);
  if (!facts) return {};
  const { identifier: assessmentItemIdentifier, ...rest } = facts;
  return { ...rest, assessmentItemIdentifier };
}

/** Item numbers in document order, skipping info items; null for an info item. */
function indexesInDocumentOrder(items: ItemRefModel[], infoItemCategory: string | undefined) {
  let index = 1;
  return new Map(
    items.map(item => [item.identifier, item.categories.includes(infoItemCategory) ? null : index++] as const)
  );
}

/** Every response still holds its default (or the base type's empty value): nothing answered. */
function isDefaultResponse(itemContext: ItemContext | undefined): boolean {
  const responseVariables =
    itemContext?.variables?.filter(v => v.type === 'response' && v.identifier !== 'numAttempts') || [];
  return responseVariables.every(v => {
    if (v.value === undefined || v.value === null) return true;
    let fallbackValue: string;
    switch (v.baseType) {
      case 'integer':
      case 'float':
      case 'duration':
        fallbackValue = '0';
        break;
      case 'boolean':
        fallbackValue = 'false';
        break;
      default:
        fallbackValue = '';
        break;
    }
    const defaultValue = v.defaultValue ?? fallbackValue;
    if (Array.isArray(v.value)) {
      const dv = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      return v.value.length === dv.length && v.value.every((val, i) => val === dv[i]);
    }
    return v.value === defaultValue;
  });
}

/**
 * Decide whether an item should be treated as "the candidate is done with it"
 * for the purpose of gating forward navigation and further attempts.
 *
 * - The candidate must have actually ended an attempt (numAttempts > 0).
 * - Once attempted, the item is done if they reached the optimal outcome
 *   ('optimal'), or there's nothing to improve on ('unscored'). It is only *not*
 *   done while a better attempt is still possible ('suboptimal') and attempts
 *   remain — see `assessOptimality` for how "optimal" is determined.
 *
 * `optimality` reflects the last *ended attempt*, not the live selection — so a
 * freshly-picked optimal answer doesn't count as done until test-end-attempt
 * evaluates it.
 *
 * Adaptive items decide this themselves: max-attempts does not apply to them
 * (QTI 3, itemSessionControl), and a wrong attempt may be the step that leads
 * on to the next part of the item. They are done once their response
 * processing sets completionStatus to 'completed'.
 */
export function isItemDone(
  numAttempts: number,
  optimality: ItemOptimality,
  maxAttempts: number | undefined,
  adaptive?: boolean,
  completionStatus?: string
): boolean {
  if (numAttempts === 0) return false;
  if (adaptive) return completionStatus === 'completed';
  if (optimality !== 'suboptimal') return true;
  const max = maxAttempts ?? 1;
  return max > 0 && numAttempts >= max;
}

/**
 * Decide whether an item's submission is as good as it can get — i.e. the
 * candidate reached the *optimal* outcome, so there's no reason to make them
 * try again. 'optimal' means best achievable, 'suboptimal' means a better
 * attempt is still possible, 'unscored' means there's nothing to judge against.
 * ("optimal" is the spec's own word — a qti-correct-response is defined as
 * "the (or an) optimal value".)
 *
 * Two signals, in order of authority:
 *  1. The scored outcome: optimal ⟺ SCORE has reached its maximum (MAXSCORE).
 *     This correctly handles partial-credit / qti-mapping items, where an exact
 *     response match would under- or over-judge.
 *  2. The declared qti-correct-response, for items that aren't scored (no
 *     SCORE/MAXSCORE) — an exact match is the best available proxy. Bookkeeping
 *     variables like numAttempts can be typed 'response' but never declare a
 *     correctResponse, so we filter on a declared correctResponse.
 *
 * Items with neither a comparable score nor a correctResponse (essays, info
 * items, etc.) are 'unscored' — there's no optimal value to require, so one
 * attempt is enough.
 */
export function assessOptimality(item: ItemContext): ItemOptimality {
  const variables = item.variables ?? [];

  const score = numericVariable(variables, 'SCORE');
  const maxScore = numericVariable(variables, 'MAXSCORE');
  if (score !== null && maxScore !== null) {
    return score >= maxScore ? 'optimal' : 'suboptimal';
  }

  const responseVars = variables.filter(
    (v): v is ResponseVariable =>
      v.type === 'response' &&
      (v as ResponseVariable).correctResponse !== undefined &&
      (v as ResponseVariable).correctResponse !== null
  );
  if (responseVars.length === 0) return 'unscored';
  const allMatch = responseVars.every(v => {
    const expected = v.correctResponse;
    const actual = v.value;
    if (actual === undefined || actual === null) return false;
    if (Array.isArray(expected) && Array.isArray(actual)) {
      return expected.length === actual.length && expected.every(e => actual.includes(e));
    }
    if (Array.isArray(expected) || Array.isArray(actual)) return false;
    return expected === actual;
  });
  return allMatch ? 'optimal' : 'suboptimal';
}

/** Read a single numeric outcome value, or null when absent / non-numeric. */
function numericVariable(variables: ItemContext['variables'], identifier: string): number | null {
  const raw = variables?.find(v => v.identifier === identifier)?.value;
  if (raw === undefined || raw === null || Array.isArray(raw)) return null;
  const parsed = parseFloat(raw.toString());
  return Number.isNaN(parsed) ? null : parsed;
}
