import { expect, waitFor, within } from 'storybook/test';

import { getItemByUri } from '@qti-components/loader';

import drag from '../../../../../../../tools/testing/drag';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiMatchInteraction } from '@qti-components/interactions';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * The DELIVER criteria of the suite's "Q13 - Match Interaction" sample (Advanced profile), run against
 * the suite's own items (`match-example-*.xml`, copied unchanged from 1EdTech/qti-conformance).
 */
const meta: Meta<QtiAssessmentItem> = {
  title: 'Testing/Conformance/advanced/Q13 - Match Interaction',
  parameters: { controls: { disable: true } }
};
export default meta;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const loadItem = (file: string) => async () => ({
  xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q13/${file}`)
});

const render: Story['render'] = (_, { loaded: { xml } }) => xml;

const getInteraction = (canvasElement: HTMLElement, responseIdentifier = 'RESPONSE') => {
  const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
  const interaction = assessmentItem.querySelector(
    `qti-match-interaction[response-identifier="${responseIdentifier}"]`
  ) as QtiMatchInteraction;
  const [sourceSet, targetSet] = Array.from(interaction.querySelectorAll<HTMLElement>(':scope > qti-simple-match-set'));
  const source = (id: string) =>
    sourceSet.querySelector<HTMLElement>(`qti-simple-associable-choice[identifier="${id}"]`)!;
  const target = (id: string) =>
    targetSet.querySelector<HTMLElement>(`qti-simple-associable-choice[identifier="${id}"]`)!;
  const message = () => interaction.shadowRoot!.querySelector<HTMLElement>('#validation-message')!;
  // Drag-drop mode reports the pairs comma-joined; tabular mode as an array.
  const response = () => {
    const value = interaction.response as string | string[] | null;
    return (typeof value === 'string' ? value.split(',') : [...(value ?? [])]).filter(Boolean).sort();
  };
  return { assessmentItem, interaction, sourceSet, targetSet, source, target, message, response };
};

const variable = (item: QtiAssessmentItem, identifier: string) =>
  item.variables.find(v => v.identifier === identifier)?.value;

/** Makes each association by dragging the source choice onto the target choice. */
const associate = async (
  { source, target }: Pick<ReturnType<typeof getInteraction>, 'source' | 'target'>,
  pairs: string[]
) => {
  for (const pair of pairs) {
    const [from, to] = pair.split(' ');
    await drag(source(from), { to: target(to), duration: 100 });
  }
};

// ─── DELIVER: match-example-1 / match-example-2 ──────────────────────────────

/**
 * Present Match example 1 (match-example-1.xml): both match sets are shown, and matching every
 * character to the right play gives the full mapped score.
 */
export const Q13_L2_D1: Story = {
  name: 'Q13-L2-D1',
  render,
  play: async ({ canvasElement, step }) => {
    const ctx = getInteraction(canvasElement);
    await ctx.interaction.updateComplete;

    await step('Presents the prompt and both match sets', async () => {
      expect(ctx.interaction.querySelector('qti-prompt')).toBeVisible();
      for (const id of ['C', 'D', 'L', 'P']) expect(ctx.source(id)).toBeVisible();
      for (const id of ['M', 'R', 'T']) expect(ctx.target(id)).toBeVisible();
    });

    await step('Matching all four characters scores the mapped total', async () => {
      await associate(ctx, ['C R', 'D M', 'L M', 'P T']);
      expect(ctx.response()).toEqual(['C R', 'D M', 'L M', 'P T']);
      ctx.assessmentItem.processResponse();
      expect(Number(variable(ctx.assessmentItem, 'SCORE'))).toBe(3);
    });
  },
  loaders: [loadItem('match-example-1.xml')]
};

/**
 * > Q13-L2-D2: For delivery, Match example 2 (match-example-2.xml) should limit the number of choices to
 * > 3 associations (uses the max-associations attribute).
 *
 * The limit is enforced as QTI describes it: a max-selections message is rendered "upon violation of the
 * max-associations constraint" (vocabulary §1.2.8.3), so the candidate can go over it and is told so.
 */
export const Q13_L2_D2: Story = {
  name: 'Q13-L2-D2',
  render,
  play: async ({ canvasElement, step }) => {
    const ctx = getInteraction(canvasElement);
    await ctx.interaction.updateComplete;
    expect(ctx.interaction.maxAssociations).toBe(3);

    await step('The candidate makes 3 associations: within the limit', async () => {
      // Each target takes one, so no target's match-max="2" gets in the way.
      await associate(ctx, ['r1 h1', 'r2 h2', 'r3 h3']);
      expect(ctx.response()).toHaveLength(3);
      expect(ctx.message()).not.toBeVisible();
    });

    await step('A fourth association goes over the limit and is reported', async () => {
      await associate(ctx, ['r4 h1']);
      expect(ctx.response()).toHaveLength(4);
      expect(ctx.interaction.validate()).toBe(false);
      await waitFor(() => expect(ctx.message()).toBeVisible());
    });
  },
  loaders: [loadItem('match-example-2.xml')]
};

/**
 * In example 2 each animal type takes at most 2 animal attributes (match-max="2" on the second set):
 * a third attribute dropped on the same animal type is not added, although max-associations="3" would
 * still allow it.
 */
export const Q13_L2_D3: Story = {
  name: 'Q13-L2-D3',
  render,
  play: async ({ canvasElement }) => {
    const ctx = getInteraction(canvasElement);
    await ctx.interaction.updateComplete;
    expect(ctx.target('h1').getAttribute('match-max')).toBe('2');

    await associate(ctx, ['r1 h1', 'r2 h1']);
    expect(ctx.response()).toEqual(['r1 h1', 'r2 h1']);

    await associate(ctx, ['r3 h1']);
    expect(ctx.response()).toEqual(['r1 h1', 'r2 h1']);
  },
  loaders: [loadItem('match-example-2.xml')]
};

/**
 * The interaction is bound to a directedPair response with multiple cardinality: each association is
 * stored as "source target", the first set's choice first.
 */
export const Q13_L2_D4: Story = {
  name: 'Q13-L2-D4',
  render,
  play: async ({ canvasElement }) => {
    const ctx = getInteraction(canvasElement);
    await ctx.interaction.updateComplete;

    const declaration = ctx.assessmentItem.querySelector('qti-response-declaration[identifier="RESPONSE"]')!;
    expect(declaration.getAttribute('base-type')).toBe('directedPair');
    expect(declaration.getAttribute('cardinality')).toBe('multiple');

    await associate(ctx, ['P T', 'C R']);
    ctx.assessmentItem.processResponse();
    const value = variable(ctx.assessmentItem, 'RESPONSE') as string[];
    expect(Array.isArray(value)).toBe(true);
    expect([...value].sort()).toEqual(['C R', 'P T']);
  },
  loaders: [loadItem('match-example-1.xml')]
};

// ─── DELIVER: shared vocabulary, match-example-sv-1 (choice placement) ───────

const placement =
  (responseIdentifier: string, expectPlacement: (first: DOMRect, second: DOMRect) => void): Story['play'] =>
  async ({ canvasElement }) => {
    const { interaction, sourceSet, targetSet } = getInteraction(canvasElement, responseIdentifier);
    await interaction.updateComplete;
    expectPlacement(sourceSet.getBoundingClientRect(), targetSet.getBoundingClientRect());
  };

/** RESPONSE1, qti-choices-top: the first match set is displayed above the second. */
export const Q13_L2_D101: Story = {
  name: 'Q13-L2-D101',
  render,
  play: placement('RESPONSE1', (first, second) => expect(first.bottom).toBeLessThanOrEqual(second.top)),
  loaders: [loadItem('match-example-sv-1.xml')]
};

/** RESPONSE2, qti-choices-bottom: the first match set is displayed below the second. */
export const Q13_L2_D102: Story = {
  name: 'Q13-L2-D102',
  render,
  play: placement('RESPONSE2', (first, second) => expect(first.top).toBeGreaterThanOrEqual(second.bottom)),
  loaders: [loadItem('match-example-sv-1.xml')]
};

/** RESPONSE3, qti-choices-left: the first match set is displayed to the left of the second. */
export const Q13_L2_D103: Story = {
  name: 'Q13-L2-D103',
  render,
  play: placement('RESPONSE3', (first, second) => expect(first.right).toBeLessThanOrEqual(second.left)),
  loaders: [loadItem('match-example-sv-1.xml')]
};

/** RESPONSE4, qti-choices-right: the first match set is displayed to the right of the second. */
export const Q13_L2_D104: Story = {
  name: 'Q13-L2-D104',
  render,
  play: placement('RESPONSE4', (first, second) => expect(first.left).toBeGreaterThanOrEqual(second.right)),
  loaders: [loadItem('match-example-sv-1.xml')]
};

// ─── DELIVER: shared vocabulary, match-example-sv-2 (tabular) ────────────────

/** The column headers' and row headers' boxes, and the answer cells, of a tabular interaction. */
const tabular = (interaction: QtiMatchInteraction) => {
  const grid = interaction.shadowRoot!.querySelector<HTMLElement>('[part="grid"]')!;
  const cells = Array.from(interaction.shadowRoot!.querySelectorAll<HTMLElement>('[part="input-cell"]'));
  const corner = interaction.shadowRoot!.querySelector<HTMLElement>('[part="corner"]')!;
  return { grid, cells, corner };
};

/**
 * RESPONSE1, qti-match-tabular: a table with the first set's choices as row headers and the second
 * set's as column headers.
 *
 * The suite asks for `role="presentation"`; this renderer exposes the table as an ARIA grid with row and
 * column headers instead, so assistive technology can announce which row and column a cell answers. The
 * story asserts the table's structure, which is what the criterion is about.
 */
export const Q13_L2_D105: Story = {
  name: 'Q13-L2-D105',
  render,
  play: async ({ canvasElement, step }) => {
    const ctx = getInteraction(canvasElement, 'RESPONSE1');
    await ctx.interaction.updateComplete;
    const { grid, cells } = tabular(ctx.interaction);

    await step('Renders a 4 × 3 table', async () => {
      expect(grid).toBeVisible();
      expect(cells).toHaveLength(4 * 3);
    });

    await step('The first set heads the rows, the second set the columns', async () => {
      for (const id of ['C', 'D', 'L', 'P']) expect(ctx.source(id)).toHaveAttribute('role', 'rowheader');
      for (const id of ['M', 'R', 'T']) expect(ctx.target(id)).toHaveAttribute('role', 'columnheader');

      const firstRow = ctx.source('C').getBoundingClientRect();
      const lastRow = ctx.source('P').getBoundingClientRect();
      const firstCol = ctx.target('M').getBoundingClientRect();
      const lastCol = ctx.target('T').getBoundingClientRect();
      expect(firstRow.top).toBeLessThan(lastRow.top);
      expect(firstCol.left).toBeLessThan(lastCol.left);
      // Row headers sit left of the columns, column headers above the rows.
      expect(firstRow.right).toBeLessThanOrEqual(firstCol.left);
      expect(firstCol.bottom).toBeLessThanOrEqual(firstRow.top);
    });

    await step('Checking a cell stores that row-column pair', async () => {
      ctx.interaction.shadowRoot!.querySelector<HTMLInputElement>('input[value="C R"]')!.click();
      await waitFor(() => expect(ctx.response()).toEqual(['C R']));
    });
  },
  loaders: [loadItem('match-example-sv-2.xml')]
};

/**
 * > match-example-sv-2.xml , **RESPONSE2** : demonstrates **qti-match-tabular** combined with
 * > **qti-header-hidden** shared vocabulary classes. The presentation/delivery system MUST render a visual
 * > table (role="presentation") with the choices of the first Simple Match Set as the table row headers,
 * > and the choices of the second Simple Match Set as the columns, but the simple-associable-choice values
 * > MUST NOT be presented visually in the column headers (though they MUST be identifiable by
 * > screen-readers -- this example uses aria-label) in the top row.
 *
 * Vocabulary §1.2.8.2: "Do not display the top row of the table where the column headers are
 * displayed." Its Figure 67 shows a table "4 columns wide and 4 rows high", so the whole top row goes,
 * the top-left cell with it. The table is an ARIA grid rather than `role="presentation"`: see D105.
 *
 * Known to fail: qti-header-hidden leaves the top row out with `display: none`, which also takes the
 * column headers out of the accessibility tree, so screen readers cannot identify the columns. Kept
 * that way by decision (2026-10-23).
 */
export const Q13_L2_D106: Story = {
  name: 'Q13-L2-D106',
  tags: ['xfail'],
  render,
  play: async ({ canvasElement, step }) => {
    const ctx = getInteraction(canvasElement, 'RESPONSE2');
    await ctx.interaction.updateComplete;
    expect(ctx.interaction).toHaveClass('qti-header-hidden');
    const { grid, cells } = tabular(ctx.interaction);

    await step('The candidate sees the characters as row headers', async () => {
      for (const id of ['C', 'D', 'L', 'P']) expect(ctx.source(id)).toBeVisible();
    });

    await step('The candidate sees no column-header row: the answer cells start at the top of the table', async () => {
      expect(cells).toHaveLength(4 * 3);
      expect(cells[0].getBoundingClientRect().top - grid.getBoundingClientRect().top).toBeLessThanOrEqual(1);
      for (const id of ['M', 'R', 'T']) {
        const header = ctx.target(id);
        header.scrollIntoView({ block: 'center' });
        const { left, top, width, height } = header.getBoundingClientRect();
        // Nothing of the header is painted where it lies: that point hits something else.
        expect(document.elementsFromPoint(left + width / 2, top + height / 2)).not.toContain(header);
      }
    });

    await step('A screen reader still identifies each column by its aria-label', async () => {
      for (const id of ['M', 'R', 'T']) {
        const label = ctx.target(id).getAttribute('aria-label')!;
        expect(within(ctx.interaction).getByRole('columnheader', { name: label })).toBe(ctx.target(id));
        // getByRole walks light-DOM parents only; a display:none or visibility:hidden ancestor in the
        // shadow root also takes the header out of the accessibility tree, and checkVisibility sees it.
        expect(ctx.target(id).checkVisibility({ visibilityProperty: true })).toBe(true);
      }
    });
  },
  loaders: [loadItem('match-example-sv-2.xml')]
};

/**
 * > match-example-sv-2.xml , **RESPONSE3** demonstrates **data-qti-first-column-header** shared vocabulary
 * > attribute in combination with the **qti-match-tabular** class. The presentation/delivery system MUST
 * > render a visual table (role="presentation") with the choices of the first Simple Match Set as the
 * > table row headers, and the choices of the second Simple Match Set as the table column headers.
 * > Additionally, the first row, first column value MUST be the text string provided in the
 * > data-qti-first-column-header attribute.
 *
 * The suite's own item, the information model (§5.89) and the vocabulary (§1.2.8.2) all name the
 * attribute `data-first-column-header`; `data-qti-first-column-header` occurs only in this README line.
 * The vocabulary adds: "Custom text to be rendered in the top-left header cell of the table (headings
 * must be visible)." The table is an ARIA grid rather than `role="presentation"`: see D105.
 */
export const Q13_L2_D107: Story = {
  name: 'Q13-L2-D107',
  render,
  play: async ({ canvasElement, step }) => {
    const ctx = getInteraction(canvasElement, 'RESPONSE3');
    await ctx.interaction.updateComplete;
    expect(ctx.interaction).toHaveAttribute('data-first-column-header', 'Characters');
    const { corner } = tabular(ctx.interaction);

    await step('The candidate sees "Characters" in the first row, first column of the table', async () => {
      expect(corner).toHaveTextContent('Characters');
      expect(corner).toBeVisible();
      const cornerBox = corner.getBoundingClientRect();
      // Above the row headers, left of the column headers.
      expect(cornerBox.bottom).toBeLessThanOrEqual(ctx.source('C').getBoundingClientRect().top);
      expect(cornerBox.right).toBeLessThanOrEqual(ctx.target('M').getBoundingClientRect().left);
    });

    await step('The candidate still sees the characters as row headers and the plays as column headers', async () => {
      for (const id of ['C', 'D', 'L', 'P']) expect(ctx.source(id)).toBeVisible();
      for (const id of ['M', 'R', 'T']) expect(ctx.target(id)).toBeVisible();
    });
  },
  loaders: [loadItem('match-example-sv-2.xml')]
};

// ─── DELIVER: shared vocabulary, match-example-sv-3 (messages) ───────────────

/**
 * > **match-example-sv-3.xml , RESPONSE1** demonstrates **data-qti-max-selections-message** shared
 * > vocabulary attribute. The presentation/delivery interface MUST display the text string found in the
 * > shared vocabulary attribute within the interaction element when the item is submitted with values
 * > outside the stated **max-associations** value. The message MUST be acknowledged by the candidate by
 * > either changing the number of selections or acknowledging the message by closing the message window
 * > or by other means of deliberate acknowledgement.
 *
 * The item's attribute is `data-max-selections-message` (as in the vocabulary, §1.2.8.3).
 */
export const Q13_L2_D108: Story = {
  name: 'Q13-L2-D108',
  render,
  play: async ({ canvasElement, step }) => {
    const ctx = getInteraction(canvasElement, 'RESPONSE1');
    await ctx.interaction.updateComplete;

    await step('The candidate makes 5 associations, one over max-associations="4"', async () => {
      await associate(ctx, ['C M', 'D M', 'L M', 'P M', 'C R']);
      expect(ctx.response()).toHaveLength(5);
    });

    await step("Submitting shows the item's message within the interaction", async () => {
      ctx.assessmentItem.processResponse();
      await waitFor(() => expect(ctx.message()).toHaveTextContent('You cannot make more than 4 matches!'));
      expect(ctx.message()).toBeVisible();
    });

    await step('Changing the number of associations acknowledges the message', async () => {
      const placed = ctx.interaction.chipsIn(ctx.target('R'))[0];
      await drag(placed, { to: ctx.sourceSet, duration: 100 });
      expect(ctx.response()).toHaveLength(4);
      await waitFor(() => expect(ctx.message()).not.toBeVisible());
    });
  },
  loaders: [loadItem('match-example-sv-3.xml')]
};

/**
 * RESPONSE2, min-associations="2" + data-min-selections-message: submitting with fewer than 2
 * associations shows the custom min message.
 *
 * The suite's text says "ABOVE the min-associations value", which contradicts the attribute it
 * demonstrates; the story tests the reading that matches min-associations: below the minimum on submit.
 */
export const Q13_L2_D109: Story = {
  name: 'Q13-L2-D109',
  render,
  play: async ({ canvasElement }) => {
    const ctx = getInteraction(canvasElement, 'RESPONSE2');
    await ctx.interaction.updateComplete;

    await associate(ctx, ['C R']);
    ctx.assessmentItem.processResponse();
    await waitFor(() => expect(ctx.message()).toHaveTextContent('You must make at least 2 matches!'));
    expect(ctx.message()).toBeVisible();
  },
  loaders: [loadItem('match-example-sv-3.xml')]
};

/**
 * > **match-example-sv-3.xml , RESPONSE3** the interaction with response-identifier RESPONSE3 has no
 * > **max-associations** attribute and no **data-max-selections-message** attribute. If a candidate
 * > attempts to make more than one association the candidate should be presented with the delivery
 * > platform's default max-selections-message content which MUST be acknowledged by the candidate by
 * > either changing the number of selections or acknowledging the message by closing the message window
 * > or by other means of deliberate acknowledgement.
 *
 * The item says so itself: "The max-associations attribute is optional and defaults to a value of 1 when
 * unspecified." (information model §5.89: default 1). The message text is the platform's own, so the
 * story asserts that one is shown, not its wording.
 */
export const Q13_L2_D110: Story = {
  name: 'Q13-L2-D110',
  render,
  play: async ({ canvasElement, step }) => {
    const ctx = getInteraction(canvasElement, 'RESPONSE3');
    await ctx.interaction.updateComplete;
    expect(ctx.interaction).not.toHaveAttribute('data-max-selections-message');

    await step('The candidate makes one association', async () => {
      await associate(ctx, ['C R']);
      expect(ctx.response()).toEqual(['C R']);
      expect(ctx.message()).not.toBeVisible();
    });

    await step('Making a second association presents the default max-selections message', async () => {
      await associate(ctx, ['D M']);
      expect(ctx.response()).toEqual(['C R', 'D M']);
      await waitFor(() => expect(ctx.message()).toBeVisible());
      expect(ctx.message().textContent!.trim()).not.toBe('');
    });

    await step('Changing the number of associations acknowledges the message', async () => {
      const placed = ctx.interaction.chipsIn(ctx.target('M'))[0];
      await drag(placed, { to: ctx.sourceSet, duration: 100 });
      expect(ctx.response()).toEqual(['C R']);
      await waitFor(() => expect(ctx.message()).not.toBeVisible());
    });
  },
  loaders: [loadItem('match-example-sv-3.xml')]
};
