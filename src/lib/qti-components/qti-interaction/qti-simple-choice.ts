import { css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { QtiChoice } from './internal/choice/qti-choice';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.j9nu1oa1tu3b
 * @status stable
 * @since 4.0
 *
 * @event qti-choice-element-selected - Emitted when a choice is selected.
 * @event qti-register-choice - Emitted when an choice is added
 * @event qti-loose-choice - Emitted when a choice is removed
 *
 * @slot - The default slot.
 */
@customElement('qti-simple-choice')
export class QtiSimpleChoice extends QtiChoice {
  static styles = css`
    :host {
      display: flex;
      user-select: none;
    }
    slot {
      width: 100%;
      display: flex;
      align-items: center;
    }
    [part='ch'] {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
    }
  `;

  // property label
  @property({ type: String, attribute: false })
  public marker: string;

  override render() {
    return html`<div part="ch">
        <div part="cha"></div>
      </div>
      ${this.marker ? html`<div id="label">${this.marker}</div>` : nothing}
      <slot part="slot"></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-simple-choice': QtiSimpleChoice;
  }
}
