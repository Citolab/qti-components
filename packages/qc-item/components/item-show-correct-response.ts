import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import * as styles from './styles';
import { computedItemContext } from '../../../src/lib/exports/computed-item.context';

import type { ComputedItemContext } from '../../../src/lib/exports/computed-item.context';

@customElement('item-show-correct-response')
export class ItemShowCorrectResponse extends LitElement {
  @consume({ context: computedItemContext, subscribe: true })
  public computedContext?: ComputedItemContext;

  static styles = css`
    :host {
      ${styles.btn};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  @property({ type: Boolean, reflect: true }) shown = false;
  @property({ type: Boolean, reflect: true }) disabled = false; // Reflects to `disabled` attribute
  @property({ type: String }) showCorrectText = 'Show correct response';
  @property({ type: String }) hideCorrectText = 'Hide correct response';
  @property({ type: String }) noCorrectResponseText = 'No correct response specified';

  private _hasCorrectResponse = false; // correct response is removed on certain point
  private _previousActiveItem = ''; // Store previous active item reference

  updated() {
    if (!this._hasCorrectResponse || this._previousActiveItem !== this.computedContext?.identifier) {
      this._previousActiveItem = this.computedContext?.identifier;
      const containsCorrectResponse = !!this.computedContext?.variables.some(v => v['correctResponse']);
      const containsMapping = !!this.computedContext?.variables.some(v => {
        return v['mapping']?.mapEntries?.length > 0 || v['areaMapping']?.areaMapEntries?.length > 0;
      });
      this._hasCorrectResponse = containsCorrectResponse || containsMapping;
    }
    this.disabled = !this._hasCorrectResponse;
  }

  private _toggleState() {
    if (this.disabled) return; // Prevent toggle if disabled

    this.dispatchEvent(
      new CustomEvent('item-show-correct-response', {
        detail: !this.shown,
        bubbles: true
      })
    );
  }

  private _getDisplayedText(): string {
    return this.disabled ? this.noCorrectResponseText : this.shown ? this.hideCorrectText : this.showCorrectText;
  }

  render() {
    return html` <div @click="${this._toggleState}">${this._getDisplayedText()}</div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'item-show-correct-response': ItemShowCorrectResponse;
  }
}
