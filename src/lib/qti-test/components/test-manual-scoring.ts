import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { testContext, TestContext } from '../qti-assessment-test.context';
import { styleMap } from 'lit/directives/style-map.js';

@customElement('test-manual-scoring')
export class TestManualScoring extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readonly = false;
  @property({ type: Number }) value: number = 0;
  @property({ type: Number }) min: number;
  @property({ type: Number }) max: number;

  protected textChanged(event: Event) {
    if (this.disabled || this.readonly) return;
    const input = event.target as HTMLInputElement;
    this.value = Number(input.value);

    this.dispatchEvent(
      new CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>('qti-set-outcome-value', {
        bubbles: true,
        composed: true,
        detail: {
          outcomeIdentifier: 'SCORE',
          value: this.value.toString()
        }
      })
    );
  }

  override render() {
    return html`
      <input
        part="input"
        type="number"
        spellcheck="false"
        autocomplete="off"
        @keyup=${this.textChanged}
        @change=${this.textChanged}
        placeholder="score"
        min=${this.min}
        max=${this.max}
        .value=${this.value.toString()}
        size="10"
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
      />
    `;
  }
}
