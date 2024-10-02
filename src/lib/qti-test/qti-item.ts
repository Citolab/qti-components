import type { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('qti-item')
export class QtiItem extends LitElement {
  @property({ type: String, attribute: 'item-location' }) itemLocation = '';
  @property({ type: String, reflect: true }) identifier?: string;
  @property({ type: String }) href?: string;
  @property({ type: Boolean, attribute: false })
  disabled: boolean = false;

  @property({ type: Object, attribute: false })
  xmlDoc: DocumentFragment; // the XMLDocument

  @property({ type: String }) view: 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor' | '' =
    'candidate';

  willUpdate(changedProperties: Map<string | number | symbol, unknown>): void {
    if (changedProperties.has('disabled')) {
      if (this.assessmentItem) this.assessmentItem.disabled = this.disabled;
    }
    if (changedProperties.has('view')) {
      this.checkView();
    }
  }

  protected createRenderRoot() {
    return this;
  }

  /**
   * The XML content of the item.
   */
  @state()
  protected _xml: string = '';

  constructor() {
    super();
    this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<QtiAssessmentItem>) => {
      this.checkView();
    });
  }

  private checkView() {
    this.renderRoot.querySelectorAll('[view]')?.forEach((element: HTMLElement) => {
      element.getAttribute('view') === this.view ? element.classList.add('show') : element.classList.remove('show');
    });
    this.assessmentItem?.showCorrectResponse(this.view === 'scorer');
  }

  /**
   * Sets the XML content of the item.
   * @param val - The XML content.
   * @deprecated This method is deprecated. Please use the 'xmlDoc' setter instead.
   */

  remove() {
    this.renderRoot.firstElementChild?.remove();
  }

  /**
   * Sets the CSS content of the item.
   * @param val - The CSS content.
   */
  @property({ attribute: false })
  set css(val: string) {
    this.addStyleSheet(val);
  }
  get css() {
    return 'nope';
  }

  /**
   * Sets the CSS stylesheet of the item.
   * @param val - The CSS file content.
   * @deprecated This method is deprecated. Please use the 'css' setter instead.
   */
  async addStyleSheet(val: string) {
    await this.updateComplete;
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(val);
    (this.renderRoot as ShadowRoot).adoptedStyleSheets = [
      ...(this.renderRoot as ShadowRoot).adoptedStyleSheets,
      sheet
    ]; /* ...(this.renderRoot as ShadowRoot).adoptedStyleSheets, */
  }

  /**
   * Returns the assessment item.
   */
  get assessmentItem(): QtiAssessmentItem | null {
    return this.renderRoot?.querySelector('qti-assessment-item');
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this.updateComplete;
    this.dispatchEvent(
      new CustomEvent('qti-item-connected', {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier, href: this.href }
      })
    );
  }

  render() {
    return html`${this.xmlDoc}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
