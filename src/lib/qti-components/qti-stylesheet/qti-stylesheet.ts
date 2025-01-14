import type { PropertyValueMap } from 'lit';
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('qti-stylesheet')
export class QtiStylesheet extends LitElement {
  private styleElement: HTMLStyleElement | null = null;

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.firstUpdated(_changedProperties);

    const link = this.getAttribute('href');

    if (link !== null) {
      // Fetch the stylesheet content
      fetch(link)
        .then(response => response.text())
        .then(cssContent => {
          // Minify the CSS content by removing whitespace and comments
          const minifiedCss = this.minifyCss(cssContent);

          // Create a <style> element with @scope surrounding the minified CSS
          this.styleElement = document.createElement('style');
          this.styleElement.media = 'screen';
          this.styleElement.textContent = `@scope {${minifiedCss}}`;

          // Append the style element to the parent element of this component
          if (this.parentElement) {
            this.parentElement.appendChild(this.styleElement);
          } else {
            console.warn('No parent element to append the scoped stylesheet to.');
          }
        })
        .catch(error => {
          console.error('Failed to load stylesheet:', error);
        });
    }

    if (this.textContent !== null && this.textContent.trim() !== '') {
      // Minify the inline CSS content
      const minifiedCss = this.minifyCss(this.textContent);

      // Directly create a <style> element with the @scope surrounding the minified inline styles
      this.styleElement = document.createElement('style');
      this.styleElement.media = 'screen';
      this.styleElement.textContent = `@scope {${minifiedCss}}`;

      // Append the style element to the parent element of this component
      if (this.parentElement) {
        this.parentElement.appendChild(this.styleElement);
      } else {
        console.warn('No parent element to append the scoped stylesheet to.');
      }
    }
  }

  private minifyCss(cssContent: string): string {
    // Remove comments, whitespace, and newline characters
    return cssContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{}:;])\s*/g, '$1') // Remove spaces around {}, :, ;
      .trim(); // Trim leading/trailing whitespace
  }

  override disconnectedCallback() {
    if (this.styleElement) {
      try {
        this.styleElement.remove();
      } catch (error) {
        console.error('Could not remove stylesheet:', error);
      }
    }
    super.disconnectedCallback();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-stylesheet': QtiStylesheet;
  }
}
