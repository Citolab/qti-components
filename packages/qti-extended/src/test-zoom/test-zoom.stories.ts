import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import '../../../../.storybook/utilities.css';
import { SHOWCASE_TEST } from '../showcase.fixtures';

import type { TestZoomIn } from './test-zoom';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes } = getStorybookHelpers('test-zoom-in');

type Story = StoryObj<TestZoomIn & typeof args>;

/**
 * The **zoom** plugin scales the items for a candidate who wants the text and the pictures larger:
 * `<test-zoom-out>`, `<test-zoom-reset>` (it shows the level) and `<test-zoom-in>`. The level lives in the
 * test's state under `session.plugins.zoom`, so a host that stores `state` stores it and a reloaded test
 * shows the items at the same size.
 *
 * The items are scaled with the CSS `zoom` property on each rendered `qti-assessment-item`; the page
 * around them does not move. `step`, `min` and `max` on a button set how far it goes. A `<test-stamp>`
 * reads the level as `test.plugins.zoom`.
 */
const meta: Meta<TestZoomIn> = {
  tags: ['autodocs'],
  title: 'QTI Test/Plugins/Zoom',
  component: 'test-zoom-in',
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
  tags: ['no-tests'],
  render: () =>
    html` <qti-test navigate="item">
      <test-navigation>
        <nav class="flex items-center gap-1 mb-2">
          <test-zoom-out title="Zoom uit">−</test-zoom-out>
          <test-zoom-reset title="Terug naar 100%"></test-zoom-reset>
          <test-zoom-in title="Zoom in">+</test-zoom-in>
          <test-prev class="ml-auto">Vorige</test-prev>
          <test-next>Volgende</test-next>
        </nav>
        <test-container test-url=${SHOWCASE_TEST} class="block h-[32rem] overflow-auto border rounded"></test-container>
      </test-navigation>
    </qti-test>`
};
