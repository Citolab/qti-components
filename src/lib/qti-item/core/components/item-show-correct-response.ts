import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import * as styles from './styles';
import { computedItemContext } from '../../../exports/computed-item.context';

import type { ComputedItemContext } from '../../../exports/computed-item.context';

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

  updated() {
    this.disabled = !this.computedContext?.correctResponse; // Disable when no correct response
  }

  private _toggleState() {
    if (this.disabled) return; // Prevent toggle if disabled
    this.shown = !this.shown;
    this.dispatchEvent(
      new CustomEvent('item-show-correct-response', {
        detail: this.shown,
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
