import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Interaction } from '../../../exports/interaction';
import { removeDoubleSlashes } from '../../internal/utils';

@customElement('qti-custom-interaction')
export class QtiCustomInteraction extends Interaction {
  // This custom-interaction support the CES API which is use in FACET
  //
  // It works like this:
  // 1. The CI manifest is fetched
  // 2. An iframe is created and the first style and first script from the manifest are loaded
  // 3. The first script is bootstrap.js which also creates an iframe and loads the first media from the manifest
  // 4. Communication is done via the CES API but because the iframe is not allowed to access the global CES object we need to use window.postMessage

  // To achieve this we change the package by replacing the bootstrap.js with our own and inject a proxy CES API that communicates via postMessage
  // Because we also want to run this in storybook, we cannot use window.top because to send messages there, because in case of storybook that is not the top window.
  // So we send messages to all parent windows
  private rawResponse: string;

  constructor() {
    super();
    this.handlePostMessage = this.handlePostMessage.bind(this);
  }

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

  // MH: Changed the default bootstrap.js to use the new CES API
  // Because the old one uses the global CES object that is not allowed to be accessed when the CI
  // is embedded in an iframe and coming from another domain
  // Therefor we need to use the new CES API to communicates via the broadcast API
  setupCES() {
    const iframe = this.shadowRoot.querySelector('#pciContainer') as HTMLIFrameElement,
      iframeDoc = iframe.contentDocument;

    // const channel = new BroadcastChannel('ces_channel');
    window.addEventListener('message', this.handlePostMessage);
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

  private getIFrames() {
    const iframesInShadowRoot = this.shadowRoot.querySelectorAll('iframe');
    const iframe = this.querySelectorAll('iframe');

    const outerIFrames = [...iframesInShadowRoot, ...iframe];
    for (const iframe of outerIFrames) {
      const iframeSrc = iframe.src;
      const isSameOrigin = new URL(iframeSrc, window.location.href).origin === window.location.origin;
      if (isSameOrigin) {
        try {
          const outerDoc = iframe.contentDocument || iframe.contentWindow.document;
          if (outerDoc) {
            this.getInnerIFrames(outerDoc, outerIFrames);
          }
        } catch (e) {
          console.error('Error accessing nested iframe:', e);
        }
      }
    }
    // get only unique iframes
    outerIFrames.forEach((iframe, index) => {
      if (outerIFrames.indexOf(iframe) !== index) {
        outerIFrames.splice(index, 1);
      }
    });
    return outerIFrames;
  }

  private getInnerIFrames(iframeDocument: Document, iframes = []) {
    // Get all iframes in the current document
    const currentIframes = iframeDocument.querySelectorAll('iframe');

    currentIframes.forEach(iframe => {
      // Add the current iframe to the list
      iframes.push(iframe);

      // Recursively get iframes within the current iframe
      // Check if the iframe src is from the same origin
      const iframeSrc = iframe.src;
      const isSameOrigin = new URL(iframeSrc, window.location.href).origin === window.location.origin;

      if (isSameOrigin) {
        try {
          const nestedDoc = iframe.contentDocument || iframe.contentWindow.document;
          this.getInnerIFrames(nestedDoc, iframes);
        } catch (e) {
          console.error('Error accessing nested iframe:', e);
        }
      } else {
        console.warn('Skipped cross-origin iframe:', iframeSrc);
      }
    });

    return iframes;
  }

  private postToWindowAndIframes(type: string, data: any) {
    window.postMessage({ type, data }, '*');
    const iframes = this.getIFrames();
    for (const iframe of iframes) {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type, data }, '*');
      }
    }
  }

  handlePostMessage(event: MessageEvent) {
    const { type, data } = event.data;
    switch (type) {
      case 'setResponse':
        this.rawResponse = data;
        this.saveResponse(data);
        break;
      case 'getResponse': {
        this.postToWindowAndIframes('responseData', this.rawResponse);
        break;
      }
      case 'getMedia': {
        const mediaData = this.manifest.media.map(media => {
          const url = media.startsWith('http') ? media : removeDoubleSlashes(this.baseRefUrl + '/' + media);
          return url;
        });
        this.postToWindowAndIframes('mediaData', mediaData);
        break;
      }
      case 'setStageHeight':
        console.log('setStageHeight not implemented');
        break;
    }
  }

  validate(): boolean {
    return this.rawResponse !== '';
  }

  get value(): string | string[] {
    return this.rawResponse;
  }

  set value(val: string | string[]) {
    if (typeof val === 'string') {
      this.rawResponse = val;
      this.saveResponse(val);
    } else {
      throw new Error('Value must be a string');
    }
  }

  override disconnectedCallback(): void {
    window.removeEventListener('message', this.handlePostMessage);
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
