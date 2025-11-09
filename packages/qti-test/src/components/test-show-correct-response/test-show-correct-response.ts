import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { computedContext } from '@qti-components/base';

import * as styles from '../styles';

import type { ComputedContext } from '@qti-components/base';

/**
 * @deprecated test-show-correct-response is deprecated and will be removed in the future.
 */
@customElement('test-show-correct-response')
export class TestShowCorrectResponse extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  public computedContext?: ComputedContext;

  static override styles = css`
    :host {
      ${styles.btn};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  @property({ type: Boolean, reflect: true }) shown = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) showCorrectText = 'Show correct response';
  @property({ type: String }) hideCorrectText = 'Hide correct response';
  @property({ type: String }) noCorrectResponseText = 'No correct response specified';

  private _previousActiveItem?: unknown; // Store previous active item reference

  override willUpdate(_changedProperties: Map<string | number | symbol, unknown>) {
    const activeItem = this.computedContext?.testParts
      .flatMap(testPart => testPart.sections.flatMap(section => section.items))
      .find(item => item.active);

    // If active item changed, reset shown before the update
    if (this._previousActiveItem !== activeItem) {
      this.shown = false;
      this._previousActiveItem = activeItem; // Update previous active item
    }

    if (activeItem) {
      const containsCorrectResponse = !!activeItem?.variables?.some(v => (v as any)['correctResponse']);
      const containsMapping = !!activeItem?.variables?.some(v => {
        return (v as any)['mapping']?.mapEntries?.length > 0 || (v as any)['areaMapping']?.areaMapEntries?.length > 0;
      });
      this.disabled = !containsCorrectResponse && !containsMapping;
    } else {
      this.disabled = true;
    }
  }
  private _toggleState() {
    if (this.disabled) return;
    this.shown = !this.shown;

    this.dispatchEvent(
      new CustomEvent('test-show-correct-response', {
        detail: this.shown,
        bubbles: true
      })
    );
  }

  private _getDisplayedText(): string {
    return this.disabled ? this.noCorrectResponseText : this.shown ? this.hideCorrectText : this.showCorrectText;
  }

  override render() {
    return html` <div @click="${this._toggleState}">${this._getDisplayedText()}</div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-show-correct-response': TestShowCorrectResponse;
  }
}
