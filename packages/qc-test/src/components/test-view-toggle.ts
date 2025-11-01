import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { prepareTemplate } from '@heximal/templates';
import { sessionContext } from '@qti-components/shared';

import type { PropertyValues } from 'lit';
import type { SessionContext } from '@qti-components/shared';

@customElement('test-view-toggle')
export class TestViewToggle extends LitElement {
  myTemplate: any;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  @consume({ context: sessionContext, subscribe: true })
  private sessionContext: SessionContext;

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
    this.dispatchEvent(
      new CustomEvent('on-test-switch-view', {
        composed: true,
        bubbles: true,
        detail: view
      })
    );
  }

  protected override firstUpdated(_changedProperties: PropertyValues): void {
    this.addEventListener('click', () => {
      if (this.sessionContext?.view === 'scorer') {
        this._switchView('candidate');
      } else {
        this._switchView('scorer');
      }
    });
  }

  override render() {
    return html`${this.myTemplate
      ? this.myTemplate({
          view: this.sessionContext?.view
        })
      : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-view-toggle': TestViewToggle;
  }
}
