import { ResponseInteraction } from '../qti-components/qti-utilities/ExpressionResult';
import { type QtiAssessmentItem } from '../qti-components/qti-assessment-item/qti-assessment-item';
import { css, html, LitElement } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import { watch } from '../decorators/watch';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { audienceContext } from '../context/audience-context';
import { ContextProvider } from '@lit-labs/context';

import styles from '../../styles.css?inline';

@customElement('qti-item')
export class QtiItem extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @watch('disabled', { waitUntilFirstUpdate: true })
  handleDisabledChange(old, disabled: boolean) {
    disabled && this._item?.setAttribute('disabled', '');
    !disabled && this._item?.removeAttribute('disabled');
  }

  @property({ type: Boolean }) readonly = false;
  @watch('readonly', { waitUntilFirstUpdate: true })
  handleReadonlyChange(old, readonly: boolean) {
    readonly && this._item?.setAttribute('readonly', '');
    !readonly && this._item?.removeAttribute('readonly');
  }

  @property({ type: Object, attribute: false }) responses: ResponseInteraction[];
  @watch('responses', { waitUntilFirstUpdate: true })
  handleResponsesChange(old, responses: ResponseInteraction[]) {
    this._item && (this._item.responses = responses);
  }

  public set qtiContext(context: {
    view: 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor';
  }) {
    this.provider.value.view = context.view;
    this.provider.updateObservers();
  }

  private provider = new ContextProvider(this, audienceContext, {
    view: 'candidate'
  });

  get _item(): QtiAssessmentItem {
    return this.shadowRoot?.querySelector('qti-assessment-item');
  }

  private _xml;
  set xml(val: string) {
    const oldVal = this._xml;
    this._xml = val;
    this.requestUpdate('xml', oldVal);
  }
  @property({ type: String })
  get xml() {
    return this._xml;
  }

  static override styles = css`
    :host {
      display: block;
    }
  `;

  public processResponse = () => this._item?.processResponse();
  public showCorrectResponse = () => this._item?.showCorrectResponse();
  public validateResponses = (): boolean => (this._item ? this._item.validateResponses() : false);
  public resetInteractions = () => this._item?.resetInteractions();

  connectedCallback(): void {
    super.connectedCallback();
    // const sheet = new CSSStyleSheet();
    // sheet.replaceSync(styles);
    // this.shadowRoot.adoptedStyleSheets.push(sheet);
    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    this.shadowRoot.appendChild(styleTag);
  }

  override render = () => html`${unsafeHTML(this._xml)}`;
}
