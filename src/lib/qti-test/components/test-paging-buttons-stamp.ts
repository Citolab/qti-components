import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { prepareTemplate } from 'stampino';
import { consume } from '@lit/context';

import { computedContext } from '../../exports/computed.context';

import type { ComputedContext } from '../../exports/computed.context';
import type { TemplateFunction } from 'stampino';

@customElement('test-paging-buttons-stamp')
export class TestPagingButtonsStamp extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  private computedContext: ComputedContext;

  myTemplate: TemplateFunction;
  private _internals: ElementInternals;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.ariaLabel = 'pagination';
  }

  connectedCallback(): void {
    super.connectedCallback();
    const templateElement = this.querySelector<HTMLTemplateElement>('template');
    this.myTemplate = prepareTemplate(templateElement);
  }

  render() {
    if (!this.computedContext) return html``;
    const items = this.computedContext.testParts.flatMap(testPart =>
      testPart.sections.flatMap(section => section.items)
    );
    // const items = this._testContext.items.reduce(
    //   (acc, item) => {
    //     const isDepInfoItem = item.category?.split(' ').includes(this.skipOnCategory);
    //     const newIndex = isDepInfoItem ? 'i' : acc.counter++;
    //     acc.result.push({
    //       ...item,
    //       newIndex // Assign the new index, which only increments for non-info items
    //     });
    //     return acc;
    //   },
    //   { counter: 0, result: [] }
    // ).result;

    // // Get the index of the current item
    // const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.navItemId);

    // // Calculate the start and end range based on maxDisplayedItems
    // const start = Math.max(0, itemIndex - this.maxDisplayedItems);
    // const end = Math.min(items.length, itemIndex + this.maxDisplayedItems + 1);

    // // console.log('start', start, 'end', end);
    // // Adjust the items array to only include the clamped range
    // const clampedItems = items.slice(start, end);

    // const items = this._testContext.items;
    // const items = this.testContextController.computedContext.items;
    // console.log(items);

    return html` ${items.map(item => this.myTemplate({ item }))} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-paging-buttons-stamp': TestPagingButtonsStamp;
  }
}
