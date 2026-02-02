import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { removeDoubleSlashes } from '@qti-components/base';
import { Interaction } from '@qti-components/base';

/**
 * CES (Custom Element Standard) Custom Interaction Support
 *
 * This component provides runtime support for legacy custom interactions that were built
 * for the CES player - the predecessor to what is now known as FACET and the Trifork QTI Player.
 *
 * These custom interactions use a specific API pattern:
 * - A manifest.json file that references script, style, and media files
 * - A bootstrap.js script that creates an iframe and loads the interaction's index.html
 * - A global CES object that provides: getMedia(), getResponse(), setResponse(), setStageHeight()
 *
 * The challenge is that when these interactions are embedded in iframes (especially those
 * created via document.write() which have about:blank origin), they cannot:
 * - Access the parent's global CES object (cross-origin restriction)
 * - Load external scripts via service workers (about:blank is not controlled)
 *
 * This implementation solves these problems by:
 * 1. Fetching the interaction's index.html from the main window (where service workers work)
 * 2. Injecting a CES proxy (registerCES) that uses postMessage to communicate with the parent
 * 3. Creating a blob URL for the modified HTML
 * 4. Using a simplified bootstrap (ciBootstrap) that loads the pre-created blob URL
 *
 * This approach is transparent - the original package files remain unchanged and the
 * transformation happens entirely at runtime within this web component.
 */

// CES API proxy that gets injected into the index.html
// This provides the CES object that the custom interaction expects,
// but uses postMessage to communicate with the parent qti-custom-interaction component
const registerCES = `
const postToParentWindows = (type, data) => {
    window.top.postMessage(data ? { type, data } : { type }, '*');
    let w = window.parent;
    while (w) {
      if (w !== window.top) {
          w.postMessage({ type, data }, '*');
      }
      if (w !== w.parent) {
        w = w.parent;
      } else {
        w = null;
      }
    }
};

window.CES = {
    media: null,
    response: null,
    load: () => {
      let resolveCount = 0;

      const handleMessage = (event) => {
        if (event.data.type === "mediaData") {
          const media = event.data.data;
          CES.media = media;
          resolveCount++;
        } else if (event.data.type === "responseData") {
          const response = event.data.data;
          if (response && Array.isArray(response) && response.length > 0) {
            // state is stored in the first element of the array
            CES.response = response[0];
            // Wait a short moment to ensure CES.response is set
            setTimeout(() => {
              // Re-create the Controller instance if it exists
              if (typeof Controller === 'function') {
                console.log("Re-creating Controller instance");
                ctrl = new Controller();
              }
            }, 50);
          } else {  
            CES.response = response;
          }
          resolveCount++;
        }
        if (resolveCount === 2) {
          //window.removeEventListener("message", handleMessage);
        }
      };
      window.addEventListener("message", handleMessage);
      postToParentWindows("getMedia");
      postToParentWindows("getResponse");
    },
    setResponse: (data) => {
      postToParentWindows("setResponse", data);
    },
    getResponse: () => {
      return CES.response;
    },
    getMedia: () => {
      return CES.media;
    },
    setStageHeight: () => {
      postToParentWindows("setStageHeight");
    },
};
CES.load();
`;

// Simple bootstrap that just waits for the blob URL and creates the iframe
const ciBootstrap = `
  window.onload = function () {
    const handleMessage = (event) => {
      if (event.data.type === 'blobUrl') {
        const blobUrl = event.data.data;
        var n = document.createElement('iframe');
        n.frameBorder = '0';
        n.scrolling = 'no';
        n.src = blobUrl;
        n.style.width = '100%';
        n.style.height = '100%';
        document.body.appendChild(n);
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
    // Request the blob URL from parent
    let w = window.parent;
    while (w) {
      w.postMessage({ type: 'getBlobUrl' }, '*');
      if (w !== w.parent) {
        w = w.parent;
      } else {
        w = null;
      }
    }
  };
`;

/**
 * QTI Custom Interaction component for legacy CES-based interactions.
 *
 * This component implements support for custom interactions originally built for the CES
 * (Custom Element Standard) player - the predecessor to FACET and the Trifork QTI Player.
 *
 * @remarks
 * The interaction workflow:
 * 1. Fetch the CI manifest (JSON file with script, style, media references)
 * 2. Check if bootstrap.js uses the CES API
 * 3. If CES is used:
 *    - Fetch index.html from main window (where service worker/fetch works)
 *    - Inject registerCES proxy script for postMessage-based communication
 *    - Create blob URL and pass it to ciBootstrap
 * 4. Create pciContainer iframe with style and bootstrap script
 * 5. Handle postMessage events for getMedia, getResponse, setResponse, getBlobUrl
 *
 * The postMessage bridge is necessary because:
 * - Iframes created via document.write() have about:blank origin
 * - They cannot access the parent's global CES object (cross-origin)
 * - Service workers don't control about:blank documents
 *
 * Messages are sent to all parent windows to support embedding scenarios like Storybook
 * where window.top might not be the actual host application.
 */
@customElement('qti-custom-interaction')
export class QtiCustomInteraction extends Interaction {
  private rawResponse: string | string[] = '';
  private _manifestUrl: string = null;
  private _resourceBaseUrl: string = null;

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
  override id: string;

  @state()
  private _errorMessage: string = null;
  manifest: {
    script: string[];
    style: string[];
    media: string[];
  };
  // Pre-created blob URL for the index.html with injected CES proxy
  private _contentBlobUrl: string = null;

  override connectedCallback(): void {
    super.connectedCallback();

    // Support two QTI formats:
    // 1. data attribute directly on qti-custom-interaction: <qti-custom-interaction data="manifest.json">
    // 2. object child element: <qti-custom-interaction><object data="manifest.json"></qti-custom-interaction>
    let manifestPath = this.data;

    if (!manifestPath) {
      // Try to get from child <object> element
      const objectEl = this.querySelector('object[data]');
      if (objectEl) {
        manifestPath = objectEl.getAttribute('data');
        // Also get width/height from the object element if available
        const width = objectEl.getAttribute('width');
        const height = objectEl.getAttribute('height');
        if (width) this.setAttribute('width', width);
        if (height) this.setAttribute('height', height);
      }
    }

    if (!manifestPath) {
      this._errorMessage = 'No manifest path found (neither data attribute nor object child)';
      return;
    }

    const uriToManifest =
      manifestPath.startsWith('http') || manifestPath.startsWith('blob')
        ? manifestPath
        : removeDoubleSlashes((this.baseItemUrl || '') + '/' + manifestPath);
    this._manifestUrl = new URL(uriToManifest, window.location.href).toString();
    // fetch the json file located at the data attribute
    fetch(uriToManifest)
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.manifest = data;
        this.setupCES();
      })
      .catch(err => {
        this._errorMessage = err;
      });
  }

  /**
   * Sets up the CES custom interaction by creating the iframe structure and
   * handling the CES API communication via postMessage.
   *
   * For interactions that use CES, this method:
   * 1. Fetches the original bootstrap.js and checks if it uses CES
   * 2. If CES is used, fetches index.html and injects the registerCES proxy
   * 3. Creates a blob URL for the modified HTML (stored in _contentBlobUrl)
   * 4. Replaces bootstrap.js with ciBootstrap that loads the blob URL
   * 5. Sets up postMessage listeners for CES API calls
   */
  async setupCES() {
    const iframe = this.shadowRoot.querySelector('#pciContainer') as HTMLIFrameElement;
    const iframeDoc = iframe.contentDocument;

    if (!this.manifest.script || this.manifest.script.length === 0) {
      this._errorMessage = 'No script found in manifest';
      return;
    }
    if (!this.manifest.style || this.manifest.style.length === 0) {
      this._errorMessage = 'No style found in manifest';
      return;
    }
    const cssRef = this.manifest.style[0];

    const baseCandidates = this.getBaseCandidates();
    console.debug('[qti-custom-interaction] manifest url', this._manifestUrl);
    console.debug('[qti-custom-interaction] base candidates', baseCandidates);
    console.debug('[qti-custom-interaction] refs', { cssRef, media: this.manifest.media });

    const cssResolved = await this.resolveResourceWithFallback(cssRef, baseCandidates);
    const cssUrl = cssResolved.url;
    if (cssResolved.baseUrl && !this._resourceBaseUrl) {
      this._resourceBaseUrl = cssResolved.baseUrl;
    }
    console.debug('[qti-custom-interaction] css resolved', cssResolved);

    // Always use the built-in ciBootstrap instead of the package's bootstrap.js.
    // The package's bootstrap.js is the original CES version which doesn't work
    // in the iframe/postMessage setup. Our ciBootstrap handles this correctly.
    const usesCES = true;
    console.debug('[qti-custom-interaction] using built-in ciBootstrap (skipping server bootstrap.js)');

    // If the original bootstrap.js uses CES, we need to:
    // 1. Fetch the index.html from here (main window, where service worker works)
    // 2. Inject the registerCES proxy script
    // 3. Create a blob URL and store it
    // 4. Use ciBootstrap to request and load the blob URL
    if (usesCES) {
      // Try to get index.html path from manifest.media, or construct it from the manifest path
      let indexUrl = '';
      if (this.manifest.media && this.manifest.media.length > 0) {
        const mediaRef = this.manifest.media[0];
        const indexResolved = await this.resolveResourceWithFallback(mediaRef, baseCandidates, {
          returnText: true
        });
        indexUrl = indexResolved.url;
        if (indexResolved.baseUrl && !this._resourceBaseUrl) {
          this._resourceBaseUrl = indexResolved.baseUrl;
        }
        console.debug('[qti-custom-interaction] index resolved (media)', {
          url: indexResolved.url,
          baseUrl: indexResolved.baseUrl,
          hasText: Boolean(indexResolved.text)
        });
        if (indexResolved.text) {
          let html = indexResolved.text;

          // Inject the CES proxy script after <head>
          const cesScript = '<script>' + registerCES + '</' + 'script>';
          const headIndex = html.indexOf('<head>');
          if (headIndex !== -1) {
            html = html.slice(0, headIndex + 6) + cesScript + html.slice(headIndex + 6);
          } else {
            // If no <head>, prepend to document
            html = cesScript + html;
          }

          // Create a blob URL for the modified HTML
          const blob = new Blob([html], { type: 'text/html' });
          this._contentBlobUrl = URL.createObjectURL(blob);
        }
      } else {
        // If no media array, try to construct index.html path from the manifest location
        // Assume index.html is in the same directory as the manifest
        const manifestPath = this.data || 'manifest.json';
        const basePath = manifestPath.includes('/') 
          ? manifestPath.substring(0, manifestPath.lastIndexOf('/'))
          : '';
        const indexPath = basePath ? `${basePath}/index.html` : 'index.html';
        const indexResolved = await this.resolveResourceWithFallback(indexPath, baseCandidates, {
          returnText: true
        });
        indexUrl = indexResolved.url;
        if (indexResolved.baseUrl && !this._resourceBaseUrl) {
          this._resourceBaseUrl = indexResolved.baseUrl;
        }
        console.debug('[qti-custom-interaction] index resolved (fallback)', {
          url: indexResolved.url,
          baseUrl: indexResolved.baseUrl,
          hasText: Boolean(indexResolved.text)
        });
        if (indexResolved.text) {
          let html = indexResolved.text;

          // Inject the CES proxy script after <head>
          const cesScript = '<script>' + registerCES + '</' + 'script>';
          const headIndex = html.indexOf('<head>');
          if (headIndex !== -1) {
            html = html.slice(0, headIndex + 6) + cesScript + html.slice(headIndex + 6);
          } else {
            // If no <head>, prepend to document
            html = cesScript + html;
          }

          // Create a blob URL for the modified HTML
          const blob = new Blob([html], { type: 'text/html' });
          this._contentBlobUrl = URL.createObjectURL(blob);
        }
      }

      if (indexUrl && !this._contentBlobUrl) {
        try {
          const indexResponse = await fetch(indexUrl);
          if (indexResponse.ok) {
            let html = await indexResponse.text();

            // Inject the CES proxy script after <head>
            const cesScript = '<script>' + registerCES + '</' + 'script>';
            const headIndex = html.indexOf('<head>');
            if (headIndex !== -1) {
              html = html.slice(0, headIndex + 6) + cesScript + html.slice(headIndex + 6);
            } else {
              // If no <head>, prepend to document
              html = cesScript + html;
            }

            // Create a blob URL for the modified HTML
            const blob = new Blob([html], { type: 'text/html' });
            this._contentBlobUrl = URL.createObjectURL(blob);
          } else {
            console.error(`Failed to fetch index.html: ${indexResponse.status}`);
          }
        } catch (e) {
          console.error(`Error fetching index.html: ${e}`);
        }
      }
    }

    const inlineScript = `<script>${ciBootstrap}</script>`;
    console.debug('[qti-custom-interaction] using ciBootstrap inline script');

    window.addEventListener('message', this.handlePostMessage);
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          ${cssUrl ? `<link href='${cssUrl}' rel="stylesheet" />` : ''}
          ${inlineScript}
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

  private getInnerIFrames(iframeDocument: Document, iframes: HTMLIFrameElement[] = []) {
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
    if (type && type !== 'setResponse') {
      console.debug('[qti-custom-interaction] postMessage', { type, data });
    }
    switch (type) {
      case 'setResponse':
        if (data === null || !(Array.isArray(data) && data.length === 1 && data[0] === '')) {
          this.rawResponse = data;
          this.saveResponse(data);
        }
        break;
      case 'getResponse': {
        this.postToWindowAndIframes('responseData', this.rawResponse);
        break;
      }
      case 'getBlobUrl': {
        // Send the pre-created blob URL to the requesting iframe
        if (this._contentBlobUrl) {
          this.postToWindowAndIframes('blobUrl', this._contentBlobUrl);
        }
        break;
      }
      case 'getMedia': {
        const baseCandidates = this.getBaseCandidates();
        const mediaData = this.manifest.media.map(media => {
          if (media.startsWith('http') || media.startsWith('blob')) {
            return media;
          }
          const baseUrl = this._resourceBaseUrl || baseCandidates[0];
          if (!baseUrl) {
            return media;
          }
          return new URL(media, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
        });
        console.debug('[qti-custom-interaction] mediaData', mediaData);
        this.postToWindowAndIframes('mediaData', mediaData);
        break;
      }
      case 'setStageHeight':
        console.log('setStageHeight not implemented');
        break;
    }
  }

  validate(): boolean {
    if (!this.rawResponse) {
      return false;
    }
    if (Array.isArray(this.rawResponse)) {
      if (this.rawResponse.length === 0) {
        return false;
      }
      // check if one of the values has a value
      for (const value of this.rawResponse) {
        if (value !== '' && value !== null) {
          return true;
        }
      }
    }
    return true;
  }

  get response(): string | string[] | null {
    return (this.rawResponse as string | string[]) || null;
  }

  set response(val: string | string[] | null) {
    if (typeof val === 'string') {
      this.rawResponse = val;
      this.saveResponse(val);
    } else if (Array.isArray(val)) {
      this.rawResponse = val;
    } else if (!val) {
      // do nothing
    } else {
      throw new Error('Value must be a string or an array of strings');
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

  private getBaseCandidates(): string[] {
    const candidates = [this._resourceBaseUrl, this.baseRefUrl, this.baseItemUrl, this.getManifestBaseUrl()];
    const resolved = candidates.filter(Boolean).map(base => new URL(base, window.location.href).toString());

    // Also add the manifest's parent directory (e.g. go up from .../json/ to .../)
    const manifestParent = this.getManifestParentBaseUrl();
    if (manifestParent) {
      resolved.push(manifestParent);
    }

    // Deduplicate
    return [...new Set(resolved)];
  }

  private getManifestBaseUrl(): string | null {
    if (!this._manifestUrl) {
      return null;
    }
    return new URL('.', this._manifestUrl).toString();
  }

  private getManifestParentBaseUrl(): string | null {
    if (!this._manifestUrl) {
      return null;
    }
    // Go up one more level from the manifest directory (e.g. from .../json/ to .../)
    // This helps when manifest.json is in a subdirectory but resources are at the parent level
    return new URL('..', this._manifestUrl).toString();
  }

  private async resolveResourceWithFallback(
    ref: string,
    baseCandidates: string[],
    options: { returnText?: boolean } = {}
  ): Promise<{ url: string; baseUrl: string | null; text?: string }> {
    if (!ref) {
      return { url: '', baseUrl: null };
    }
    if (ref.startsWith('http') || ref.startsWith('blob')) {
      return { url: ref, baseUrl: null };
    }

    for (const base of baseCandidates) {
      const baseUrl = new URL(base, window.location.href).toString();
      const url = new URL(ref, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
      try {
        const response = await fetch(url);
        if (response.ok) {
          if (options.returnText) {
            const text = await response.text();
            return { url, baseUrl, text };
          }
          return { url, baseUrl };
        }
      } catch (e) {
        // try next base
      }
    }

    return { url: '', baseUrl: null };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-custom-interaction': QtiCustomInteraction;
  }
}
