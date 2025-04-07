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
    // If no computed context is available, clear the stamp context
    if (!this.computedContext) {
      this.stampContext = null;
      return;
    }

    // Find the active test part
    const activeTestPart = this.computedContext.testParts.find(testPart => testPart.active);
    if (!activeTestPart) {
      this.stampContext = null;
      return;
    }

    // Augment the active test part by removing variables from items
    const augmentedTestPart = {
      ...activeTestPart,
      items: activeTestPart.sections.flatMap(section => section.items.map(({ variables, ...rest }) => rest)),
      sections: activeTestPart.sections.map(section => ({
        ...section,
        items: section.items.map(({ variables, ...rest }) => rest)
      }))
    };

    // Find and augment the active section
    const activeSection = augmentedTestPart.sections.find(section => section.active);
    const augmentedSection = activeSection ? { ...activeSection, items: activeSection.items } : null;

    // Find the active item within the active section
    const augmentedItem = augmentedSection?.items.find(item => item.active);

    // Extract the active test data excluding test parts
    const { testParts, ...activeTest } = this.computedContext;

    // Set the stamp context with the augmented data
    this.stampContext = {
      item: augmentedItem || null,
      section: augmentedSection || null,
      testpart: augmentedTestPart,
      test: activeTest
    };
  }

  render() {
    return html` ${this.debug ? html`<small><pre>${JSON.stringify(this.stampContext, null, 2)}</pre></small>` : nothing}
    ${this.stampContext && this.myTemplate ? this.myTemplate(this.stampContext) : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-stamp': TestStamp;
  }
}
