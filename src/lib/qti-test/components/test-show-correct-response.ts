import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import * as styles from './styles';
import { computedContext } from '../../exports/computed.context';

import type { ComputedContext } from '../../exports/computed.context';

@customElement('test-show-correct-response')
export class TestShowCorrectResponse extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  public computedContext?: ComputedContext;

  static styles = css`
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

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    const activeItem = this.computedContext?.testParts
      .flatMap(testPart => testPart.sections.flatMap(section => section.items))
      .find(item => item.active);
    // If active item changed, reset shown
    if (this._previousActiveItem !== activeItem) {
      this.shown = false;
      this._previousActiveItem = activeItem; // Update previous active item
    }
    if (activeItem) {
      this.disabled = !activeItem.correctResponse;
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

  render() {
    return html` <div @click="${this._toggleState}">${this._getDisplayedText()}</div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-show-correct-response': TestShowCorrectResponse;
  }
}
