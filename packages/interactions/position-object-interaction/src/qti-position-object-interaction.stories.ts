import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import uk from './fixtures/uk.png';
import airport from './fixtures/airport.svg';

import type { QtiPositionObjectInteraction } from './qti-position-object-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-position-object-interaction', {
  excludeCategories: ['methods', 'events', 'properties']
});

type Story = StoryObj<QtiPositionObjectInteraction & typeof args>;

/**
 * ### [3.2.16 Position Object Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.7jm6la7pne1i)
 * A single image the candidate places, one or more times, on another image (the stage). The
 * response is the list of points where the object's centre point landed, in the stage image's
 * own coordinates.
 *
 * Drag the object onto the map, or click it and then click the map. With the keyboard: focus the
 * object and press Enter; move a placed copy with the arrow keys (Shift for bigger steps), remove
 * it with Delete. Drag a copy off the map to take it away.
 */
const meta: Meta<QtiPositionObjectInteraction> = {
  component: 'qti-position-object-interaction',
  title: 'Interactions/Position Object/Overview',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const Default: Story = {
  render: () =>
    html`<qti-position-object-stage>
      <img src=${uk} alt="Map of the United Kingdom" width="206" height="280" />
      ${template(
        { ...args, 'response-identifier': 'RESPONSE', 'max-choices': 3 },
        html`<img src=${airport} alt="Airport" width="30" height="30" />`
      )}
    </qti-position-object-stage>`
};
