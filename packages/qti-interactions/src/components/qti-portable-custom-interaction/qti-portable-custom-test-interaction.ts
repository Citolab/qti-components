import { customElement } from 'lit/decorators.js';

import { QtiPortableCustomInteraction } from './qti-portable-custom-interaction';

import type { ItemContext } from '@qti-components/base';

/**
 * Test-specific extension of QtiPortableCustomInteraction that adds methods
 * for interacting with the iframe content in tests.
 */
@customElement('qti-portable-custom-interaction-test')
export class QtiPortableCustomInteractionTest extends QtiPortableCustomInteraction {
  private _recreatingIframe = false;

  /**
   * Gets the HTML content of the iframe for testing purposes
   * @returns Promise that resolves with the HTML content string
   */
  async getIFrameContent(): Promise<string> {
    return new Promise(resolve => {
      const messageId = `get-content-${Date.now()}`;

      const messageHandler = (event: MessageEvent) => {
        const { data } = event;
        if (
          data?.source === 'qti-pci-iframe' &&
          (!data?.responseIdentifier || data?.responseIdentifier === this.responseIdentifier) &&
          data?.method === 'getContentResponse' &&
          data?.messageId === messageId
        ) {
          window.removeEventListener('message', messageHandler);
          resolve(data.content);
        }
      };

      window.addEventListener('message', messageHandler);

      this.sendMessageToIframe('getContent', { messageId });

      // Set timeout to avoid hanging promises
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        resolve('');
      }, 5000);
    });
  }

  // Expose the protected context
  public setTestContext(newContext: ItemContext): void {
    this.context = newContext;

    // If needed, force an update to push the context changes to the iframe
    this.updateComplete.then(() => {
      // const responseVal = this.responseVariablesToQtiVariableJSON(
      //   (newContext?.variables?.find(v => v.identifier === this.responseIdentifier)?.value as string | string[]) ||
      //     null,
      //   newContext?.variables?.find(v => v.identifier === this.responseIdentifier)?.cardinality || 'single',
      //   newContext?.variables?.find(v => v.identifier === this.responseIdentifier)?.baseType || 'string'
      // );
      this.value = newContext?.variables?.find(v => v.identifier === this.responseIdentifier).value as string;
      // this.recreateIframe();
    });
  }

  /**
   * Recreates the iframe completely
   * @returns Promise that resolves when the iframe is loaded
   */
  public async recreateIframe(): Promise<void> {
    this._recreatingIframe = true;

    try {
      // Remove existing iframe if it exists
      if (this.iframe) {
        this._iframeLoaded = false;
        this.iframe.remove();
      }

      this._pendingMessages = [];

      // Create a new iframe
      this.createIframe();

      // Wait for iframe to load
      return new Promise<void>(resolve => {
        const loadHandler = () => {
          this.removeEventListener('qti-portable-custom-interaction-loaded', loadHandler);
          resolve();
        };

        this.addEventListener('qti-portable-custom-interaction-loaded', loadHandler);

        // Add timeout to avoid hanging if the event never fires
        setTimeout(() => {
          this.removeEventListener('qti-portable-custom-interaction-loaded', loadHandler);
          resolve();
        }, 5000);
      });
    } finally {
      this._recreatingIframe = false;
    }
  }

  /**
   * Override the original disconnectedCallback to handle iframe recreation
   */
  override disconnectedCallback(): void {
    // Only call super if we're not in the process of recreating the iframe
    // This prevents removing event listeners that we still need
    if (!this._recreatingIframe) {
      super.disconnectedCallback();
    }
  }

  /**
   * Simulates a mouse click at specific coordinates within the iframe
   * @param x The x coordinate
   * @param y The y coordinate
   * @returns Promise that resolves when the click is performed
   */
  async iFrameMouseClick(x: number, y: number): Promise<void> {
    return new Promise(resolve => {
      const messageId = `click-${Date.now()}`;

      const messageHandler = (event: MessageEvent) => {
        const { data } = event;
        if (
          data?.source === 'qti-pci-iframe' &&
          (!data?.responseIdentifier || data?.responseIdentifier === this.responseIdentifier) &&
          data?.method === 'clickResponse' &&
          data?.messageId === messageId
        ) {
          window.removeEventListener('message', messageHandler);
          resolve();
        }
      };

      window.addEventListener('message', messageHandler);

      this.sendMessageToIframe('simulateClick', { x, y, messageId });

      // Set timeout to avoid hanging promises
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        resolve();
      }, 5000);
    });
  }

  /**
   * Clicks on an element identified by a CSS selector
   * @param selector The CSS selector string
   * @returns Promise that resolves with boolean indicating if the element was found and clicked
   */
  async iFrameClickOnElement(selector: string): Promise<boolean> {
    return new Promise(resolve => {
      const messageId = `click-selector-${Date.now()}`;

      const messageHandler = (event: MessageEvent) => {
        const { data } = event;
        if (
          data?.source === 'qti-pci-iframe' &&
          (!data?.responseIdentifier || data?.responseIdentifier === this.responseIdentifier) &&
          data?.method === 'clickSelectorResponse' &&
          data?.messageId === messageId
        ) {
          window.removeEventListener('message', messageHandler);
          resolve(data.success);
        }
      };

      window.addEventListener('message', messageHandler);

      this.sendMessageToIframe('clickOnSelector', { selector, messageId });

      // Set timeout to avoid hanging promises
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Clicks on an element containing the specified text
   * @param text The text to search for within elements
   * @returns Promise that resolves with boolean indicating if the element was found and clicked
   */
  async iFrameClickOnElementByText(text: string): Promise<boolean> {
    return new Promise(resolve => {
      const messageId = `click-text-${Date.now()}`;

      const messageHandler = (event: MessageEvent) => {
        const { data } = event;
        if (
          data?.source === 'qti-pci-iframe' &&
          (!data?.responseIdentifier || data?.responseIdentifier === this.responseIdentifier) &&
          data?.method === 'clickTextResponse' &&
          data?.messageId === messageId
        ) {
          window.removeEventListener('message', messageHandler);
          resolve(data.success);
        }
      };

      window.addEventListener('message', messageHandler);

      this.sendMessageToIframe('clickOnElementByText', { text, messageId });

      // Set timeout to avoid hanging promises
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Sets the value of an input element identified by a CSS selector
   * @param selector The CSS selector string
   * @param value The value to set
   * @returns Promise that resolves with boolean indicating if the element was found and value was set
   */
  async iFrameSetValueElement(selector: string, value: string): Promise<boolean> {
    return new Promise(resolve => {
      const messageId = `set-value-${Date.now()}`;

      const messageHandler = (event: MessageEvent) => {
        const { data } = event;
        if (
          data?.source === 'qti-pci-iframe' &&
          (!data?.responseIdentifier || data?.responseIdentifier === this.responseIdentifier) &&
          data?.method === 'setValueResponse' &&
          data?.messageId === messageId
        ) {
          window.removeEventListener('message', messageHandler);
          resolve(data.success);
        }
      };

      window.addEventListener('message', messageHandler);

      this.sendMessageToIframe('setValueElement', { selector, value, messageId });

      // Set timeout to avoid hanging promises
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Sets the value of an input element containing the specified text
   * @param text The text to search for within elements
   * @param value The value to set
   * @returns Promise that resolves with boolean indicating if the element was found and value was set
   */
  async iFrameSetValueElementByText(text: string, value: string): Promise<boolean> {
    return new Promise(resolve => {
      const messageId = `set-value-text-${Date.now()}`;

      const messageHandler = (event: MessageEvent) => {
        const { data } = event;
        if (
          data?.source === 'qti-pci-iframe' &&
          (!data?.responseIdentifier || data?.responseIdentifier === this.responseIdentifier) &&
          data?.method === 'setValueByTextResponse' &&
          data?.messageId === messageId
        ) {
          window.removeEventListener('message', messageHandler);
          resolve(data.success);
        }
      };

      window.addEventListener('message', messageHandler);

      this.sendMessageToIframe('setValueElementByText', { text, value, messageId });

      // Set timeout to avoid hanging promises
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Performs a mousedown event on an element identified by a CSS selector
   * @param selector The CSS selector string
   * @returns Promise that resolves with boolean indicating if the element was found and mousedown was performed
   */
  async iFrameMousedownOnElement(selector: string): Promise<boolean> {
    return new Promise(resolve => {
      const messageId = `mousedown-selector-${Date.now()}`;

      const messageHandler = (event: MessageEvent) => {
        const { data } = event;
        if (
          data?.source === 'qti-pci-iframe' &&
          (!data?.responseIdentifier || data?.responseIdentifier === this.responseIdentifier) &&
          data?.method === 'mousedownSelectorResponse' &&
          data?.messageId === messageId
        ) {
          window.removeEventListener('message', messageHandler);
          resolve(data.success);
        }
      };

      window.addEventListener('message', messageHandler);

      this.sendMessageToIframe('mousedownOnSelector', { selector, messageId });

      // Set timeout to avoid hanging promises
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Override the original generateIframeContent method to include
   * the test message handlers in the iframe HTML
   */
  override generateIframeContent(): string {
    // Get the original iframe HTML from the parent class
    const originalContent = super.generateIframeContent();

    // Insert our test message handlers before the closing </script> tag
    const testHandlers = `
    // Test helper functions for QtiPortableCustomInteractionTest
    // Base iframe implementation already provides PCIManager.getContent
    
    // Base iframe implementation already provides PCIManager.simulateClick
    
    // Base iframe implementation already provides PCIManager.clickOnSelector
    
    // Base iframe implementation already provides PCIManager.clickOnElementByText
    
    // Base iframe implementation already provides PCIManager.setValueElement
    
    function deepQuerySelector(root, selector) {
      if (!root) return null;
      try {
        const direct = root.querySelector ? root.querySelector(selector) : null;
        if (direct) return direct;
      } catch (e) {
        // ignore invalid selector for this root
      }
      if (!root.querySelectorAll) return null;
      const nodes = root.querySelectorAll('*');
      for (const node of nodes) {
        if (node && node.shadowRoot) {
          const found = deepQuerySelector(node.shadowRoot, selector);
          if (found) return found;
        }
      }
      return null;
    }

    function deepFindElementByExactText(root, text) {
      if (!root || !text) return null;
      if (root.querySelectorAll) {
        const nodes = root.querySelectorAll('*');
        for (const node of nodes) {
          if ((node.textContent || '').trim() === text) return node;
          if (node.shadowRoot) {
            const found = deepFindElementByExactText(node.shadowRoot, text);
            if (found) return found;
          }
        }
      }
      return null;
    }

    function escapeSelectorId(id) {
      try {
        if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(id);
      } catch (e) {
        // ignore
      }
      return String(id).replace(/([ #;?%&,.+*~\\':"!^$[\\]()=>|\\/])/g, '\\\\$1');
    }

    PCIManager.setValueElementByText = function(params) {
      const messageId = params && params.messageId;
      try {
        const text = params && params.text;
        const value = params && params.value;

        const textEl = text ? deepFindElementByExactText(document, text) : null;
        let target = null;

        if (textEl) {
          const tag = (textEl.tagName || '').toUpperCase();
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
            target = textEl;
          } else if (tag === 'LABEL' && textEl.htmlFor) {
            const id = escapeSelectorId(textEl.htmlFor);
            target = deepQuerySelector(document, '#' + id);
          }

          if (!target) {
            let parent = textEl.parentElement;
            while (parent) {
              const candidate = parent.querySelector ? parent.querySelector('input, textarea, select') : null;
              if (candidate) {
                target = candidate;
                break;
              }
              parent = parent.parentElement;
            }
          }
        }

        const success = !!target && setValueOnElement(target, value);
        window.parent.postMessage(
          {
            source: 'qti-pci-iframe',
            responseIdentifier: PCIManager.responseIdentifier,
            method: 'setValueByTextResponse',
            messageId: messageId,
            success: success
          },
          '*'
        );
      } catch (error) {
        console.error('Error setting value by text:', error);
        window.parent.postMessage(
          {
            source: 'qti-pci-iframe',
            responseIdentifier: PCIManager.responseIdentifier,
            method: 'setValueByTextResponse',
            messageId: messageId,
            success: false,
            error: error.toString()
          },
          '*'
        );
      }
    };
    
    PCIManager.mousedownOnSelector = function(params) {
      try {
        const element = params && params.selector ? deepQuerySelector(document, params.selector) : null;
        
        let success = false;
        
        if (element) {
          const rect = element.getBoundingClientRect();
          const mousedownEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2
          });
          element.dispatchEvent(mousedownEvent);
          success = true;
        }
        
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          responseIdentifier: PCIManager.responseIdentifier,
          method: 'mousedownSelectorResponse',
          messageId: params.messageId,
          success
        }, '*');
      } catch (error) {
        console.error('Error performing mousedown on selector:', error);
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          responseIdentifier: PCIManager.responseIdentifier,
          method: 'mousedownSelectorResponse',
          messageId: params.messageId,
          success: false,
          error: error.toString()
        }, '*');
      }
    };
    
    // Helper function for setting values on elements
    function setValueOnElement(element, value) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } else if (element.tagName === 'SELECT') {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } else if (element.isContentEditable) {
        element.textContent = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }
    
    // Add test-related message handlers (do not override global handlers)
    let expectedParentOriginTest = null;
    window.addEventListener(
      'message',
      function(event) {
        const { data } = event;

        if (event.source !== window.parent || !data || data.source !== 'qti-portable-custom-interaction') return;
        if (expectedParentOriginTest === null) expectedParentOriginTest = event.origin;
        else if (event.origin !== expectedParentOriginTest) return;
        if (data.responseIdentifier && data.responseIdentifier !== PCIManager.responseIdentifier) return;

        switch (data.method) {
          case 'setValueElementByText':
            PCIManager.setValueElementByText(data.params);
            return;
          case 'mousedownOnSelector':
            PCIManager.mousedownOnSelector(data.params);
            return;
        }
      },
      true
    );`;

    // Find the position to insert our test handlers
    const insertPosition = originalContent.lastIndexOf('</script>');

    // Insert our handlers
    const modifiedContent =
      originalContent.substring(0, insertPosition) + testHandlers + originalContent.substring(insertPosition);

    return modifiedContent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-portable-custom-interaction-test': QtiPortableCustomInteractionTest;
  }
}
