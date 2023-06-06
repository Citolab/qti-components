// pk: resize qti-assessment-item in qti-item-container
// based on this script: https://jsfiddle.net/oxzxyxqn/7/

import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

type Constructor<T> = new (...args: any[]) => T;

export declare class ScaleToFitInterface {}

export const ScaleToFitMixin = <T extends Constructor<LitElement>>(superClass: T, scaleSelector: string) => {
  class ScaleToFitElement extends superClass {
    @property({ type: Number, reflect: true })
    scale = 1;

    private ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.fitToParent(entry.contentRect.width);
      }
    });

    override connectedCallback(): void {
      super.connectedCallback();
      this.ro.observe(this);
      this.fitToParent();
    }

    private _scales;

    set scales(val: boolean) {
      const oldVal = this._scales;
      this.requestUpdate('prop', oldVal);
      this.fitToParent();
    }

    @property({ type: Boolean, attribute: false })
    get scales() {
      return this._scales;
    }

    private fitToParent(width = this.clientWidth) {
      const scaleEl = this.shadowRoot.querySelector(scaleSelector) as HTMLElement;
      if (scaleEl) {
        const scale = width / scaleEl.clientWidth;
        this.scale = scale;
        const marginY = -scaleEl.clientHeight * (1 - scale) + 'px';
        const marginX = -scaleEl.clientWidth * (1 - scale) + 'px';

        requestAnimationFrame(() => {
          scaleEl.style.transform = `scale(${this.scale})`;
          scaleEl.style.margin = `0 ${marginX} ${marginY} 0`;
        });
      }
    }
  }
  return ScaleToFitElement as Constructor<ScaleToFitInterface> & T;
};
