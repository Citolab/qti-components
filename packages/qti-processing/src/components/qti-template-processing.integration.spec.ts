import '@citolab/qti-components';

import { html, render } from 'lit';

describe('qti-template-processing integration', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  });

  it('runs template rules to set template values and correct responses', async () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-template-declaration identifier="n" base-type="integer" cardinality="single">
          <qti-default-value>1</qti-default-value>
        </qti-template-declaration>
        <qti-response-declaration identifier="RESPONSE0" base-type="integer" cardinality="single"></qti-response-declaration>
        <qti-template-processing>
          <qti-set-template-value identifier="n">
            <qti-base-value base-type="integer">5</qti-base-value>
          </qti-set-template-value>
          <qti-set-correct-response identifier="RESPONSE0">
            <qti-base-value base-type="integer">42</qti-base-value>
          </qti-set-correct-response>
        </qti-template-processing>
      </qti-assessment-item>
    `;

    render(template(), testContainer);

    await Promise.all([
      customElements.whenDefined('qti-assessment-item'),
      customElements.whenDefined('qti-template-processing'),
      customElements.whenDefined('qti-set-template-value'),
      customElements.whenDefined('qti-set-correct-response')
    ]);

    const templateDeclaration = testContainer.querySelector('qti-template-declaration') as any;
    await templateDeclaration.updateComplete;

    const templateProcessing = testContainer.querySelector('qti-template-processing') as any;
    templateProcessing.process();

    const assessmentItem = testContainer.querySelector('qti-assessment-item') as any;
    const templateVariable = assessmentItem._context.variables.find((v: any) => v.identifier === 'n');
    const responseVariable = assessmentItem._context.variables.find((v: any) => v.identifier === 'RESPONSE0');

    expect(templateVariable?.value).toBe('5');
    expect(responseVariable?.correctResponse).toBe('42');
  });
});
