import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { prepareTemplate } from '@heximal/templates';
import { computedContext } from '@citolab/qti-components/qti-base';
import { dispatchPublic } from '@citolab/qti-components/qti-test/plugin-api';

import type { PropertyValues } from 'lit';
import type { ComputedContext } from '@citolab/qti-components/qti-base';
import type { View } from '@citolab/qti-components/qti-base';

export class TestViewToggle extends LitElement {
  myTemplate: any;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  @consume({ context: computedContext, subscribe: true })
  private computedContext?: ComputedContext;

  override connectedCallback(): void {
    super.connectedCallback();
    const templateElement = this.querySelector<HTMLTemplateElement>('template');
    if (!templateElement) {
      this.myTemplate = null;
      return;
    }
    this.myTemplate = prepareTemplate(templateElement);
  }

  _switchView(view: string) {
    dispatchPublic(this, 'qc-test-switch-view', view as View);
  }

  protected override firstUpdated(_changedProperties: PropertyValues): void {
    this.addEventListener('click', () => {
      if (this.computedContext?.view === 'scorer') {
        this._switchView('candidate');
      } else {
        this._switchView('scorer');
      }
    });
  }

  override render() {
    return html`${this.myTemplate
      ? this.myTemplate({
          view: this.computedContext?.view
        })
      : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-view-toggle': TestViewToggle;
  }
}
