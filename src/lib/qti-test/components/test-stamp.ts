import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { prepareTemplate } from 'stampino';
import { consume } from '@lit/context';

import { computedContext } from '../../exports/computed.context';

import type { ComputedContext } from '../../exports/computed.context';
import type { TemplateFunction } from 'stampino';

@customElement('test-stamp')
export class TestStamp extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  private computedContext: ComputedContext;

  myTemplate: TemplateFunction;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    const templateElement = this.querySelector<HTMLTemplateElement>('template');
    this.myTemplate = prepareTemplate(templateElement);
  }

  render() {
    if (!this.computedContext) return html``;
    const activeTestPart = this.computedContext?.testParts.find(testPart => testPart.active);
    const augmentedtestPart = {
      ...activeTestPart,
      items: activeTestPart.sections.flatMap(section => section.items)
    };

    const activeSection = this.computedContext?.testParts.flatMap(testPart =>
      testPart.sections.find(section => section.active)
    )[0];

    const activeItems = this.computedContext?.testParts.flatMap(testPart =>
      testPart.sections.flatMap(section => section.items).find(item => item.active)
    );
    const activeItem = activeItems && activeItems.length > 0 ? activeItems[0] : null;
    if (!activeItem) return html``;
    return html`${this.myTemplate({
      testpart: augmentedtestPart,
      section: activeSection,
      item: activeItem
    })}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-stamp': TestStamp;
  }
}
