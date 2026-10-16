import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "Q13 - Match Interaction" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `todo` tag: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'Testing/Conformance/advanced/Q13 - Match Interaction',
  tags: ['todo'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const Q13_L2_D1: Story = {
  name: 'Q13-L2-D1',
  ...todo(
    'Q13-L2-D1',
    'Present Match example 1 (match-example-1.xml)',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D2: Story = {
  name: 'Q13-L2-D2',
  ...todo(
    'Q13-L2-D2',
    'For delivery, Match example 2 (match-example-2.xml) should limit the number of choices to 3 associations (uses the max-associations attribute).',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D3: Story = {
  name: 'Q13-L2-D3',
  ...todo(
    'Q13-L2-D3',
    'For the choices in example 2, the candidate should be limited to placing only 2 instances of any of the first set of choices (animal attributes) into the animal types.',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D4: Story = {
  name: 'Q13-L2-D4',
  ...todo(
    'Q13-L2-D4',
    'The MatchInteraction must be bound to a response variable with base-type directedPair and either single or multiple cardinality.',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D101: Story = {
  name: 'Q13-L2-D101',
  ...todo(
    'Q13-L2-D101',
    'match-example-sv-1.xml , RESPONSE1 : demonstrates qti-choices-top shared vocabulary class. The first Simple Match Set choices MUST BE visually displayed ABOVE the second Simple Match Set choices.',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D102: Story = {
  name: 'Q13-L2-D102',
  ...todo(
    'Q13-L2-D102',
    'match-example-sv-1.xml , RESPONSE2 : demonstrates qti-choices-bottom shared vocabulary class. The first Simple Match Set choices MUST BE visually displayed BELOW the second Simple Match Set choices.',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D103: Story = {
  name: 'Q13-L2-D103',
  ...todo(
    'Q13-L2-D103',
    'match-example-sv-1.xml , RESPONSE3 : demonstrates qti-choices-left shared vocabulary class. The first Simple Match Set choices MUST BE visually displayed TO THE LEFT of the second Simple Match Set choices.',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D104: Story = {
  name: 'Q13-L2-D104',
  ...todo(
    'Q13-L2-D104',
    'match-example-sv-1.xml , RESPONSE4 : demonstrates qti-choices-right shared vocabulary class. The first Simple Match Set choices MUST BE visually displayed TO THE RIGHT of the second Simple Match Set choices.',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D105: Story = {
  name: 'Q13-L2-D105',
  ...todo(
    'Q13-L2-D105',
    'match-example-sv-2.xml , RESPONSE1 demonstrates qti-match-tabular shared vocabulary class. The presentation/delivery system MUST render a visual table (role="presentation") with the choices of the first Simple Match Set as the table row headers, and the choices of the second Simple Match Set as the table column headers.',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D106: Story = {
  name: 'Q13-L2-D106',
  ...todo(
    'Q13-L2-D106',
    'match-example-sv-2.xml , RESPONSE2 : demonstrates qti-match-tabular combined with qti-header-hidden shared vocabulary classes. The presentation/delivery system MUST render a visual table (role="presentation") with the choices of the first Simple Match Set as the table row headers, and the choices of the second Simple Match Set as the columns, but the simple-associable-choice values MUST NOT be presented visually in the column headers (though they MUST be identifiable by screen-readers -- this example uses aria-label) in the top row.',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D107: Story = {
  name: 'Q13-L2-D107',
  ...todo(
    'Q13-L2-D107',
    'match-example-sv-2.xml , RESPONSE3 demonstrates data-qti-first-column-header shared vocabulary attribute in combination with the qti-match-tabular class. The presentation/delivery system MUST render a visual table (role="presentation") with the choices of the first Simple Match Set as the table row headers, and the choices of the second Simple Match Set as the table column headers. Additionally, the first row, first column value MUST be the text string provided in the data-qti-first-column-header attribute.',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D108: Story = {
  name: 'Q13-L2-D108',
  ...todo(
    'Q13-L2-D108',
    'match-example-sv-3.xml , RESPONSE1 demonstrates data-qti-max-selections-message shared vocabulary attribute. The presentation/delivery interface MUST display the text string found in the shared vocabulary attribute within the interaction element when the item is submitted with values outside the stated max-associations value. The message MUST be acknowledged by the candidate by either changing the number of selections or acknowledging the message by closing the message window or by other means of deliberate acknowledgement.',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D109: Story = {
  name: 'Q13-L2-D109',
  ...todo(
    'Q13-L2-D109',
    'match-example-sv-3.xml , RESPONSE2 demonstrates data-qti-min-selections-message shared vocabulary attribute. In the presentation/delivery system, the text string within the attribute MUST be presented to the candidate when the candidate attempts to select the number of choices ABOVE the min-associations value - and - when the item is submitted with the number of choices selected which is ABOVE the max-choices value.',
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};

export const Q13_L2_D110: Story = {
  name: 'Q13-L2-D110',
  ...todo(
    'Q13-L2-D110',
    "match-example-sv-3.xml , RESPONSE3 the interaction with response-identifier RESPONSE3 has no max-associations attribute and no data-max-selections-message attribute. If a candidate attempts to make more than one association the candidate should be presented with the delivery platform's default max-selections-message content which MUST be acknowledged by the candidate by either changing the number of selections or acknowledging the message by closing the message window or by other means of deliberate acknowledgement.",
    'qti3.0/Advanced/Q13 - Match Interaction/README.md'
  )
};
