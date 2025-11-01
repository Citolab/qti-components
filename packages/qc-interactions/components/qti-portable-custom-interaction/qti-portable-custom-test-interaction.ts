import { customElement } from 'lit/decorators.js';

import { QtiPortableCustomInteraction } from './qti-portable-custom-interaction';

import type { ItemContext } from '../../../exports/item.context';

/**
 * Test-specific extension of QtiPortableCustomInteraction that adds methods
 * for interacting with the iframe content in tests.
 */
@customElement('qti-portable-custom-interaction-test')
export class QtiPortableCustomInteractionTest extends QtiPortableCustomInteraction {
  private _recreatingIframe = false;

  constructor() {
    super();
    // Initialize the iframe and other properties
    this.useIframe = true;
  }

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
        if (data?.source === 'qti-pci-iframe' && data?.method === 'clickResponse' && data?.messageId === messageId) {
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
        if (data?.source === 'qti-pci-iframe' && data?.method === 'setValueResponse' && data?.messageId === messageId) {
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
    PCIManager.getContent = function(params) {
        // Find the pci-container element
      const container = document.querySelector('#pci-container');
      if (!container) {
        throw new Error('#pci-container not found');
      }
      // Try to get the shadow root first, fall back to the container itself
      const root = container.shadowRoot || container;
      window.parent.postMessage({
        source: 'qti-pci-iframe',
        method: 'getContentResponse',
        messageId: params.messageId,
        content: root.innerHTML
      }, '*');
    };
    
    PCIManager.simulateClick = function(params) {
      try {
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: params.x,
          clientY: params.y
        });
        
        // Get the element at the specified position
        const element = document.elementFromPoint(params.x, params.y);
        if (element) {
          element.dispatchEvent(clickEvent);
        }
        
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'clickResponse',
          messageId: params.messageId,
          success: !!element
        }, '*');
      } catch (error) {
        console.error('Error simulating click:', error);
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'clickResponse',
          messageId: params.messageId,
          success: false,
          error: error.toString()
        }, '*');
      }
    };
    
    PCIManager.clickOnSelector = function(params) {
      try {
        // Find the pci-container element
        const container = document.querySelector('#pci-container');
        if (!container) {
          throw new Error('#pci-container not found');
        }
        
        // Try to get the shadow root first, fall back to the container itself
        const root = container.shadowRoot || container;
        let element = root.querySelector(params.selector);
        
        let success = false;
        
        if (element) {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          element.dispatchEvent(clickEvent);
          success = true;
        }
        
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'clickSelectorResponse',
          messageId: params.messageId,
          success
        }, '*');
      } catch (error) {
        console.error('Error clicking selector:', error);
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'clickSelectorResponse',
          messageId: params.messageId,
          success: false,
          error: error.toString()
        }, '*');
      }
    };
    
    PCIManager.clickOnElementByText = function(params) {
      try {
        // Find the pci-container element
        const container = document.querySelector('#pci-container');
        if (!container) {
          throw new Error('#pci-container not found');
        }
        
        // Try to get the shadow root first, fall back to the container itself
        const root = container.shadowRoot || container;
        
        // Find elements containing the text
        const textNodes = [];
        const walk = document.createTreeWalker(
          root, 
          NodeFilter.SHOW_TEXT,
          { acceptNode: function(node) { return node.nodeValue.trim() !== '' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } }
        );
        
        let node;
        while (node = walk.nextNode()) {
          if (node.nodeValue.includes(params.text)) {
            textNodes.push(node);
          }
        }
        
        let success = false;
        // Click the first element containing the text
        if (textNodes.length > 0) {
          const element = textNodes[0].parentElement;
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          element.dispatchEvent(clickEvent);
          success = true;
        }
        
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'clickTextResponse',
          messageId: params.messageId,
          success
        }, '*');
      } catch (error) {
        console.error('Error clicking by text:', error);
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'clickTextResponse',
          messageId: params.messageId,
          success: false,
          error: error.toString()
        }, '*');
      }
    };
    
    PCIManager.setValueElement = function(params) {
      try {
        // Find the pci-container element
        const container = document.querySelector('#pci-container');
        if (!container) {
          throw new Error('#pci-container not found');
        }
        
        // Try to get the shadow root first, fall back to the container itself
        const root = container.shadowRoot || container;
        let element = root.querySelector(params.selector);
        
        let success = false;
        
        if (element) {
          success = setValueOnElement(element, params.value);
        }
        
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'setValueResponse',
          messageId: params.messageId,
          success
        }, '*');
      } catch (error) {
        console.error('Error setting value:', error);
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'setValueResponse',
          messageId: params.messageId,
          success: false,
          error: error.toString()
        }, '*');
      }
    };
    
    PCIManager.setValueElementByText = function(params) {
      try {
        // Find the pci-container element
        const container = document.querySelector('#pci-container');
        if (!container) {
          throw new Error('#pci-container not found');
        }
        
        // Try to get the shadow root first, fall back to the container itself
        const root = container.shadowRoot || container;
        
        // Find elements containing the text
        const textNodes = [];
        const walk = document.createTreeWalker(
          root, 
          NodeFilter.SHOW_TEXT,
          { acceptNode: function(node) { return node.nodeValue.trim() !== '' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } }
        );
        
        let node;
        while (node = walk.nextNode()) {
          if (node.nodeValue.includes(params.text)) {
            textNodes.push(node);
          }
        }
        
        let success = false;
        // Look for input elements near the text node
        if (textNodes.length > 0) {
          const textElement = textNodes[0].parentElement;
          
          // Try different strategies to find the related input
          // 1. Check if the text is inside a label with a "for" attribute
          if (textElement.tagName === 'LABEL' && textElement.htmlFor) {
            const input = root.getElementById(textElement.htmlFor);
            if (input) {
              success = setValueOnElement(input, params.value);
            }
          }
          
          // 2. Check if there's an input near the text (sibling or parent's child)
          if (!success) {
            let parentElement = textElement.parentElement;
            const inputElements = parentElement.querySelectorAll('input, textarea, select');
            
            if (inputElements.length > 0) {
              success = setValueOnElement(inputElements[0], params.value);
            }
          }
        }
        
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'setValueByTextResponse',
          messageId: params.messageId,
          success
        }, '*');
      } catch (error) {
        console.error('Error setting value by text:', error);
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'setValueByTextResponse',
          messageId: params.messageId,
          success: false,
          error: error.toString()
        }, '*');
      }
    };
    
    PCIManager.mousedownOnSelector = function(params) {
      try {
        // Find the pci-container element
        const container = document.querySelector('#pci-container');
        if (!container) {
          throw new Error('#pci-container not found');
        }
        
        // Try to get the shadow root first, fall back to the container itself
        const root = container.shadowRoot || container;
        let element = root.querySelector(params.selector);
        
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
          method: 'mousedownSelectorResponse',
          messageId: params.messageId,
          success
        }, '*');
      } catch (error) {
        console.error('Error performing mousedown on selector:', error);
        window.parent.postMessage({
          source: 'qti-pci-iframe',
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
    
    // Add test-related message handlers to the existing message event listener
    const originalMessageListener = window.onmessage;
    window.onmessage = function(event) {
      const { data } = event;
      
      // Handle test-related messages
      if (data && data.source === 'qti-portable-custom-interaction') {
        switch(data.method) {
          case 'getContent':
            PCIManager.getContent(data.params);
            return;
            
          case 'simulateClick':
            PCIManager.simulateClick(data.params);
            return;
            
          case 'clickOnSelector':
            PCIManager.clickOnSelector(data.params);
            return;
            
          case 'clickOnElementByText':
            PCIManager.clickOnElementByText(data.params);
            return;
            
          case 'setValueElement':
            PCIManager.setValueElement(data.params);
            return;
            
          case 'setValueElementByText':
            PCIManager.setValueElementByText(data.params);
            return;
            
          case 'mousedownOnSelector':
            PCIManager.mousedownOnSelector(data.params);
            return;
        }
      }
      
      // Call the original message handler for non-test messages
      if (originalMessageListener) {
        originalMessageListener(event);
      }
    };`;

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
