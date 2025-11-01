import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { prepareTemplate } from '@heximal/templates';
import { consume } from '@lit/context';
import { computedContext } from '@qti-components/shared';

import type { View } from '@qti-components/shared';
import type { PropertyValues } from 'lit';
import type { ComputedContext } from '@qti-components/shared';
import type { TemplateFunction } from '@heximal/templates';

/**
 * A custom web component that renders a test stamp using the Lit framework.
 * This component is deprecated and will be removed in the future.
 * @customElement
 * @extends {LitElement}
 */
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
    view?: View;
    test?: unknown;
    activeTestpart?: unknown;
    activeSection?: unknown;
    activeItem?: unknown;
  } = {
    view: 'candidate',
    activeItem: {},
    activeSection: {
      items: []
    },
    activeTestpart: {
      items: [],
      sections: []
    },
    test: {}
  };

  myTemplate: TemplateFunction;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    const templateElement = this.querySelector<HTMLTemplateElement>('template');
    if (!templateElement) {
      this.myTemplate = null;
      return;
    }
    this.myTemplate = prepareTemplate(templateElement);
  }

  protected override willUpdate(_changedProperties: PropertyValues): void {
    if (!this.computedContext) {
      return;
    }
    const activeTestPart = this.computedContext.testParts.find(testPart => testPart.active);
    const activeSection = activeTestPart?.sections.find(section => section.active);
    const activeItem = activeSection?.items.find(item => item.active);
    const { variables, ...augmentedItem } = activeItem || {};

    if (!activeTestPart || !activeSection || !activeItem) {
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

    const augmentedSection = { ...activeSection, items: activeSection.items.map(({ variables, ...rest }) => rest) };
    const { testParts, ...activeTest } = this.computedContext;

    this.stampContext = {
      view: this.computedContext.view,
      activeItem: augmentedItem,
      activeSection: augmentedSection,
      activeTestpart: augmentedTestPart,
      test: activeTest
    };
    this.dispatchEvent(
      new CustomEvent('qti-stamp-context-updated', {
        detail: this.stampContext,
        bubbles: true
      })
    );
  }

  override render() {
    // if (!this.stampContext) return nothing;
    return html` ${this.debug ? html`<small><pre>${JSON.stringify(this.stampContext, null, 2)}</pre></small>` : nothing}
    ${this.myTemplate ? this.myTemplate(this.stampContext) : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-stamp': TestStamp;
  }
}
