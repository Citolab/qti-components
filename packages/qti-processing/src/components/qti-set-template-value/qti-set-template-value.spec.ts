import '@citolab/qti-components';

import { html, render } from 'lit';

describe('qti-set-template-value', () => {
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

  it('updates the template variable in the assessment item', async () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-template-declaration identifier="n" base-type="integer" cardinality="single">
          <qti-default-value>1</qti-default-value>
        </qti-template-declaration>
        <qti-set-template-value identifier="n">
          <qti-base-value base-type="integer">7</qti-base-value>
        </qti-set-template-value>
      </qti-assessment-item>
    `;
    render(template(), testContainer);

    await customElements.whenDefined('qti-set-template-value');
    const templateDeclaration = testContainer.querySelector('qti-template-declaration') as any;
    await templateDeclaration.updateComplete;

    const assessmentItem = testContainer.querySelector('qti-assessment-item') as any;
    const setTemplateValue = testContainer.querySelector('qti-set-template-value') as any;
    setTemplateValue.process();

    const variable = assessmentItem._context.variables.find((v: any) => v.identifier === 'n');
    expect(variable?.value).toBe('7');
  });
});
