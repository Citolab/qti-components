import { html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-paging-tmpl-button')
export class TestPagingTmplButton extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  @property({ type: String, attribute: 'info-category' })
  private infoCategory = null;

  protected createRenderRoot() {
    return this;
  }

  _requestItem(identifier: string) {
    this.dispatchEvent(
      new CustomEvent('qti-test-set-item', {
        composed: true,
        bubbles: true,
        detail: identifier
      })
    );
  }

  render() {
    const { items } = this._testContext;

    const template = this.firstElementChild as HTMLTemplateElement;
    const content = template.content;

    return html`
      ${items.map(item => {
        const rawscore = item.variables.find(vr => vr.identifier == 'SCORE');
        const score = parseInt(rawscore?.value?.toString());
        const completionStatus = item.variables.find(v => v.identifier === 'completionStatus')?.value;

        const button = content.querySelector('button')!.cloneNode(true) as HTMLButtonElement;
        button.addEventListener('click', () => this._requestItem(item.identifier));
        button.setAttribute('id', item.identifier);

        if (
          this._sessionContext.view === 'scorer' &&
          item.category !== this.infoCategory &&
          score !== undefined &&
          !isNaN(score)
        ) {
          score > 0
            ? button.classList.add(`bg-green-100`, `border-green-400`)
            : button.classList.add(`bg-red-100`, `border-red-400`);
        }
        if (
          this._sessionContext.view === 'candidate' &&
          completionStatus === 'completed' &&
          item.category !== this.infoCategory
        ) {
          button.classList.add('bg-slate-300', 'shadow-sm');
        }
        if (item.category !== this.infoCategory) {
          button.classList.add('rounded-full');
        }
        if (this._sessionContext.identifier === item.identifier) {
          button.classList.add('!border-sky-600');
        }

        return button;
      })}
    `;
  }
}
