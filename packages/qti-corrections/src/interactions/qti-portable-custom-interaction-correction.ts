import { QtiPortableCustomInteraction } from '@qti-components/portable-custom-interaction/elements';

import { CandidateCorrectionMixin } from '../mixins/candidate-correction.mixin';

import type { BaseType, Cardinality } from '@qti-components/base';

export class QtiPortableCustomInteractionCorrection extends CandidateCorrectionMixin(QtiPortableCustomInteraction) {
  public override toggleInternalCorrectResponse(show: boolean): void {
    super.toggleInternalCorrectResponse(show);
    const responseVariable = this.responseVariable;
    const sourceResponse = responseVariable?.correctResponse ?? this.correctResponse;
    this.correctResponse = show ? sourceResponse : responseVariable?.cardinality === 'single' ? '' : [];

    const containerId = `correct-response-container-${this.responseIdentifier}`;
    this.parentElement?.querySelectorAll(`#${containerId}`).forEach(element => element.remove());

    if (!show) {
      this.enable();
      return;
    }
    this.disable();
    if (!this.correctResponse) return;

    const container = document.createElement('div');
    container.id = containerId;
    container.className = 'pci-correct-response-container';
    Object.assign(container.style, {
      position: 'relative',
      marginTop: '20px',
      border: '2px solid green',
      padding: '16px',
      borderRadius: '4px',
      backgroundColor: 'rgba(0, 128, 0, 0.05)'
    });

    const label = document.createElement('div');
    label.textContent = 'Correct Response:';
    Object.assign(label.style, { fontWeight: 'bold', marginBottom: '10px', color: 'green' });
    container.append(label);

    const viewer = this.cloneNode(false) as QtiPortableCustomInteractionCorrection;
    for (const attribute of Array.from(this.attributes)) {
      if (attribute.name !== 'id' && attribute.name !== 'response-identifier') {
        viewer.setAttribute(attribute.name, attribute.value);
      }
    }
    viewer.removeAttribute('show-correct-response');
    viewer.removeAttribute('show-full-correct-response');
    viewer.removeAttribute('show-candidate-correction');
    viewer.isFullCorrectResponse = true;
    const originalResponseId = this.responseIdentifier;
    viewer.responseIdentifier = `${originalResponseId}-correct`;
    for (const child of Array.from(this.children)) viewer.append(child.cloneNode(true));

    const correctResponse = this.correctResponse as string | string[];
    const cardinality: Cardinality =
      responseVariable?.cardinality ?? (Array.isArray(correctResponse) ? 'multiple' : 'single');
    const baseType: BaseType = responseVariable?.baseType ?? 'string';
    const connectedCallback = viewer.connectedCallback;
    viewer.connectedCallback = function () {
      connectedCallback.call(this);
      const apply = () => {
        const value = this.responseVariablesToQtiVariableJSON(correctResponse, cardinality, baseType);
        this.sendMessageToIframe('setBoundTo', { [originalResponseId]: value });
        this.sendMessageToIframe('setState', { state: 'review' });
      };
      if (this._iframeLoaded) apply();
      else this.addEventListener('qti-portable-custom-interaction-loaded', apply, { once: true });
    };
    viewer.style.pointerEvents = 'none';
    container.append(viewer);
    this.after(container);
  }
}
