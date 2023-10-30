import { ContextConsumer } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { audienceContext } from 'src/lib/context';

@customElement('test-manual-scoring')
export class TestManualScoring extends LitElement {
  static override styles = css`
    :host {
      display: none;
    }
  `;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readonly = false;
  @property({ type: Number }) value: string;
  @property({ type: Number }) min: number;
  @property({ type: Number }) max: number;

  protected textChanged(event: Event) {
    if (this.disabled || this.readonly) return;
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    // (this.closest('qti-test') as QtiTest).manualOutcomeValue = this.value;
  }

  public logger = new ContextConsumer(
    this,
    audienceContext,
    e => {
      this.style.display = e.view === 'scorer' ? 'block' : 'none';
    },
    true
  );

  override render() {
    return html`<input
      part="input"
      type="number"
      spellcheck="false"
      autocomplete="off"
      @keyup=${this.textChanged}
      @change=${this.textChanged}
      placeholder="score"
      min=${this.min}
      max=${this.max}
      .value=${this.value}
      size="10"
      ?disabled=${this.disabled}
      ?readonly=${this.readonly}
    />`;
  }
}
