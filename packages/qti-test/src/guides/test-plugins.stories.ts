import { html, LitElement } from 'lit';
import { consume } from '@lit/context';
import { state } from 'lit/decorators.js';
import { expect, waitFor, within } from 'storybook/test';

import { sessionContext, testItemsContext } from '@qti-components/base';

import type { PropertyValues } from 'lit';
import type { SessionContext, TestItems } from '@qti-components/base';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The example plugin from the "Test plugins" guide, defined here so the guide's code is tested
 * rather than just shown. It imports nothing but `lit`, `@lit/context` and public contexts from
 * `@qti-components/base` — if that public API changes, this story fails.
 *
 * It shows how long the item on screen takes to read: the item comes from `sessionContext`
 * (which item) and `testItemsContext` (where it is rendered), and it recounts when the test
 * renders an item, heard on `testItems.eventTarget`.
 */
export class ExampleReadingTime extends LitElement {
  @state()
  @consume({ context: sessionContext, subscribe: true })
  session?: SessionContext;

  @state()
  @consume({ context: testItemsContext, subscribe: true })
  testItems?: TestItems;

  @state() private words = 0;

  #listeningOn: EventTarget | null = null;
  #recount = () => {
    const identifier = this.session?.navItemRefId;
    const item = identifier ? this.testItems?.itemElement(identifier) : null;
    const text = item?.querySelector('qti-item-body')?.textContent ?? '';
    this.words = text.split(/\s+/).filter(Boolean).length;
  };

  override willUpdate(changed: PropertyValues<this>) {
    // Navigation moved: count the item now on screen (it may not be rendered yet; see below).
    if (changed.has('session') || changed.has('testItems')) this.#recount();
  }

  override updated(changed: PropertyValues<this>) {
    // The test rendered an item: count again. Listen where the test says its events arrive.
    if (changed.has('testItems') && this.#listeningOn !== this.testItems?.eventTarget) {
      this.#listeningOn?.removeEventListener('qti-assessment-item-connected', this.#recount);
      this.#listeningOn = this.testItems?.eventTarget ?? null;
      this.#listeningOn?.addEventListener('qti-assessment-item-connected', this.#recount);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#listeningOn?.removeEventListener('qti-assessment-item-connected', this.#recount);
    this.#listeningOn = null;
  }

  override render() {
    const minutes = Math.max(1, Math.round(this.words / 200));
    return html`<output data-item=${this.session?.navItemRefId ?? ''}>
      ${this.words} words · about ${minutes} min
    </output>`;
  }
}

if (!customElements.get('example-reading-time')) customElements.define('example-reading-time', ExampleReadingTime);

const meta: Meta = {
  title: 'Test plugins',
  parameters: { layout: 'padded' }
};
export default meta;

type Story = StoryObj;

/**
 * `example-reading-time` inside a test. Navigate with Next and Previous: the reading time follows
 * the item on screen.
 */
export const ReadingTime: Story = {
  render: () => html`
    <qti-test navigate="item">
      <test-navigation class="stack">
        <div class="row">
          <test-prev>Previous</test-prev>
          <test-next>Next</test-next>
          <example-reading-time></example-reading-time>
        </div>
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const output = () => canvasElement.querySelector('example-reading-time')?.shadowRoot?.querySelector('output');
    const words = () => Number.parseInt(output()?.textContent ?? '', 10);

    // The first item is counted once the test has rendered it.
    await waitFor(() => expect(output()?.dataset.item).toBe('ITM-info_start'), { timeout: 15000 });
    await waitFor(() => expect(words()).toBeGreaterThan(0));

    // Navigating counts the next item.
    (await canvas.findByText('Next')).click();
    await waitFor(() => expect(output()?.dataset.item).toBe('ITM-text_entry'), { timeout: 5000 });
    await waitFor(() => expect(words()).toBeGreaterThan(0));
  }
};
