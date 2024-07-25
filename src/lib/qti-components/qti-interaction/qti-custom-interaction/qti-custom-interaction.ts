import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Interaction } from '../internal/interaction/interaction';
import { removeDoubleSlashes } from '../../internal/utils';

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

  private channel = new BroadcastChannel('ces_channel');

  manifest: {
    script: string[];
    style: string[];
    media: string[];
  };

  override connectedCallback(): void {
    super.connectedCallback();

    const uriToManifest = this.data.startsWith('http')
      ? this.data
      : removeDoubleSlashes(this.baseItemUrl + '/' + this.data);
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

    // const channel = new BroadcastChannel('ces_channel');
    this.channel.onmessage = (event: MessageEvent) => {
      const { type, data } = event.data;
      switch (type) {
        case 'setResponse':
          this.rawResponse = data;
          this.saveResponse(data);
          break;
        case 'getResponse':
          this.channel.postMessage({ type: 'responseData', data: this.rawResponse });
          break;
        case 'getMedia': {
          const mediaData = this.manifest.media.map(media => {
            const url = media.startsWith('http') ? media : removeDoubleSlashes(this.baseRefUrl + '/' + media);
            return url;
          });
          this.channel.postMessage({ type: 'mediaData', data: mediaData });
          break;
        }
        case 'setStageHeight':
          console.log('setStageHeight not implemented');
          break;
      }
    };

    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <link href='${removeDoubleSlashes(`${this.baseRefUrl}/${this.manifest.style[0]}`)}' rel="stylesheet" />
          <script src='${removeDoubleSlashes(`${this.baseRefUrl}/${this.manifest.script[0]}`)}'></script>
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
    this.channel.close();
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
