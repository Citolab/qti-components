import { html } from 'lit';
import { QtiAssessmentItem } from '@qti-components/elements';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

const meta: Meta = {
  title: 'Test/ImportTest',
  component: 'div'
};

export default meta;
type Story = StoryObj;

export const TestImport: Story = {
  render: () => {
    return html`
      <div>
        <h1>Testing Package Import</h1>
        <p>Successfully imported QtiAssessmentItem: ${QtiAssessmentItem ? 'YES' : 'NO'}</p>
      </div>
    `;
  }
};
