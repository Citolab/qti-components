import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { prepareTemplate } from '@heximal/templates';
import { consume } from '@lit/context';

import { computedContext } from '../../exports/computed.context';

import type { ComputedContext } from '../../exports/computed.context';
import type { TemplateFunction } from '@heximal/templates';

/**
 * @deprecated test-section-buttons-stamp is deprecated and will be removed in the future.
 */
@customElement('test-section-buttons-stamp')
export class TestSectionButtonsStamp extends LitElement {
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
    const sections = this.computedContext.testParts.flatMap(testPart => testPart.sections);

    return html` ${sections.map(item => this.myTemplate({ item }))} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-section-buttons-stamp': TestSectionButtonsStamp;
  }
}
