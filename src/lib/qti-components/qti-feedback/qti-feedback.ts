import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export abstract class QtiFeedback extends LitElement {
  @property({ type: String, attribute: 'show-hide' })
  protected showHide: string;

  @property({ type: String, attribute: 'outcome-identifier' })
  protected outcomeIdentifier: string;

  @property({ type: String })
  protected identifier: string;

  @property({ type: String, attribute: false })
  protected showStatus: string;

  constructor() {
    super();
    this.showHide = 'show';
    this.showFeedback(this.showHide === 'hide');
  }
  public override connectedCallback() {
    super.connectedCallback();

    this.dispatchEvent(
      new CustomEvent<QtiFeedback>('qti-register-feedback', {
        bubbles: true,
        composed: true,
        detail: this
      })
    );
  }

  public checkShowFeedback(outcomeIdentifier: string, outcomeValue: number) {
    if (this.outcomeIdentifier !== outcomeIdentifier || !outcomeValue) return;
    const isFound = Array.isArray(outcomeValue)
      ? (outcomeValue as string[]).includes(this.identifier)
      : this.identifier === outcomeValue.toString();
    this.showFeedback(isFound);
  }

  private showFeedback(value: boolean) {
    this.showStatus = value ? 'on' : 'off';
  }
}
