import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { getAssessmentItemsFromTestContainer } from '../../../../../tools/testing/test-utils';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { TestSectionLink } from './test-section-link';

const { events, args, argTypes, template } = getStorybookHelpers('test-section-link');

type Story = StoryObj<TestSectionLink & typeof args>;

const meta: Meta<TestSectionLink & { 'section-id' }> = {
  component: 'test-section-link',
  args: { ...args, 'section-id': 'advanced' },
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const Default: Story = {
  render: args =>
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
        ${template(args, html`Link to section`)}
      </test-navigation>
    </qti-test>`
};

/** In item mode a section link makes the section's first item the active one, so Next and Prev work from there. */
export const ItemModeActivatesFirstItem: Story = {
  render: () =>
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
        <test-section-link section-id="advanced">Advanced</test-section-link>
        <test-prev>previous</test-prev>
        <test-next>next</test-next>
      </test-navigation>
    </qti-test>`,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sectionLink = canvas.getByShadowText('Advanced');
    const prevButton = canvas.getByShadowText('previous');
    const nextButton = canvas.getByShadowText('next');

    // the test opens on its first item
    await waitFor(() => expect(nextButton).toBeEnabled(), { timeout: 15000 });

    await fireEvent.click(sectionLink);
    await waitFor(
      async () => {
        const items = await getAssessmentItemsFromTestContainer(canvasElement);
        expect(items.map(item => item.getAttribute('data-title'))).toContain('Richard III (Take 1)');
      },
      { timeout: 15000 }
    );
    await waitFor(() => expect(prevButton).toBeEnabled());
    await waitFor(() => expect(nextButton).toBeEnabled());

    // the whole section is on screen, so only a list of exactly the second item proves Next moved
    await fireEvent.click(nextButton);
    await waitFor(
      async () => {
        const items = await getAssessmentItemsFromTestContainer(canvasElement);
        expect(items.map(item => item.getAttribute('data-title'))).toEqual(['Low-cost Flying']);
      },
      { timeout: 15000 }
    );
  }
};
