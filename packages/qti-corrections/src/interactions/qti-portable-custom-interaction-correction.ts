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

    // `cloneNode(false)`, not `document.createElement`: a shallow clone is created in the same
    // custom element registry as this element, so the viewer is still upgraded when the item was
    // rendered into a scoped registry. It carries the attributes over and none of the children.
    const viewer = this.cloneNode(false) as QtiPortableCustomInteractionCorrection;
    // Two elements in one tree cannot share an id, and the flags would have the viewer show a
    // correction of its own.
    viewer.removeAttribute('id');
    viewer.removeAttribute('show-correct-response');
    viewer.removeAttribute('show-full-correct-response');
    viewer.removeAttribute('show-candidate-correction');
    viewer.isFullCorrectResponse = true;
    const originalResponseId = this.responseIdentifier;
    viewer.responseIdentifier = `${originalResponseId}-correct`;

    // Only the authored light DOM — modules, markup, properties, stylesheets. The runtime's own
    // children must not come along: the PCI appends its iframe to itself, and the `disable()` above
    // has just added the review overlay. A cloned iframe never loads, so the viewer would paint a
    // dead frame above the live one.
    for (const child of Array.from(this.children)) {
      if (child.tagName.startsWith('QTI-')) viewer.append(child.cloneNode(true));
    }

    const correctResponse = this.correctResponse as string | string[];
    const cardinality: Cardinality =
      responseVariable?.cardinality ?? (Array.isArray(correctResponse) ? 'multiple' : 'single');
    const baseType: BaseType = responseVariable?.baseType ?? 'string';

    // The standards-conformant handoff, for a PCI that implements the solution use case: it reads
    // the key out of its own `getInstance` configuration rather than having a response pushed at it.
    // Set explicitly because the viewer has no response declaration to derive one from — it is not a
    // registered interaction, so `responseVariable` is undefined and the derived getter returns null.
    // See https://github.com/1EdTech/qti-project-management/issues/210
    viewer.status = 'solution';
    viewer.responseDeclaration = {
      baseType,
      cardinality,
      correctResponse: { value: correctResponse }
    };

    // The push below stays for PCIs that do NOT implement the solution use case: those only know how
    // to render a response bound to them. It goes out once the viewer's own iframe has finished its
    // handshake — listened for rather than hooked into `connectedCallback`, since custom element
    // reactions are looked up on the prototype when the element is defined, so an instance-level
    // override of it is never read.
    viewer.addEventListener(
      'qti-portable-custom-interaction-loaded',
      () => {
        const value = viewer.responseVariablesToQtiVariableJSON(correctResponse, cardinality, baseType);
        viewer.sendMessageToIframe('setBoundTo', { [originalResponseId]: value });
        viewer.sendMessageToIframe('setState', { state: 'review' });
      },
      { once: true }
    );
    viewer.style.pointerEvents = 'none';
    container.append(viewer);
    this.after(container);
  }
}
