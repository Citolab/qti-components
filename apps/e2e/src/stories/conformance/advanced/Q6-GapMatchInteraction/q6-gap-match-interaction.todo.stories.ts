import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "Q6 - Gap Match Interaction" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `todo` tag: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'Testing/Conformance/advanced/Q-6 Gap Match Interaction',
  tags: ['todo'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const Q6_L2_D109: Story = {
  name: 'Q6-L2-D109',
  ...todo(
    'Q6-L2-D109',
    "Example gap-match-sv-3, the interaction with response-identifier RESPONSE2 has no max-associations attribute and no data-max-selections-message attribute. If a candidate attempts to make more than one association (they try to fill both gaps), the candidate should be presented with the delivery platform's default max-selections-message content which MUST be acknowledged by the candidate by either changing the number of selections or acknowledging the message by closing the message window or by other means of deliberate acknowledgement.",
    'qti3.0/Advanced/Q6 - Gap Match Interaction/README.md'
  )
};
