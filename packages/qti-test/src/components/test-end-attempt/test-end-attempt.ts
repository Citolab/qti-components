import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { computedContext } from '@qti-components/base';
import { watch } from '@qti-components/utilities';

import * as styles from '../styles';
import { dispatchPublic } from '../../public-events';

import type { ComputedContext } from '@qti-components/base';

/** The identifier of the item-ref an element is stamped into (`<template item-ref>`), looking out through shadow roots. */
const itemRefOf = (element: Element): string | undefined => {
  const itemRef = element.closest('qti-assessment-item-ref');
  if (itemRef) return itemRef.getAttribute('identifier') ?? undefined;
  const root = element.getRootNode();
  return root instanceof ShadowRoot ? itemRefOf(root.host) : undefined;
};

/**
 * A button that ends the attempt of an item: its response is processed, `numAttempts` goes up and
 * feedback is shown as the item's session control allows. It dispatches `cito-test-end-attempt`,
 * which `<test-navigation>` handles.
 *
 * Put it inside `<test-navigation>`, either in the toolbar, where it ends the attempt of the item on
 * screen, or in the `<template item-ref>`, where each item gets its own and it ends the attempt of
 * that item: with `<qti-test navigate="section">` every item of the section is on screen, each with
 * its own button. Give it an `item` (an item-ref identifier) to end the attempt of that item instead,
 * wherever the button sits.
 *
 * It is `disabled` by the state of its item: when the attempts allowed by `max-attempts` are used
 * (non-adaptive items), when the last attempt was already optimal (non-adaptive items), when an
 * adaptive item is completed, or, when skipping is not allowed, while the response is invalid or
 * still the default.
 *
 * @slot - The label.
 * @attr require-answer - Also disabled while the response is invalid or still the default, without `allow-skipping="false"` (which is about leaving an item, not about ending its attempt).
 * @attr item - The item-ref identifier whose attempt this button ends; without it, the item it is stamped into, or else the one on screen.
 * @attr disabled - Reflected: the item's attempt cannot be ended.
 */
export class TestEndAttempt extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  @property({ attribute: false })
  protected computedContext: ComputedContext;

  @property({ type: Boolean, reflect: true, attribute: 'disabled' })
  public _internalDisabled = false;

  @property({ reflect: true }) item?: string;

  /** Ends no attempt until the response is valid and not the default, whatever the item's `allow-skipping` says. */
  @property({ type: Boolean, reflect: true, attribute: 'require-answer' }) requireAnswer = false;

  @watch('computedContext')
  _handleTestElementChange(_oldValue: ComputedContext, newValue: ComputedContext) {
    if (newValue) {
      this.requestUpdate();
    }
  }

  static override styles = styles.button;

  constructor() {
    super();
    this.addEventListener('click', e => {
      e.preventDefault();
      if (!this._internalDisabled) {
        // An item of its own goes along, so the navigation ends that item's attempt and not the
        // one on screen; without one, the navigation takes the item on screen, as before.
        const itemId = this.#ownItem;
        dispatchPublic(this, 'cito-test-end-attempt', itemId ? { itemId } : {});
      }
    });
  }

  /** The item named by `item`, or else the item-ref it is stamped into. */
  get #ownItem(): string | undefined {
    return this.item || itemRefOf(this);
  }

  override willUpdate(_changedProperties: Map<string | number | symbol, unknown>) {
    this.checkDisabled();
  }

  checkDisabled() {
    const testParts = this.computedContext?.testParts;
    const ownItem = this.#ownItem;
    const testPart = testParts?.find(testPart => testPart.active);
    if (!testParts || (!ownItem && !testPart)) return;
    // Its own item wherever it is in the test, or else the item on screen in the active part.
    const activeItem = ownItem
      ? testParts.flatMap(part => part.sections.flatMap(section => section.items)).find(i => i.identifier === ownItem)
      : testPart.sections.flatMap(section => section.items).find(item => item.active);

    if (!activeItem) {
      this._internalDisabled = false;
      return;
    }

    const maxAttempts = activeItem.maxAttempts ?? 1;
    const numAttempts = activeItem.numAttempts || 0;

    // For non-adaptive items, the last ended attempt already reached the optimal
    // outcome — nothing to improve, so disable even when attempts remain. Adaptive
    // items keep iterating, so they're exempt (same as the max-attempts guard).
    if (!activeItem.adaptive && activeItem.optimal) {
      this._internalDisabled = true;
      return;
    }

    // An adaptive item ends itself: once its response processing set completionStatus
    // to 'completed', there is no next attempt.
    if (activeItem.adaptive && activeItem.completionStatus === 'completed') {
      this._internalDisabled = true;
      return;
    }

    // For non-adaptive items, disable when max attempts have been reached
    if (!activeItem.adaptive && maxAttempts > 0 && numAttempts >= maxAttempts) {
      this._internalDisabled = true;
      return;
    }

    if (this.requireAnswer || activeItem.allowSkipping === false) {
      this._internalDisabled = activeItem.valid === false || activeItem.isDefaultResponse;
    } else {
      this._internalDisabled = false;
    }
  }

  override render() {
    return styles.control;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-end-attempt': TestEndAttempt;
  }
}
