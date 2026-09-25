import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { prepareTemplate } from '@heximal/templates';

import { computedContext } from '@qti-components/base';

import type { ComputedContext, ComputedItem } from '@qti-components/base';
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

  weigths: Map<string, number> = new Map();

  @property({ type: Object, attribute: false })
  xmlDoc!: DocumentFragment; // the XMLDocument

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  get assessmentItem(): QtiAssessmentItem | null {
    return this.renderRoot?.querySelector('qti-assessment-item');
  }

  myTemplate: TemplateFunction | null = null;

  /**
   * The `<qti-test>` this ref belongs to, crossing shadow boundaries on the way
   * up.
   *
   * `<test-container>` renders its items into a shadow root, so an item-ref is
   * usually one hop below one; but it is also valid in plain light DOM, and a
   * host is free to nest it deeper. Climbing root by root covers all three
   * without assuming any of them.
   */
  #findTestElement(): Element | null {
    const own = this.closest('qti-test');
    if (own) return own;

    let root: Node = this.getRootNode();
    while (root instanceof ShadowRoot) {
      const test = root.host.closest('qti-test');
      if (test) return test;
      root = root.host.getRootNode();
    }
    // A Document, or a fragment that is not attached to one: nowhere left to climb.
    return null;
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
    const templateElement = this.#findTestElement()?.querySelector<HTMLTemplateElement>('template[item-ref]');
    if (templateElement) this.myTemplate = prepareTemplate(templateElement);

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

  override render() {
    if (!this.myTemplate) return this.xmlDoc;

    const model: ItemRefTemplateModel = {
      xmlDoc: this.xmlDoc,
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
