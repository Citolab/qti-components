import { html, LitElement } from 'lit';
import { consume } from '@lit/context';
import { state } from 'lit/decorators.js';
import { expect, waitFor, within } from 'storybook/test';

import { computedContext } from '@qti-components/base';

import type { ComputedContext } from '@qti-components/base';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The example plugin from the "Test plugins" guide, defined here so the guide's code is tested
 * rather than just shown. It imports nothing but `lit`, `@lit/context` and `computedContext` from
 * `@qti-components/base` — if that public API changes, this story fails.
 *
 * It shows how long the item on screen takes to read. Everything comes from `computedContext`:
 * which item is active, and the rendered item (`itemElement`). The context updates on navigation
 * and again when the item has rendered, so there is nothing to listen for.
 */
export class ExampleReadingTime extends LitElement {
  @state()
  @consume({ context: computedContext, subscribe: true })
  computed?: ComputedContext;

  override render() {
    const active = this.computed?.testParts
      .flatMap(part => part.sections)
      .flatMap(section => section.items)
      .find(item => item.active);
    const item = active ? this.computed?.itemElement?.(active.identifier) : null;
    const text = item?.querySelector('qti-item-body')?.textContent ?? '';
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return html`<output data-item=${active?.identifier ?? ''}>${words} words · about ${minutes} min</output>`;
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
