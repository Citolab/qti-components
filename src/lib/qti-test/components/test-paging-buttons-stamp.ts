import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { TestComponent } from './test-component.abstract';
import { prepareTemplate } from 'stampino';

@customElement('test-paging-buttons-stamp')
export class TestPagingButtonsStamp extends TestComponent {
  @property({ type: Number, attribute: 'max-displayed-items' })
  private maxDisplayedItems = 2;

  @property({ type: String, attribute: 'skip-on-category' })
  private skipOnCategory = 'dep-informational';

  protected createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this._internals.ariaLabel = 'pagination';
  }

  render() {
    const items = this._testContext.items.reduce(
      (acc, item) => {
        const isDepInfoItem = item.category?.split(' ').includes(this.skipOnCategory);
        const newIndex = isDepInfoItem ? 'i' : acc.counter++;
        acc.result.push({
          ...item,
          newIndex // Assign the new index, which only increments for non-info items
        });
        return acc;
      },
      { counter: 0, result: [] }
    ).result;

    // Get the index of the current item
    const itemIndex = items.findIndex(item => item.identifier === this._testContext.navItemId);

    // Calculate the start and end range based on maxDisplayedItems
    const start = Math.max(0, itemIndex - this.maxDisplayedItems);
    const end = Math.min(items.length, itemIndex + this.maxDisplayedItems + 1);

    // console.log('start', start, 'end', end);
    // Adjust the items array to only include the clamped range
    const clampedItems = items.slice(start, end);

    return html`
      ${clampedItems.map(item => {
        const rawscore = item.variables.find(vr => vr.identifier == 'SCORE');
        const score = parseInt(rawscore?.value?.toString());
        const completionStatus = item.variables.find(v => v.identifier === 'completionStatus')?.value;
        const type = item.category !== this.skipOnCategory ? 'regular' : 'info'; // rounded-full
        const active = this._testContext.navItemId === item.identifier; // !border-sky-600
        const correct =
          this._testContext.view === 'scorer' && type == 'regular' && score !== undefined && !isNaN(score) && score > 0; // bg-green-100 border-green-400
        const incorrect =
          this._testContext.view === 'scorer' &&
          type == 'regular' &&
          score !== undefined &&
          !isNaN(score) &&
          score <= 0; // bg-red-100 border-red-400
        const answered =
          this._testContext.view === 'candidate' &&
          completionStatus === 'completed' &&
          item.category !== this.skipOnCategory; // bg-slate-300 shadow-sm

        const computedItem = {
          ...item,
          type,
          active,
          correct,
          incorrect,
          answered
        };

        const templateElement = this.firstElementChild as HTMLTemplateElement;
        const myTemplate = prepareTemplate(templateElement);
        return myTemplate({ item: computedItem });
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-paging-buttons-stamp': TestPagingButtonsStamp;
  }
}
