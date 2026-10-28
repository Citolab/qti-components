import { expect, fireEvent, waitFor } from 'storybook/test';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import '../../../../.storybook/utilities.css';
import { getAssessmentItemFromTestContainerByDataTitle } from '../../../../tools/testing/test-utils';
import { SHOWCASE_TEST } from '../showcase.fixtures';

import type { TestBookmark } from './test-bookmark';
import type { QtiTest } from '@citolab/qti-components/qti-test';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('test-bookmark');

type Story = StoryObj<TestBookmark & typeof args>;

/**
 * `<test-bookmark>` is a toggle that marks an item to come back to. It shows a bookmark icon, outlined
 * when the item is not marked and filled when it is, and it is a button (`role="button"`,
 * `aria-pressed`).
 *
 * The marks live in the test's state under `session.plugins.bookmarks`, so a host that stores `state`
 * stores them and a reloaded test shows them again. Nothing else in the test knows about them.
 *
 * - **In the toolbar** it marks the item on screen.
 * - **In a `<template item-ref>`** every item gets its own button, which marks that item.
 * - **With `item="…"`** it marks that item wherever it sits, for example next to each item of a list in a
 *   `<test-stamp>` template.
 *
 * To count or list the marks, read `test.plugins.bookmarks` in a `<test-stamp>` template, or
 * `bookmarkedItems(computedContext)` from code.
 */
const meta: Meta<TestBookmark> = {
  tags: ['autodocs'],
  title: 'QTI Test/Plugins/Bookmark',
  component: 'test-bookmark',
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
  render: args =>
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url=${SHOWCASE_TEST}></test-container>
        ${template(args)}
      </test-navigation>
    </qti-test>`
};

const TEST_URL = SHOWCASE_TEST;

/** The text of an element with its whitespace collapsed. */
const textOf = (element: Element | null | undefined) => element?.textContent?.replace(/\s+/g, ' ').trim();

/** Every match of `selector` below `root`, looking into shadow roots (the test keeps its items in one). */
const deepAll = <T extends Element>(root: ParentNode, selector: string): T[] => [
  ...root.querySelectorAll<T>(selector),
  ...[...root.querySelectorAll('*')].flatMap(el => (el.shadowRoot ? deepAll<T>(el.shadowRoot, selector) : []))
];

/**
 * A small player, one item at a time (`navigate="item"`): the bookmark in the header marks the item
 * on screen, and the numbered navigation in the footer shows a star on every item that is marked.
 * Marks stay with their item, and are part of the state a host stores.
 */
export const HorizontalPlayer: Story = {
  render: () => html`
    <qti-test navigate="item">
      <test-navigation>
        <div class="border rounded-lg bg-white p-0 flex flex-col h-[calc(100dvh-2rem)] overflow-hidden">
          <header class="flex items-center justify-between gap-3 px-3 py-2 border-b">
            <strong>Mini player</strong>
            <test-bookmark aria-label="Bookmark this item"></test-bookmark>
          </header>
          <div class="flex-1 min-h-0 overflow-auto p-4">
            <test-container test-url=${TEST_URL}></test-container>
          </div>
          <footer class="flex items-center justify-between gap-3 px-3 py-2 border-t">
            <test-prev>Previous</test-prev>
            <test-stamp class="flex flex-wrap gap-1">
              <template>
                <template type="repeat" repeat="{{ activeTestpart.items }}">
                  <test-item-link item-id="{{ item.identifier }}" class="{{ item.active ? 'active' : '' }}"
                    >{{ item.index }}<template type="if" if="{{ test.plugins.bookmarks.includes(item.identifier) }}"
                      >★</template
                    ></test-item-link
                  >
                </template>
              </template>
            </test-stamp>
            <test-next>Next</test-next>
          </footer>
        </div>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const qtiTest = canvasElement.querySelector('qti-test') as QtiTest;
    const bookmark = canvasElement.querySelector('header test-bookmark') as TestBookmark;
    const links = () => [...canvasElement.querySelectorAll('footer test-item-link')];
    const starred = () => links().filter(link => textOf(link)?.includes('★'));

    // 1 Wait for the first item; nothing is marked yet
    await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Multiple choice, one answer');
    await waitFor(() => expect(bookmark).not.toHaveAttribute('disabled'));
    expect(bookmark).toHaveAttribute('aria-pressed', 'false');
    expect(qtiTest.state.session.plugins).toBeUndefined();
    expect(starred()).toHaveLength(0);

    // 2 Mark it: the button, the navigation and the state a host stores all show it
    await fireEvent.click(bookmark);
    await waitFor(() => expect(bookmark).toHaveAttribute('aria-pressed', 'true'));
    expect(qtiTest.state.session.plugins?.bookmarks).toHaveLength(1);
    await waitFor(() => expect(starred()).toHaveLength(1));
    expect(starred()[0]).toHaveClass('active');

    // 3 The next item is not marked, and the navigation still shows the first
    await fireEvent.click(canvasElement.querySelector('test-next')!);
    await waitFor(() => expect(bookmark).toHaveAttribute('aria-pressed', 'false'));
    expect(starred()).toHaveLength(1);
    expect(starred()[0]).not.toHaveClass('active');

    // 4 Back on the first item the mark is still there
    await fireEvent.click(canvasElement.querySelector('test-prev')!);
    await waitFor(() => expect(bookmark).toHaveAttribute('aria-pressed', 'true'));
  }
};

/**
 * A small player that scrolls a whole section (`navigate="section"`), moved between sections by
 * links. Every item gets its own bookmark from the `<template item-ref>`, and a `<test-stamp>` in the
 * header counts what is marked. The item-ref template is stamped inside the container's shadow root,
 * so it is styled inline: `utilities.css` does not reach it.
 */
export const VerticalPlayer: Story = {
  render: () => html`
    <qti-test navigate="section">
      <template item-ref>
        <div
          style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; border-bottom: 1px solid #0002; font-size: 0.875rem"
        >
          <span>{{ identifier }}</span>
          <test-bookmark aria-label="Bookmark this item"></test-bookmark>
        </div>
        {{ xmlDoc }}
      </template>
      <test-navigation>
        <div class="border rounded-lg bg-white p-0 flex flex-col h-[calc(100dvh-2rem)] overflow-hidden">
          <header class="flex items-center justify-between gap-3 px-3 py-2 border-b">
            <test-stamp class="count">
              <template>
                <strong>
                  <template type="if" if="{{ test.plugins.bookmarks }}"
                    >{{ test.plugins.bookmarks.length }} bookmarked</template
                  >
                  <template type="if" if="{{ !test.plugins.bookmarks }}">0 bookmarked</template>
                </strong>
              </template>
            </test-stamp>
            <test-stamp>
              <template><span class="text-sm opacity-70">{{ activeSection.title }}</span></template>
            </test-stamp>
          </header>
          <div class="flex-1 min-h-0 overflow-auto p-4">
            <test-container test-url=${TEST_URL}></test-container>
          </div>
          <footer class="flex items-center gap-3 px-3 py-2 border-t">
            <test-stamp class="flex flex-wrap gap-1">
              <template>
                <template type="repeat" repeat="{{ activeTestpart.sections }}">
                  <test-section-link section-id="{{ item.identifier }}" class="{{ item.active ? 'active' : '' }}"
                    >{{ item.title }}</test-section-link
                  >
                </template>
              </template>
            </test-stamp>
          </footer>
        </div>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const qtiTest = canvasElement.querySelector('qti-test') as QtiTest;
    const total = () => textOf(canvasElement.querySelector('test-stamp.count'));
    const buttons = () => deepAll<TestBookmark>(canvasElement, 'qti-assessment-item-ref test-bookmark');

    // 1 The first section's items each have a button; nothing is marked
    await waitFor(() => expect(buttons().length).toBeGreaterThan(0));
    await waitFor(() => expect(total()).toBe('0 bookmarked'));

    // 2 The next section shows several items, each with its own button
    const sectionLinks = () => canvasElement.querySelectorAll('footer test-section-link');
    await waitFor(() => expect(sectionLinks().length).toBeGreaterThan(1));
    await fireEvent.click(sectionLinks()[1]);
    await waitFor(() => expect(buttons().length).toBeGreaterThan(1), { timeout: 15000 });
    expect(buttons().every(b => b.getAttribute('aria-pressed') === 'false')).toBe(true);

    // 3 Mark two: the total in the header follows, and so does the state
    await fireEvent.click(buttons()[1]);
    await fireEvent.click(buttons()[2]);
    await waitFor(() => expect(total()).toBe('2 bookmarked'));
    expect(qtiTest.state.session.plugins?.bookmarks).toHaveLength(2);
    expect(buttons().filter(b => b.getAttribute('aria-pressed') === 'true')).toHaveLength(2);

    // 4 Unmarking one lowers it
    await fireEvent.click(buttons()[1]);
    await waitFor(() => expect(total()).toBe('1 bookmarked'));
  }
};
