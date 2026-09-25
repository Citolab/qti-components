import { afterEach, describe, expect, it } from 'vitest';

import { QtiAssessmentItemRef } from './qti-assessment-item-ref';

/**
 * `<template item-ref>` lets a host render its own chrome around every item in
 * a test — a bookmark, an index number, a score badge — without replacing the
 * element.
 *
 * Only this element is registered here, deliberately. `<qti-test>` is matched
 * by tag name, so an unupgraded one is enough to exercise the lookup, and
 * registering the real one would drag a navigation mixin (and its fetches)
 * into a test about template resolution.
 */
if (!customElements.get('qti-assessment-item-ref')) {
  customElements.define('qti-assessment-item-ref', QtiAssessmentItemRef);
}

/** An item document, standing in for what the navigation mixin hands over. */
const itemDoc = (): DocumentFragment => {
  const doc = document.createDocumentFragment();
  const item = document.createElement('qti-assessment-item');
  item.textContent = 'ITEM BODY';
  doc.append(item);
  return doc;
};

/** A ref inside `<qti-test>`, optionally one shadow root down. */
async function mount(options: {
  template?: string;
  inShadowRoot?: boolean;
  inTest?: boolean;
}): Promise<QtiAssessmentItemRef> {
  const test = document.createElement(options.inTest === false ? 'div' : 'qti-test');
  document.body.append(test);
  if (options.template !== undefined) {
    test.innerHTML = `<template item-ref>${options.template}</template>`;
  }

  const itemRef = document.createElement('qti-assessment-item-ref');
  itemRef.setAttribute('identifier', 'ITEM-1');
  itemRef.setAttribute('href', 'items/item-1.xml');
  itemRef.setAttribute('category', 'reading');
  itemRef.xmlDoc = itemDoc();

  if (options.inShadowRoot) {
    // What <test-container> does: the items live in its shadow root.
    const container = document.createElement('test-container-stub');
    test.append(container);
    container.attachShadow({ mode: 'open' }).append(itemRef);
  } else {
    test.append(itemRef);
  }

  await itemRef.updateComplete;
  return itemRef;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('qti-assessment-item-ref template hook', () => {
  it('renders the item on its own when no template is provided', async () => {
    const itemRef = await mount({});

    expect(itemRef.myTemplate).toBeNull();
    expect(itemRef.querySelector('qti-assessment-item')?.textContent).toBe('ITEM BODY');
  });

  it('renders the template, with the item where the template puts it', async () => {
    const itemRef = await mount({
      template: '<div class="badge">{{ identifier }}</div>{{ xmlDoc }}'
    });

    const badge = itemRef.querySelector('.badge');
    expect(badge?.textContent).toBe('ITEM-1');
    expect(itemRef.querySelector('qti-assessment-item')?.textContent).toBe('ITEM BODY');
    // Chrome first, item after: the template decides the order.
    expect(badge?.compareDocumentPosition(itemRef.querySelector('qti-assessment-item')!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('passes the ref attributes and the element itself in the model', async () => {
    const itemRef = await mount({
      template: '<i>{{ href }}</i><b>{{ category }}</b><u>{{ itemRef.tagName }}</u>'
    });

    expect(itemRef.querySelector('i')?.textContent).toBe('items/item-1.xml');
    expect(itemRef.querySelector('b')?.textContent).toBe('reading');
    expect(itemRef.querySelector('u')?.textContent).toBe('QTI-ASSESSMENT-ITEM-REF');
  });

  it('finds the template from inside a shadow root, as test-container renders it', async () => {
    const itemRef = await mount({
      template: '<div class="badge">{{ identifier }}</div>{{ xmlDoc }}',
      inShadowRoot: true
    });

    expect(itemRef.querySelector('.badge')?.textContent).toBe('ITEM-1');
  });

  it('renders the item when there is no enclosing qti-test', async () => {
    const itemRef = await mount({ template: '<div class="badge">x</div>', inTest: false });

    expect(itemRef.myTemplate).toBeNull();
    expect(itemRef.querySelector('qti-assessment-item')?.textContent).toBe('ITEM BODY');
  });

  it('re-renders the template when the item document changes', async () => {
    const itemRef = await mount({
      template: '<div class="badge">{{ identifier }}</div>{{ xmlDoc }}'
    });

    const next = document.createDocumentFragment();
    const item = document.createElement('qti-assessment-item');
    item.textContent = 'SECOND ITEM';
    next.append(item);
    itemRef.xmlDoc = next;
    await itemRef.updateComplete;

    expect(itemRef.querySelector('.badge')?.textContent).toBe('ITEM-1');
    expect(itemRef.querySelector('qti-assessment-item')?.textContent).toBe('SECOND ITEM');
  });
});
