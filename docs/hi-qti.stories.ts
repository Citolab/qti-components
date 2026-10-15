import '../.storybook/utilities.css';

import type { QtiTest, QtiTestState } from '@qti-components/test';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The players on the landing page. They are attached to `hi-qti.mdx` and hidden from the sidebar
 * (`!dev`): the page is the entry, these stories are only its demos.
 */
const meta: Meta = {
  title: 'Introduction/Hi QTI',
  tags: ['!dev']
};
export default meta;

/** Both players open on a real question, not on the info screen the examples test starts with. */
const startAt: QtiTestState = {
  version: 1,
  test: { items: [], outcomes: [] },
  session: { navItemRefId: 'ITM-choice' }
};

const mount = (markup: string) => {
  const root = document.createElement('div');
  root.innerHTML = markup;
  // Assigned while the test is detached: safe before or after it loads.
  root.querySelector<QtiTest>('qti-test')!.state = startAt;
  return root;
};

/** The smallest player: the item, and previous and next. */
export const Player: StoryObj = {
  render: () =>
    mount(`
      <qti-test navigate="item">
        <test-navigation>
          <div class="flex flex-col gap-3">
            <test-container test-url="/assets/api/examples/assessment.xml"></test-container>
            <nav class="flex items-center justify-between">
              <test-prev>previous</test-prev>
              <test-next>next</test-next>
            </nav>
          </div>
        </test-navigation>
      </qti-test>
    `)
};

/** The same player with a numbered link per item, so you can jump between the interaction types. */
export const WithPagination: StoryObj = {
  render: () =>
    mount(`
      <qti-test navigate="item">
        <test-navigation>
          <div class="flex flex-col gap-3">
            <test-container test-url="/assets/api/examples/assessment.xml"></test-container>
            <nav class="flex flex-wrap items-center gap-2">
              <test-prev>previous</test-prev>
              <test-stamp class="flex flex-wrap items-center justify-center gap-2 flex-1">
                <template>
                  <template type="repeat" repeat="{{ activeTestpart.items }}">
                    <test-item-link item-id="{{ item.identifier }}" class="{{ item.active ? 'active' : '' }}"
                      >{{ item.index }}</test-item-link
                    >
                  </template>
                </template>
              </test-stamp>
              <test-next>next</test-next>
            </nav>
          </div>
        </test-navigation>
      </qti-test>
    `)
};
