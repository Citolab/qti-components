import '@citolab/qti-components';

import { html, render } from 'lit';

describe('qti-content-body', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('expands MathML identifiers for template variables marked as math-variable', async () => {
    render(
      html`<qti-assessment-item>
        <qti-template-declaration identifier="SOLUTION0_0" base-type="integer" cardinality="single" math-variable="true">
          <qti-default-value>42</qti-default-value>
        </qti-template-declaration>
        <qti-content-body>
          <math>
            <mi>SOLUTION0_0</mi>
          </math>
        </qti-content-body>
      </qti-assessment-item>`,
      container
    );

    const templateDeclaration = container.querySelector('qti-template-declaration') as HTMLElement & {
      updateComplete: Promise<void>;
    };
    await templateDeclaration.updateComplete;
    await Promise.resolve();

    const contentBody = container.querySelector('qti-content-body') as HTMLElement;
    const expandedNode = contentBody.querySelector('mn');

    expect(expandedNode?.textContent).toBe('42');
    expect(contentBody.querySelector('mi')).toBeNull();
  });
});
