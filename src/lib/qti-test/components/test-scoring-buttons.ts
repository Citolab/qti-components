import { html, LitElement, nothing } from 'lit';
import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { prepareTemplate } from 'stampino';

import { computedContext } from '../../exports/computed.context';

import type { TemplateFunction } from 'stampino';
import type { OutcomeVariable } from '../../exports/variables';
import type { ComputedContext } from '../../exports/computed.context';

@customElement('test-scoring-buttons')
export class TestScoringButtons extends LitElement {
  @property({ type: String, attribute: 'view' }) view = ''; // is only an attribute, but this is here because.. react
  @property({ type: Boolean }) disabled: boolean = false;
  myTemplate: TemplateFunction | null = null;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    const templateElement = this.querySelector<HTMLTemplateElement>('template');
    if (!templateElement) {
      this.myTemplate = null;
      return;
    }
    this.myTemplate = prepareTemplate(templateElement);
  }

  @consume({ context: computedContext, subscribe: true })
  protected computedContext?: ComputedContext;

  private _changeOutcomeScore(value: number) {
    const testPart = this.computedContext?.testParts.find(testPart => testPart.active);
    const sectionItems = testPart.sections.flatMap(section => section.items);
    const currentItemIdentifier = sectionItems.find(item => item.active)?.identifier;

    this.dispatchEvent(
      new CustomEvent('test-update-outcome-variable', {
        detail: {
          assessmentItemRefId: currentItemIdentifier,
          outcomeVariableId: 'SCORE',
          value
        },
        bubbles: true
      })
    );
  }

  render() {
    const activeItem = this.computedContext?.testParts
      .flatMap(testPart => testPart.sections.flatMap(section => section.items))
      .find(item => item.active);

    if (!activeItem || !activeItem.variables) return html``;

    const maxScore = activeItem.variables.find(vr => vr.identifier == 'MAXSCORE')?.value;
    const scoreOutcome = activeItem.variables.find(vr => vr.identifier == 'SCORE') as OutcomeVariable;

    const score = scoreOutcome?.value;

    const disabled = !(scoreOutcome?.externalScored === 'human');

    if (!maxScore || !scoreOutcome) return nothing;
    const scores = [...Array(Number(maxScore) + 1).keys()];

    return html`${this.myTemplate ? this.myTemplate({ scores, score, disabled }) : nothing}`;
  }

  constructor() {
    super();
    this.addEventListener('click', e => {
      const target = e.target as HTMLInputElement;
      const value = parseInt(target.value);
      if (target.tagName === 'INPUT') {
        this._changeOutcomeScore(value);
      }
    });

    // return maxScore
    //   ? html`
    //       <form part="form">
    //         ${[...Array(Number(maxScore) + 1).keys()].map(itemIndex => {
    //           const identifier = `scoring-buttons${itemIndex}${activeItem.identifier}`;
    //           return html` <input
    //               part="input"
    //               type="radio"
    //               ?disabled=${this.disabled}
    //               .checked=${itemIndex === Number(score)}
    //               @change=${() => this._changeOutcomeScore(itemIndex)}
    //               id=${identifier}
    //               name=${`scoring-buttons-${activeItem.identifier}`}
    //               value=${itemIndex}
    //             />

    //             <label part="label" for=${identifier}>${itemIndex}</label>`;
    //         })}
    //       </form>
    //       <slot></slot>
    //     `
    //   : nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-scoring-buttons': TestScoringButtons;
  }
}
