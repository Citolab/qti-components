import { expect } from 'storybook/test';

import { getItemByUri } from '@qti-components/loader';

import { RESULTS_REPORTING_UC2 } from './results-reporting.fixtures';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * **Scoring per attempt, against 1EdTech's reference results.** The 1EdTech QTI 3 conformance suite
 * (Elective / Results Reporting, Use Case 2) has eleven items and eight runs of a candidate through
 * them. For every attempt, a reference result file says what the candidate answered and what the
 * item must hold afterwards.
 *
 * Each story replays one run. Per attempt it:
 *
 * 1. gives the item the candidate's answer from the reference,
 * 2. ends the attempt (response processing runs),
 * 3. checks the item against the reference: `numAttempts`, `completionStatus` and every outcome the
 *    reference lists (`SCORE`, `MAXSCORE`, …).
 *
 * That proves three rules of this branch with numbers that are not ours: an attempt is counted when
 * it ends (QTI info model §2.2.2.2), a non-adaptive item is `completed` once an attempt ended
 * (§2.2.2.3, as the reference expects), and outcomes reset to their defaults before every run (§2.5),
 * so a second attempt is scored on its own.
 *
 * Not tested here, and not implemented in the library: producing a results report. The test-level
 * part of the reference (`testResult`, `duration`) is skipped, and the answers are restored through
 * the host API, not clicked.
 */
const meta: Meta = {
  title: 'QTI behaviour/Conformance/Scoring per attempt (Results Reporting reference)',
  tags: ['!autodocs']
};
export default meta;

type Story = StoryObj;

/** What the candidate does in each run of the reference. */
const RUNS: Record<number, string> = {
  1: 'everything right, one attempt per item',
  2: 'everything wrong (the match item partly right), one attempt per item',
  3: 'some right, several left unanswered, one attempt per item',
  4: 'unanswered and wrong answers mixed, one attempt per item',
  5: 'wrong first, right on the second attempt',
  6: 'right first, wrong on the second attempt: the last attempt counts',
  7: 'first and second attempts mixed',
  8: 'the candidate stops after three items'
};

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

/** `RESPONSE = ChoiceA`, `RESPONSE = H, O` or `no answer`, for a step name. */
const describeAnswer = (responses: Element[]) => {
  const given = responses
    .map(v => [v.getAttribute('identifier')!, valuesOf(v).filter(Boolean)] as const)
    .filter(([, values]) => values.length > 0);
  return given.length === 0 ? 'no answer' : given.map(([id, values]) => `${id} = ${values.join(', ')}`).join('; ');
};

/** `numAttempts 2, completionStatus completed, SCORE 1`, for a step name and the caption on screen. */
const describeExpected = (variables: Element[]) =>
  variables.map(v => `${v.getAttribute('identifier')} ${valuesOf(v).join(', ') || '(empty)'}`).join(', ');

const runStory = (run: number): Story => ({
  parameters: { docs: { description: { story: `Run ${run} of the reference: ${RUNS[run]}.` } } },
  render: () => {
    const host = document.createElement('div');
    host.dataset.testid = 'host';
    return host;
  },
  play: async ({ canvasElement, step }) => {
    const host = canvasElement.querySelector<HTMLElement>('[data-testid=host]')!;
    const reference = new DOMParser().parseFromString(
      await (await fetch(`${RESULTS_REPORTING_UC2}reference/test-run-${run}.xml`)).text(),
      'application/xml'
    );

    /** Each item once, with a caption above it that shows the last attempt and how it compared. */
    const items = new Map<string, { item: QtiAssessmentItem; caption: HTMLElement }>();
    const itemFor = async (identifier: string) => {
      let entry = items.get(identifier);
      if (!entry) {
        const item = await getItemByUri(`${RESULTS_REPORTING_UC2}items/${identifier}.xml`);
        const caption = document.createElement('p');
        caption.style.fontWeight = 'bold';
        caption.textContent = `${item.getAttribute('data-title') ?? item.getAttribute('title') ?? identifier}: not attempted yet`;
        host.append(caption, item);
        await item.updateComplete;
        await new Promise(resolve => setTimeout(resolve));
        entry = { item, caption };
        items.set(identifier, entry);
      }
      return entry;
    };

    for (const result of Array.from(reference.querySelectorAll('itemResult'))) {
      const identifier = result.getAttribute('identifier')!;
      const { item, caption } = await itemFor(identifier);
      const title = item.getAttribute('data-title') ?? item.getAttribute('title') ?? identifier;
      const variables = Array.from(result.children);
      const attempt = valuesOf(result.querySelector('[identifier=numAttempts]')!)[0];
      const responses = variables.filter(
        v => v.localName === 'responseVariable' && !['numAttempts', 'duration'].includes(v.getAttribute('identifier')!)
      );
      const checked = variables.filter(v => {
        const name = v.getAttribute('identifier')!;
        return !SESSION_ONLY.has(name) && (v.localName !== 'responseVariable' || name === 'numAttempts');
      });

      await step(`${title}, attempt ${attempt}`, async () => {
        await step(`The candidate answers: ${describeAnswer(responses)}`, async () => {
          // As a host restoring the candidate's answer would hand it over.
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
        });

        await step('The attempt ends: response processing runs', () => {
          item.processResponse(true, false);
        });

        await step(`The item matches the reference: ${describeExpected(checked)}`, () => {
          caption.textContent = `${title}, attempt ${attempt}: ${describeExpected(checked)}`;
          for (const v of checked) {
            const name = v.getAttribute('identifier')!;
            const actual = item.variables.find(x => x.identifier === name)?.value;
            const [got, want] = comparable(
              actual,
              valuesOf(v),
              v.getAttribute('cardinality'),
              v.getAttribute('baseType')
            );
            expect(got, `${title} attempt ${attempt}: ${name}`).toEqual(want);
          }
        });
      });
    }
  }
});

// Names written out: Storybook reads a story's name only from the export itself.
export const TestRun1: Story = { ...runStory(1), name: 'Run 1: everything right' };
export const TestRun2: Story = { ...runStory(2), name: 'Run 2: everything wrong' };
export const TestRun3: Story = { ...runStory(3), name: 'Run 3: some right, some unanswered' };
export const TestRun4: Story = { ...runStory(4), name: 'Run 4: unanswered and wrong' };
export const TestRun5: Story = { ...runStory(5), name: 'Run 5: wrong, then right on the second attempt' };
export const TestRun6: Story = { ...runStory(6), name: 'Run 6: right, then wrong on the second attempt' };
export const TestRun7: Story = { ...runStory(7), name: 'Run 7: first and second attempts mixed' };
export const TestRun8: Story = { ...runStory(8), name: 'Run 8: stops after three items' };
