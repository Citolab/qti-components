import { LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';

/*
<test-paging-tmpl-stampino class="flex">
  <template>
    <template type="repeat" repeat="{{ items }}">
      <button class="flex h-4 w-4 cursor-pointer items-center justify-center border-2" aria-label="Button"></button>
    </template>
  </template>
</test-paging-tmpl-stampino>
*/
@customElement('test-paging-tmpl-stampino')
export class TestPagingTmplStampino extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  @property({ type: String, attribute: 'info-category' })
  private infoCategory = null;

  protected createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.addEventListener('pointerdown', e => {
      console.log(e.target);
      this._requestItem((e as any).target.getAttribute('identifier'));
    });
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

    const computedItems = items.map(item => {
      const rawscore = item.variables.find(vr => vr.identifier == 'SCORE');
      const score = parseInt(rawscore?.value?.toString());
      const completionStatus = item.variables.find(v => v.identifier === 'completionStatus')?.value;
      const type = item.category !== this.infoCategory ? 'regular' : 'info'; // rounded-full
      const active = this._sessionContext.identifier === item.identifier; // !border-sky-600
      const correct =
        this._sessionContext.view === 'scorer' &&
        type == 'regular' &&
        score !== undefined &&
        !isNaN(score) &&
        score > 0; // bg-green-100 border-green-400
      const incorrect =
        this._sessionContext.view === 'scorer' &&
        type == 'regular' &&
        score !== undefined &&
        !isNaN(score) &&
        score <= 0; // bg-red-100 border-red-400
      const answered =
        this._sessionContext.view === 'candidate' &&
        completionStatus === 'completed' &&
        item.category !== this.infoCategory; // bg-slate-300 shadow-sm

      return {
        ...item,
        type,
        active,
        correct,
        incorrect,
        answered
      };
    });

    const template = this.firstElementChild as HTMLTemplateElement;
    const myTemplate = prepareTemplate(template);
    return myTemplate({ items: computedItems, viewmode: this._sessionContext.view });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-paging-tmpl-stampino': TestPagingTmplStampino;
  }
}
