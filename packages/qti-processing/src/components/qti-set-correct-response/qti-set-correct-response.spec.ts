import '@citolab/qti-components';

import { html, render } from 'lit';

describe('qti-set-correct-response', () => {
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

  it('updates the correct response for a response declaration', async () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE0" base-type="integer" cardinality="single"></qti-response-declaration>
        <qti-set-correct-response identifier="RESPONSE0">
          <qti-base-value base-type="integer">42</qti-base-value>
        </qti-set-correct-response>
      </qti-assessment-item>
    `;
    render(template(), testContainer);

    await customElements.whenDefined('qti-set-correct-response');
    await new Promise(resolve => setTimeout(resolve, 0));

    const assessmentItem = testContainer.querySelector('qti-assessment-item') as any;
    const setCorrectResponse = testContainer.querySelector('qti-set-correct-response') as any;
    setCorrectResponse.process();

    const responseVariable = assessmentItem._context.variables.find((v: any) => v.identifier === 'RESPONSE0');
    expect(responseVariable?.correctResponse).toBe('42');
  });
});
