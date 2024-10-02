import type { PropertyValueMap } from 'lit';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('test-lock')
export class TestLock extends LitElement {
  @property({ type: String, attribute: 'unlock-title' })
  unlockTitle: string = 'unlock';

  @property({ type: String, attribute: 'secret-code' })
  private _secretCode: string = 'delingen';

  @property({ type: Boolean, attribute: 'force-full-screen' })
  private _forceFullScreen = true;

  @state()
  private _userCode: string = ``;

  @state()
  private _state: 'open' | 'compromised' | 'entering' | 'failed' = 'open';

  static styles = css`
    :host {
      display: none;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(4px);
      z-index: 1000;
    }
  `;

  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.updated(_changedProperties);
    if (_changedProperties.has('_state')) {
      if (this._state === 'open') {
        this.dispatchEvent(new CustomEvent('unlock'));
        this.style.display = 'none';
      } else {
        this.style.display = 'flex';
      }
    }
  }

  connectedCallback(): void {
    setInterval(() => this.checkDocumentFocus(), 300);
    // if (screenfull.isEnabled) {
    //   screenfull.on('change', () => {
    //     console.log('Am I fullscreen?', screenfull.isFullscreen ? 'Yes' : 'No');
    //   });
    // }
    super.connectedCallback();
    document.addEventListener('visibilitychange', this.checkHidden);
  }

  disconnectedCallback(): void {
    document.removeEventListener('visibilitychange', this.checkHidden);
  }

  checkDocumentFocus() {
    if (!document.hasFocus()) {
      console.log('test', this._state);
      this._state = 'compromised';
    }
  }

  checkHidden = () => {
    if (document.hidden) {
      this._state = 'compromised';
    }
  };
  handleInput(event) {
    this._userCode = event.target.value;
  }
  handleUnlock(event) {
    this._state = 'entering';
  }
  checkCode(event) {
    if (this._userCode == this._secretCode) {
      this._state = 'open';
    } else {
      this._state = 'failed';
    }
  }

  render() {
    switch (this._state) {
      case 'compromised': {
        return html`YOU're page is compromised<button @pointerdown=${this.handleUnlock}>Unlock</button>`;
      }
      case 'entering':
      case 'failed': {
        return html`<input .value=${this._userCode} @input=${this.handleInput} />
          <button @pointerdown=${this.checkCode}>check</button>
          ${this._state == 'failed' ? html`<p>Wrong code</p>` : nothing}`;
      }
    }

    return nothing;
  }
}

// return html`<button
//   @pointerdown=${() => screenfull.isEnabled && screenfull.request(this.closest('qti-assessment-test'))}
// >
//   fullscreen
// </button>`;
