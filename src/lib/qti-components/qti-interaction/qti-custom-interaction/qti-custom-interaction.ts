import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Interaction } from '../internal/interaction/interaction';

@customElement('qti-custom-interaction')
export class QtiCustomInteraction extends Interaction {
  private rawResponse: string;

  @property({ type: String, attribute: 'response-identifier' })
  responseIdentifier: string;

  @property({ type: String, attribute: 'data' })
  data: string;

  @property({ type: String, attribute: 'data-base-item' })
  baseItemUrl: string;

  @property({ type: String, attribute: 'data-base-ref' })
  baseRefUrl: string;

  @property({ type: String, attribute: 'id' })
  id: string;

  @state()
  private _errorMessage: string = null;

  manifest: {
    script: string[];
    style: string[];
    media: string[];
  };

  override connectedCallback(): void {
    super.connectedCallback();

    const uriToManifest = this.baseItemUrl + this.data;
    // fetch the json file located at the data attribute
    fetch(uriToManifest)
      .then(response => response.json())
      .then(data => {
        this.manifest = data;
        this.setupCES();
      })
      .catch(err => {
        this._errorMessage = err;
      });
  }

  setupCES() {
    const iframe = this.shadowRoot.querySelector('#pciContainer') as HTMLIFrameElement,
      iframeWin = iframe.contentWindow || iframe,
      iframeDoc = iframe.contentDocument;

    iframeWin['CES'] = {
      setResponse: data => {
        // console.log('setting the data', data);
        this.rawResponse = data;
        this.saveResponse(data);
      },
      getResponse: () => {
        // console.log('getting the data');
        return this.rawResponse;
      },
      getMedia: () => {
        return this.manifest.media.map(media => this.baseRefUrl + media);
      },
      setStageHeight: () => {
        console.log('not implemented');
      }
    };

    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <link href='${this.baseRefUrl + this.manifest.style[0]}' rel="stylesheet" />
          <script src='${this.baseRefUrl + this.manifest.script[0]}'></script>
        </head>
        <body></body>
      </html>
      `);

    iframeDoc.close();
  }

  validate(): boolean {
    return this.rawResponse !== '';
  }

  set response(val: Readonly<string | string[]>) {
    this.rawResponse = val as string;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  override render() {
    return html`<iframe
        width=${this.getAttribute('width')}
        height=${this.getAttribute('height')}
        frameborder="0"
        title="pciContainer"
        id="pciContainer"
      >
      </iframe>
      ${this._errorMessage &&
      html`<div style="color:red">
        <h1>Error</h1>
        ${this._errorMessage}
      </div>`}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-custom-interaction': QtiCustomInteraction;
  }
}
