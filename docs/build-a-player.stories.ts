import '../.storybook/utilities.css';

import type { QtiTest, QtiTestState } from '@qti-components/test';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The players on the "Build a player" page, one per step. They are attached to `build-a-player.mdx`
 * and hidden from the sidebar (`!dev`): the page is the entry, these stories are its demos.
 */
const meta: Meta = {
  title: 'Implementation/Build a player',
  tags: ['!dev']
};
export default meta;

/** Every step opens on a real question, not on the info screen the example test starts with. */
const startAt: QtiTestState = {
  version: 1,
  test: { items: [], outcomes: [] },
  session: { navItemRefId: 'ITM-choice' }
};

/** The markup as an element, so the demo and its shown source are the player itself, no wrapper. */
const mount = (markup: string) => {
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  // Imported into the page's document so the elements upgrade now and `state` reaches the real setter.
  const fragment = document.importNode(template.content, true);
  // Assigned while the test is detached: safe before or after it loads.
  fragment.querySelector<QtiTest>('qti-test')!.state = startAt;
  return fragment;
};

/** Step 1: the test, the item on screen, previous and next. */
export const Skeleton: StoryObj = {
  render: () =>
    mount(`
      <qti-test navigate="item">
        <test-navigation class="flex flex-col gap-2 w-full aspect-4/3">
          <test-container class="flex-1 min-h-0 overflow-auto" test-url="/assets/api/examples/assessment.xml"></test-container>
          <nav class="flex justify-between">
            <test-prev>Previous</test-prev>
            <test-next>Next</test-next>
          </nav>
        </test-navigation>
      </qti-test>
    `)
};

/** Step 2: a stamp in the header says where the candidate is. */
export const Progress: StoryObj = {
  render: () =>
    mount(`
      <qti-test navigate="item">
        <test-navigation class="flex flex-col gap-2 w-full aspect-4/3">
          <header>
            <test-stamp>
              <template>
                <strong>{{ test.title }}</strong>, question {{ activeItem.index }} of {{ activeTestpart.items.length }}
              </template>
            </test-stamp>
          </header>
          <test-container class="flex-1 min-h-0 overflow-auto" test-url="/assets/api/examples/assessment.xml"></test-container>
          <nav class="flex justify-between">
            <test-prev>Previous</test-prev>
            <test-next>Next</test-next>
          </nav>
        </test-navigation>
      </qti-test>
    `)
};

/** Step 3: a stamp with a repeat draws one link per item, the active one marked. */
export const Navigation: StoryObj = {
  render: () =>
    mount(`
      <qti-test navigate="item">
        <test-navigation class="flex flex-col gap-2 w-full aspect-4/3">
          <header>
            <test-stamp>
              <template>
                <strong>{{ test.title }}</strong>, question {{ activeItem.index }} of {{ activeTestpart.items.length }}
              </template>
            </test-stamp>
          </header>
          <test-container class="flex-1 min-h-0 overflow-auto" test-url="/assets/api/examples/assessment.xml"></test-container>
          <nav class="flex items-center gap-2">
            <test-prev>Previous</test-prev>
            <test-stamp class="flex flex-1 flex-wrap justify-center gap-1">
              <template>
                <template type="repeat" repeat="{{ activeTestpart.items }}">
                  <test-item-link item-id="{{ item.identifier }}" class="{{ item.active ? 'active' : '' }}"
                    >{{ item.index }}</test-item-link
                  >
                </template>
              </template>
            </test-stamp>
            <test-next>Next</test-next>
          </nav>
        </test-navigation>
      </qti-test>
    `)
};
