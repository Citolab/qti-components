import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
import { watch } from '../../../decorators/watch';
import itemCss from '../../../../item.css?inline';
import { qtiTransformItem } from '../../../qti-transformers';

/**
 * `<item-container>` is a custom element designed for hosting the qti-assessment-item.
 * The `qti-assessment-item` will be placed inside the shadow DOM of this element.
 * The element loads the item from the provided URL and renders it inside the shadow DOM.
 *
 * ### Styling
 * Add a class to the element for styling.
 *
 * ```html
 * <qti-item>
 *   <item-container class="m-4 bg-white" item-url="./path/to/item.xml"></item-container>
 * </qti-item>
 * ```
 */
@customElement('item-container')
export class ItemContainer extends LitElement {
  /** URL of the item to load */
  @property({ type: String, attribute: 'item-url' })
  itemURL: string = null;

  /** A parsed HTML document */
  @state()
  itemDoc: DocumentFragment = null;

  /** The raw XML string */
  @state()
  itemXML: string = null;

  /** Template content if provided */
  private templateContent = null;

  @watch('itemURL', { waitUntilFirstUpdate: true })
  protected async handleItemURLChange() {
    if (!this.itemURL) return;
    try {
      const api = await qtiTransformItem().load(this.itemURL);
      this.itemDoc = api.htmlDoc();
    } catch (error) {
      console.error('Error loading or parsing XML:', error);
    }
  }

  @watch('itemXML', { waitUntilFirstUpdate: true })
  protected handleItemXMLChange() {
    if (!this.itemXML) return;
    try {
      this.itemDoc = qtiTransformItem().parse(this.itemXML).htmlDoc();
    } catch (error) {
      console.error('Error parsing XML:', error);
    }
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.initializeTemplateContent();
    this.applyStyles();
    if (this.itemURL) {
      this.handleItemURLChange();
    }
    if (this.itemXML) {
      this.handleItemXMLChange();
    }
  }

  private initializeTemplateContent() {
    const template = this.querySelector('template') as HTMLTemplateElement;
    this.templateContent = template ? template.content : html``;
  }

  private applyStyles() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(itemCss);
    this.shadowRoot.adoptedStyleSheets = [sheet];
  }

  render() {
    return html`
      ${this.templateContent}
      <slot></slot>
      ${until(this.itemDoc, html`<span>Loading...</span>`)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'item-container': ItemContainer;
  }
}
