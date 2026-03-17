import { expect, fireEvent } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { getAssessmentItemFromTestContainerByDataTitle } from 'tools/testing/test-utils';

import type { Meta, StoryObj } from '@storybook/web-components-vite';


const meta: Meta = {
  title: 'Tests/Navigation Linear',
  component: 'qti-test',
};
export default meta;

export const LinearNavigation: StoryObj = {
  render: () => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-test-package/assessment-linear.xml"></test-container>
        <div class="d-flex align-items-center justify-content-between mt-4">
          <test-prev id="prev-btn" class="btn btn-secondary">Previous</test-prev>
          <test-next id="next-btn" class="btn btn-primary">Next</test-next>
        </div>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Wait for the first item to load
    await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Info Start');
    
    const prevBtn = canvas.getByShadowText('Previous');
    const nextBtn = canvas.getByShadowText('Next');
    
    // On first item, Prev should be disabled
    expect(prevBtn).toBeDisabled();

    // Click Next to go to item 2
    expect(nextBtn).toBeEnabled();
    await fireEvent.click(nextBtn);
    
    // Wait for item 2
    await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Richard III (Take 3)');
    
    // In linear mode, Prev should STILL be disabled on item 2
    expect(prevBtn).toBeDisabled();
    
    // Click Next to go to item 3
    expect(nextBtn).toBeEnabled();
    await fireEvent.click(nextBtn);
    
    // Wait for item 3
    await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Unattended Luggage');
    
    // Prev should still be disabled
    expect(prevBtn).toBeDisabled();
    
    // Next should be enabled as there are more items
    expect(nextBtn).toBeEnabled();
  }
};
