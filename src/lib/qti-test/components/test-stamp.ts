import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { prepareTemplate } from 'stampino';
import { consume } from '@lit/context';

import { computedContext } from '../../exports/computed.context';

import type { PropertyValues } from 'lit';
import type { ComputedContext } from '../../exports/computed.context';
import type { TemplateFunction } from 'stampino';

@customElement('test-stamp')
export class TestStamp extends LitElement {
  /**
   * Indicates whether the component is in debug mode.
   * When set to `true`, the available objects and properties (i.e.: stampContext) is displayed.
   */
  @property({ type: Boolean, reflect: true })
  public debug = false;

  @state()
  @consume({ context: computedContext, subscribe: true })
  private computedContext: ComputedContext;

  @state()
  private stampContext: {
    test?: unknown;
    testpart?: unknown;
    section?: unknown;
    item?: unknown;
  } | null = null;

  myTemplate: TemplateFunction;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    const templateElement = this.querySelector<HTMLTemplateElement>('template');
    if (!templateElement) {
      this.myTemplate = null;
      return;
    }
    this.myTemplate = prepareTemplate(templateElement);
  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (!this.computedContext) {
      this.stampContext = null;
      return;
    }

    const activeTestPart = this.computedContext.testParts.find(testPart => testPart.active);
    const activeSection = activeTestPart?.sections.find(section => section.active);
    const activeItem = activeSection?.items.find(item => item.active);

    if (!activeTestPart || !activeSection || !activeItem) {
      this.stampContext = null;
      return;
    }

    const augmentedTestPart = {
      ...activeTestPart,
      items: activeTestPart.sections.flatMap(section => section.items.map(({ variables, ...rest }) => rest)),
      sections: activeTestPart.sections.map(section => ({
        ...section,
        items: section.items.map(({ variables, ...rest }) => rest)
      }))
    };

    const augmentedSection = { ...activeSection, items: activeSection.items };
    const { testParts, ...activeTest } = this.computedContext;

    this.stampContext = {
      item: activeItem,
      section: augmentedSection,
      testpart: augmentedTestPart,
      test: activeTest
    };
  }

  render() {
    if (!this.stampContext) return nothing;
    return html` ${this.debug ? html`<small><pre>${JSON.stringify(this.stampContext, null, 2)}</pre></small>` : nothing}
    ${this.myTemplate ? this.myTemplate(this.stampContext) : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-stamp': TestStamp;
  }
}
