import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { TestComponent } from './test-component.abstract';
import { watch } from '../../decorators/watch';

@customElement('test-view')
export class TestView extends TestComponent {
  static DEFAULT_VIEW_OPTIONS = ['author', 'candidate', 'proctor', 'scorer', 'testConstructor', 'tutor'];

  /** label accompanying the select view dropdown  */
  @property({ type: String })
  label = 'view';

  /** The options to display in the dropdown, default: ['author', 'candidate', 'proctor', 'scorer', 'testConstructor', 'tutor'] */
  @property({ type: String, attribute: 'view-options' }) viewOptions;
  @watch('viewOptions', { waitUntilFirstUpdate: true })
  protected _handleViewOptionsChange = () => {
    this.updateViewOptions();
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.updateViewOptions();
  }

  @state()
  private _viewOptions: string[] = TestView.DEFAULT_VIEW_OPTIONS;

  private updateViewOptions() {
    if (this.viewOptions) {
      const options = this.viewOptions.split(',').map(opt => opt.trim());
      this._viewOptions = options.filter(opt => TestView.DEFAULT_VIEW_OPTIONS.includes(opt));
    } else {
      this._viewOptions = TestView.DEFAULT_VIEW_OPTIONS;
    }
  }

  protected _switchView(view: string) {
    this.dispatchEvent(
      new CustomEvent('on-test-switch-view', {
        composed: true,
        bubbles: true,
        detail: view
      })
    );
  }

  render() {
    return html`
      <label part="label" for="viewSelect">${this.label}</label>
      <select
        part="select"
        id="viewSelect"
        .disabled=${this.disabled}
        @change=${(e: Event) => {
          const el = e.target as HTMLSelectElement;
          this._switchView(el.value);
        }}
      >
        ${this._viewOptions.map(v => html`<option value="${v}" ?selected=${v === this.view}>${v}</option>`)}
      </select>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-view': TestView;
  }
}
