import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { prepareTemplate } from '@heximal/templates';
import { consume } from '@lit/context';

import { computedContext } from '@qti-components/base';

import type { ComputedContext } from '@qti-components/base';
import type { TemplateFunction } from '@heximal/templates';

/**
 * @deprecated test-paging-buttons-stamp is deprecated and will be removed in the future.
 */
@customElement('test-paging-buttons-stamp')
export class TestPagingButtonsStamp extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  private computedContext: ComputedContext;

  myTemplate: TemplateFunction;
  #internals: ElementInternals;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#internals.ariaLabel = 'pagination';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    const templateElement = this.querySelector<HTMLTemplateElement>('template');
    this.myTemplate = prepareTemplate(templateElement);
  }

  override render() {
    if (!this.computedContext) return html``;
    const items = this.computedContext.testParts.flatMap(testPart =>
      testPart.sections.flatMap(section => section.items)
    );

    return html` ${items.map(item => this.myTemplate({ item, view: this.computedContext.view }))} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-paging-buttons-stamp': TestPagingButtonsStamp;
  }
}
