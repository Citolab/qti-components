import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef } from 'lit/directives/ref.js';

// eslint-disable-next-line import/no-relative-packages
import styles from '../../../../qti-interactions/src/components/qti-text-entry-interaction/qti-text-entry-interaction.styles';

import type { CSSResultGroup } from 'lit';
export class QtiTextEntryInteractionEdit extends LitElement {
  static override styles: CSSResultGroup = styles;
  inputRef = createRef<HTMLInputElement>();

  @property({ type: String, attribute: 'pattern-mask' }) patternMask: string;

  @property({ type: String, attribute: 'placeholder-text' }) placeholderText: string;

  override render() {
    return html`
      <input
        part="input"
        spellcheck="false"
        autocomplete="off"
        @keydown="${(event: KeyboardEvent) => event.stopImmediatePropagation()}"
        type="${this.patternMask == '[0-9]*' ? 'number' : 'text'}"
        placeholder="${ifDefined(this.placeholderText ? this.placeholderText : undefined)}"
        pattern="${ifDefined(this.patternMask ? this.patternMask : undefined)}"
        maxlength=${1000}
        readonly
      />
    `;
  }
}

customElements.define('qti-text-entry-interaction', QtiTextEntryInteractionEdit);
