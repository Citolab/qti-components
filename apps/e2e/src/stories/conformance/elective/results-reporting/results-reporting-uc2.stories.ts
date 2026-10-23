import { expect } from 'storybook/test';

import { getItemByUri } from '@qti-components/loader';

import { RESULTS_REPORTING_UC2 } from './results-reporting.fixtures';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * 1EdTech QTI 3 conformance, Elective / Results Reporting, Conformance Use Case 2: eight runs of an
 * eleven-item test (single and multiple attempts, skipped items, wrong and right answers), each
 * with a reference result file. Every `itemResult` in a reference file is one attempt.
 *
 * For each attempt the story hands the item the candidate's responses from the reference, ends the
 * attempt with `processResponse()` and compares what the item then holds with the reference:
 * `numAttempts` (the item counts per attempt), `completionStatus` (`completed` once an attempt of a
 * non-adaptive item ended) and every outcome the reference reports, such as `SCORE`, which only
 * matches on a second attempt if the outcomes were reset to their defaults before processing.
 */
const meta: Meta = {
  title: 'Testing/Conformance/elective/Results Reporting - Use Case 2',
  tags: ['!autodocs']
};
export default meta;

type Story = StoryObj;

/** Not variables of the item but of the session; the item does not keep them. */
const SESSION_ONLY = new Set(['duration']);

const valuesOf = (variable: Element) =>
  Array.from(variable.querySelectorAll(':scope > candidateResponse > value, :scope > value'), v => v.textContent ?? '');

/** Both sides as comparable string lists: numbers normalised, unordered containers sorted. */
const comparable = (
  actual: unknown,
  expected: string[],
  cardinality: string | null,
  baseType: string | null
): [string[], string[]] => {
  const list = Array.isArray(actual)
    ? actual.map(String)
    : actual === null || actual === undefined
      ? []
      : [String(actual)];
  const numeric = baseType === 'float' || baseType === 'integer';
  const normal = (v: string) => (numeric ? String(Number(v)) : v.trim());
  const keepOrder = cardinality === 'ordered' || cardinality === 'single';
  const prepare = (values: string[]) => (keepOrder ? values.map(normal) : values.map(normal).sort());
  return [prepare(list), prepare(expected)];
};

const runStory = (run: number): Story => ({
  name: `Test run ${run}`,
  render: () => {
    const host = document.createElement('div');
    host.dataset.testid = 'host';
    return host;
  },
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector<HTMLElement>('[data-testid=host]')!;
    const reference = new DOMParser().parseFromString(
      await (await fetch(`${RESULTS_REPORTING_UC2}reference/test-run-${run}.xml`)).text(),
      'application/xml'
    );

    const items = new Map<string, QtiAssessmentItem>();
    const itemFor = async (identifier: string) => {
      let item = items.get(identifier);
      if (!item) {
        item = await getItemByUri(`${RESULTS_REPORTING_UC2}items/${identifier}.xml`);
        host.appendChild(item);
        await item.updateComplete;
        await new Promise(resolve => setTimeout(resolve));
        items.set(identifier, item);
      }
      return item;
    };

    for (const result of Array.from(reference.querySelectorAll('itemResult'))) {
      const identifier = result.getAttribute('identifier')!;
      const item = await itemFor(identifier);
      const variables = Array.from(result.children);
      const responses = variables.filter(
        v => v.localName === 'responseVariable' && !['numAttempts', 'duration'].includes(v.getAttribute('identifier')!)
      );

      // The candidate's responses for this attempt, as a host restoring them would hand them over.
      item.variables = responses.map(v => {
        const values = valuesOf(v);
        const single = v.getAttribute('cardinality') === 'single';
        return {
          identifier: v.getAttribute('identifier')!,
          value: single ? (values[0] ?? null) : values.length ? values : null,
          type: 'response' as const
        };
      });
      await item.updateComplete;
      item.processResponse(true, false);

      for (const v of variables) {
        const name = v.getAttribute('identifier')!;
        if (SESSION_ONLY.has(name) || (v.localName === 'responseVariable' && name !== 'numAttempts')) continue;
        const actual = item.variables.find(x => x.identifier === name)?.value;
        const [got, want] = comparable(actual, valuesOf(v), v.getAttribute('cardinality'), v.getAttribute('baseType'));
        expect(
          got,
          `${identifier} attempt ${valuesOf(result.querySelector('[identifier=numAttempts]')!)[0]}: ${name}`
        ).toEqual(want);
      }
    }
  }
});

export const TestRun1 = runStory(1);
export const TestRun2 = runStory(2);
export const TestRun3 = runStory(3);
export const TestRun4 = runStory(4);
export const TestRun5 = runStory(5);
export const TestRun6 = runStory(6);
export const TestRun7 = runStory(7);
export const TestRun8 = runStory(8);
