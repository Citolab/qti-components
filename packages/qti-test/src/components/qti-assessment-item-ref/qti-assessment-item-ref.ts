import { LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { prepareTemplate } from '@heximal/templates';

import { computedContext } from '@qti-components/base';

import { testHostContext } from '../../internal/test-host.context';

import type { ComputedContext, ComputedItem } from '@qti-components/base';
import type { QtiAssessmentItem } from '@qti-components/elements';
import type { TestHost } from '../../internal/test-host.context';
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

/**
 * The model a `<template item-ref>` is rendered with.
 *
 * Only what this element already knows: the item's parsed document and the
 * attributes off the item-ref itself. `itemRef` is the escape hatch — a
 * template that needs anything else (a click handler, a value from the host
 * app) reaches it through a property on the element, which the host is free to
 * set.
 */
export interface ItemRefTemplateModel {
  /** The item's parsed document, i.e. what the element renders by default. */
  xmlDoc: DocumentFragment;
  identifier?: string;
  href?: string;
  category?: string;
  /**
   * This item's entry in the computed context, the same object the stamps
   * iterate as `item`: `index` (1-based, null for info items), `score`,
   * `maxScore`, `completed`, `active`, … Undefined until the test has computed it.
   */
  item?: ComputedItem;
  /** The element being rendered. */
  itemRef: QtiAssessmentItemRef;
}

// @customElement('qti-assessment-item-ref')
export class QtiAssessmentItemRef extends LitElement {
  @property({ type: String }) category?: string;
  @property({ type: String }) identifier?: string;
  @property({ type: Boolean, converter: stringToBooleanConverter }) required?: boolean;
  @property({ type: Boolean, converter: stringToBooleanConverter }) fixed?: boolean;
  @property({ type: String }) href?: string;

  // Only read by a <template item-ref>; subscribing re-renders it as scores come in
  @state()
  @consume({ context: computedContext, subscribe: true })
  protected computedContext?: ComputedContext;

  /**
   * The `<qti-weight>` children of this ref, keyed by identifier — what
   * `qti-test-variables`' `weight-identifier` resolves against.
   *
   * Read on access rather than cached: the test document is rendered into this
   * element's light DOM, so the weights are not in place at construction time,
   * and outcome processing runs long after they are.
   */
  get weights(): Map<string, number> {
    const weights = new Map<string, number>();
    for (const weight of this.querySelectorAll(':scope > qti-weight')) {
      const identifier = weight.getAttribute('identifier');
      if (!identifier) continue;
      const value = Number(weight.getAttribute('value'));
      if (Number.isNaN(value)) {
        console.warn(`qti-weight "${identifier}" has a non-numeric value, ignoring it`);
        continue;
      }
      weights.set(identifier, value);
    }
    return weights;
  }

  @property({ type: Object, attribute: false })
  xmlDoc: DocumentFragment | null = null;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  get assessmentItem(): QtiAssessmentItem | null {
    return this.renderRoot?.querySelector('qti-assessment-item');
  }

  myTemplate: TemplateFunction | null = null;

  /** The `qti-test` this ref belongs to, wherever it renders: light DOM, or any depth of shadow roots. */
  @consume({ context: testHostContext, subscribe: true })
  protected testHost?: TestHost;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    // A context consumer keeps its last value when it is moved somewhere with no provider, and
    // `closest()` never did: a ref moved out of a test must not keep that test's template.
    this.testHost = undefined;
  }

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();

    /*
      Optional per-item template, used to render extra things around an item —
      a bookmark, an index number, a score badge. Put it in the light DOM of
      your qti-test, and every item-ref in the test renders with it:

      <qti-test>
        <template item-ref>
          <div class="badge">{{ identifier }}</div>
          {{ xmlDoc }}
        </template>
        …
      </qti-test>

      The template is the WHOLE render, so it has to place {{ xmlDoc }} itself;
      leaving it out renders the chrome and no item. Without a template the
      element renders the item on its own, exactly as before.

      Resolved once, on connect: one template serves every item, and everything
      that varies per item comes through the model (see ItemRefTemplateModel).
    */
    const templateElement = this.testHost?.querySelector<HTMLTemplateElement>('template[item-ref]');
    this.myTemplate = templateElement ? prepareTemplate(templateElement) : null;
    this.requestUpdate();

    await this.updateComplete;

    this.dispatchEvent(
      new CustomEvent('qti-assessment-item-ref-connected', {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier, href: this.href, category: this.category }
      })
    );
  }

  #computedItem(): ComputedItem | undefined {
    for (const testPart of this.computedContext?.testParts ?? []) {
      for (const section of testPart.sections) {
        const item = section.items.find(i => i.identifier === this.identifier);
        if (item) return item;
      }
    }
    return undefined;
  }

  /**
   * The clone of `xmlDoc` that is rendered, and what it was cloned for. Cloned
   * once per document and template, not per render: re-renders from
   * computed-context changes then hand Lit the same fragment, which it leaves
   * alone, instead of rebuilding the item (and reloading its PCIs, which
   * changes the context again).
   */
  #rendered: { source: DocumentFragment; template: TemplateFunction | null; doc: DocumentFragment } | null = null;

  override render() {
    // Item refs connect before loading, and navigation clears their documents.
    if (!this.xmlDoc) {
      this.#rendered = null;
      return nothing;
    }

    if (this.#rendered?.source !== this.xmlDoc || this.#rendered.template !== this.myTemplate) {
      this.#rendered = {
        source: this.xmlDoc,
        template: this.myTemplate,
        doc: this.xmlDoc.cloneNode(true) as DocumentFragment
      };
    }
    const xmlDoc = this.#rendered.doc;
    if (!this.myTemplate) return xmlDoc;

    const model: ItemRefTemplateModel = {
      xmlDoc,
      identifier: this.identifier,
      href: this.href,
      category: this.category,
      item: this.#computedItem(),
      itemRef: this
    };
    return this.myTemplate(model);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-item-ref': QtiAssessmentItemRef;
  }
}
