import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { prepareTemplate } from 'stampino';
import { consume } from '@lit/context';

import { computedContext } from '../../exports/computed.context';

import type { ComputedContext } from '../../exports/computed.context';
import type { TemplateFunction } from 'stampino';

@customElement('test-print-stamp')
export class TestPrintStamp extends LitElement {
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
    this._internals.ariaLabel = 'print-variables';
  }

  connectedCallback(): void {
    super.connectedCallback();
    const templateElement = this.querySelector<HTMLTemplateElement>('template');
    this.myTemplate = prepareTemplate(templateElement);
  }

  render() {
    if (!this.computedContext) return html``;
    const activeItems = this.computedContext?.testParts.flatMap(testPart =>
      testPart.sections.flatMap(section => section.items).find(item => item.active)
    );
    const activeItem = activeItems && activeItems.length > 0 ? activeItems[0] : null;
    if (!activeItem) return html``;
    return html`${this.myTemplate({ item: activeItem })}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-print-stamp': TestPrintStamp;
  }
}
