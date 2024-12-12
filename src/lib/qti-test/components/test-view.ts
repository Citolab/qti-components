import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TestComponent } from './test-component.abstract';
import { watch } from '../../decorators/watch';

@customElement('test-view')
export class TestView extends TestComponent {
  static DEFAULT_VIEW_OPTIONS = ['author', 'candidate', 'proctor', 'scorer', 'testConstructor', 'tutor'];

  @property({ type: String })
  label = 'view';

  @property({ type: String, attribute: 'view-options' }) viewOptions = '';
  @watch('viewOptions')
  _handleViewOptionsChange = (_: string, viewOptions: string) => {
    console.log(viewOptions);
  };

  private _viewOptions: string[] = TestView.DEFAULT_VIEW_OPTIONS;

  // updated(changedProperties: PropertyValues) {
  //   super.updated(changedProperties);
  //   if (changedProperties.has('viewOptionsString')) {
  //     this._updateViewOptions();
  //   }
  // }

  // private _updateViewOptions() {
  //   if (this.viewOptionsString) {
  //     const options = this.viewOptionsString.split(',').map(opt => opt.trim());
  //     this.viewOptions = options.filter(opt => TestView.DEFAULT_VIEW_OPTIONS.includes(opt));
  //   } else {
  //     this.viewOptions = TestView.DEFAULT_VIEW_OPTIONS;
  //   }
  // }

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
