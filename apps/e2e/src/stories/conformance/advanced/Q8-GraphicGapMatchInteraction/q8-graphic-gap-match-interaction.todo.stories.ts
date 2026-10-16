import { todo } from '../../conformance-todo';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

/**
 * Criteria of the suite's "Q8 - Graphic Gap Match Interaction" sample (Advanced profile) that nothing tests yet. Each story is an
 * empty placeholder named by its criterion ID. To test one, give it a `play` that asserts what the
 * criterion says and remove the `todo` tag: the QTI 3 conformance page counts
 * it as tested from then on.
 */
const meta: Meta = {
  title: 'Testing/Conformance/advanced/Q-8 Graphic Gap Match Interaction',
  tags: ['todo'],
  parameters: { controls: { disable: true }, a11y: { test: 'off' } }
};
export default meta;

export const Q8_L2_D109: Story = {
  name: 'Q8-L2-D109',
  ...todo(
    'Q8-L2-D109',
    'Example graphic-gap-match-sv-4, the interaction with response-identifier RESPONSE2 uses the qti-selections-light an data-choices-container-width and qti-unselected-hidden shared vocabulary terms. The choice container must be visually displayed at 376 pixels wide at a 100% zoom level. The delivery platform MUST implement associable hotspot selections that are visually hidden (no visual border and no fill) unless a candidate is actively attempting to match gap choices with the selections. When actively attempting to match choices with selections, the response areas MUST be presented using light hotspot selections for use on a dark background.',
    'qti3.0/Advanced/Q8 - Graphic Gap Match Interaction/README.md'
  )
};
