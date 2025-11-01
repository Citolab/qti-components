import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { watch } from '../../../src/lib/decorators/watch';
// import { computedContext } from '../../exports/computed.context';
import { sessionContext } from '../../../src/lib/exports/session.context';

// import type { ComputedContext } from '../../exports/computed.context';
import type { SessionContext } from '../../../src/lib/exports/session.context';

@customElement('test-view')
export class TestView extends LitElement {
  static DEFAULT_VIEW_OPTIONS = ['author', 'candidate', 'proctor', 'scorer', 'testConstructor', 'tutor'];

  @consume({ context: sessionContext, subscribe: true })
  private sessionContext: SessionContext;

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
        @change=${(e: Event) => {
          const el = e.target as HTMLSelectElement;
          this._switchView(el.value);
        }}
      >
        ${this._viewOptions.map(
          v => html`<option value="${v}" ?selected=${v === this.sessionContext.view}>${v}</option>`
        )}
      </select>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-view': TestView;
  }
}
