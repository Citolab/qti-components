import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { TemplateFunction } from '@heximal/templates';

// Converter function to interpret "true" and "false" as booleans
const stringToBooleanConverter = {
  fromAttribute(value: string): boolean {
    return value === 'true';
  },
  toAttribute(value: boolean): string {
    return value ? 'true' : 'false';
  }
};

// @customElement('qti-assessment-item-ref')
export class QtiAssessmentItemRef extends LitElement {
  @property({ type: String }) category?: string;
  @property({ type: String }) identifier?: string;
  @property({ type: Boolean, converter: stringToBooleanConverter }) required?: boolean;
  @property({ type: Boolean, converter: stringToBooleanConverter }) fixed?: boolean;
  @property({ type: String }) href?: string;

  // @consume({ context: computedContext, subscribe: true })
  // private computedContext: ComputedContext;

  weigths: Map<string, number> = new Map();

  @property({ type: Object, attribute: false })
  xmlDoc!: DocumentFragment; // the XMLDocument

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  get assessmentItem(): QtiAssessmentItem | null {
    return this.renderRoot?.querySelector('qti-assessment-item');
  }

  myTemplate: TemplateFunction;

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();

    /*
      searches for the template element to use in the qti-test component
      can be used to render extra things for an item, like a bookmark, index nummer
      put this in your test-container component
      <template item-ref>
        <div>Extra content</div>
      </template>
    */
    // const templateElement = ((this.getRootNode() as any).host as HTMLElement)
    //   .closest('qti-test')
    //   .querySelector<HTMLTemplateElement>('template[item-ref]');

    // if (templateElement) this.myTemplate = prepareTemplate(templateElement);

    await this.updateComplete;

    this.dispatchEvent(
      new CustomEvent('qti-assessment-item-ref-connected', {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier, href: this.href, category: this.category }
      })
    );
  }

  override render() {
    return this.myTemplate ? this.myTemplate({ xmlDoc: this.xmlDoc }) : this.xmlDoc;
  }
}

if (!customElements.get('qti-assessment-item-ref')) {
  customElements.define('qti-assessment-item-ref', QtiAssessmentItemRef);
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-item-ref': QtiAssessmentItemRef;
  }
}
