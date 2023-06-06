import { ResponseInteraction } from '../qti-components/qti-utilities/ExpressionResult';
import { type QtiAssessmentItem } from '../qti-components/qti-assessment-item/qti-assessment-item';
import { css, html, LitElement } from 'lit';
import { ScaleToFitMixin } from '../qti-components/utilities/scale-to-fit/scale-to-fit.mixin';

import { customElement, property, state } from 'lit/decorators.js';
import { watch } from '../qti-components/utilities/decorators/watch';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { loggerContext } from '../qti-components/utilities/context/context';
import { ContextProvider } from '@lit-labs/context';

import styles from '../../styles.css?inline';

@customElement('qti-item')
export class QtiItem extends ScaleToFitMixin(LitElement, 'qti-assessment-item') {
  // extends ScaleToFitMixin(LitElement, 'qti-assessment-item') {
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

  private provider = new ContextProvider(this, loggerContext, {
    log: msg => console.log(`[my-app] ${msg}`),
    view: 'candidate'
  });

  private _xml;

  get _item(): QtiAssessmentItem {
    return this.shadowRoot?.querySelector('qti-assessment-item');
  }

  set xml(val: string) {
    const oldVal = this._xml;
    this._xml = val;
    this.requestUpdate('xml', oldVal);
    requestAnimationFrame(() => {
      this._item?.classList.add('qti-theme-raised');
    });
  }

  @property({ type: String })
  get xml() {
    return this._xml;
  }

  // @property({ type: String, attribute: false }) xml: string;
  // @watch('xml', { waitUntilFirstUpdate: false })
  // handleXMLChange(old, xml: boolean) {
  //   console.log('xmlChange');
  //   this._item = this.shadowRoot.querySelector('qti-assessment-item');
  //   if (this._item) {
  //     this.disabled && this._item.setAttribute('disabled', '');
  //     this.readonly && this._item.setAttribute('readonly', '');
  //     this.responses && (this._item.responses = this.responses);
  //   }
  // }

  static override styles = css`
    :host {
      display: block; /* necessary to calculate scaling position */
      width: 100%;
      height: 100%;
      overflow: auto;
    }
    qti-assessment-item {
      display: block; /* necessary to calculate scaling position */
      width: 100%;
    }
    :host([scales]) qti-assessment-item {
      aspect-ratio: 4 / 3;
      width: 800px;
      transform-origin: 0 0;
    }
  `;

  public processResponse = () => this._item?.processResponse();
  public showCorrectResponse = () => this._item?.showCorrectResponse();
  public validateResponses = (): boolean => (this._item ? this._item.validateResponses() : false);
  public resetInteractions = () => this._item?.resetInteractions();

  // private handleSlotchange(e) {
  //   const childNodes = e.target.assignedNodes({ flatten: true });
  //   this._item = null;
  //   childNodes.forEach(node => {
  //     if (node.nodeName == 'QTI-ASSESSMENT-ITEM') {
  //       this._item = node as QtiAssessmentItem;
  //       this.disabled && this._item.setAttribute('disabled', '');
  //       this.readonly && this._item.setAttribute('readonly', '');
  //       this.responses && (this._item.responses = this.responses);
  //     }
  //   });
  // }

  connectedCallback(): void {
    super.connectedCallback();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    // push the sheet onto the existing styles, else it overwrites the styles for scaling
    this.shadowRoot.adoptedStyleSheets.push(sheet);
  }

  override render = () => html`${unsafeHTML(this._xml)}`;

  // override render = () => html`<slot @slotchange=${this.handleSlotchange}></slot>`;

  //   override render = () => html`<iframe
  //     frameborder="0"
  //     style="width:100%; height:100%"
  //     title="item preview"
  //     srcdoc=${`<html>
  //   <head>
  //   <link rel="stylesheet" href="https://unpkg.com/@citolab/qti-components@6.0.1-1/dist/themes/qti.css" />
  //   <script type="module" src="https://unpkg.com/@citolab/qti-components@6.0.1-1/dist/index.js"></script>
  //   <script src="https://unpkg.com/mathml-elements@latest/dist/bundled/mathml.min.js"></script>
  //   </head>
  //   <body class="qti-theme-ims">
  //     ${this.xml}
  //   </body>
  // </html>`}
  //   ></iframe>`;
}
