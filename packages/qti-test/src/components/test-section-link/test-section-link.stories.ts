import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { getAssessmentItemsFromTestContainer } from '../../../../../tools/testing/test-utils';
import { SHOWCASE_TEST } from '../qti-test/showcase.fixtures';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { TestSectionLink } from './test-section-link';

const { events, args, argTypes, template } = getStorybookHelpers('test-section-link');

type Story = StoryObj<TestSectionLink & typeof args>;

const meta: Meta<TestSectionLink & { 'section-id' }> = {
  title: 'QTI Test/Building blocks/test-section-link',
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
        <test-container test-url=${SHOWCASE_TEST}></test-container>
        ${template(args, html`Link to section`)}
      </test-navigation>
    </qti-test>`
};

/** In item mode a section link makes the section's first item the active one, so Next and Prev work from there. */
export const ItemModeActivatesFirstItem: Story = {
  render: () =>
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url=${SHOWCASE_TEST}></test-container>
        <test-section-link section-id="dragging-and-ordering">Dragging</test-section-link>
        <test-prev>previous</test-prev>
        <test-next>next</test-next>
      </test-navigation>
    </qti-test>`,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sectionLink = canvas.getByShadowText('Dragging');
    const prevButton = canvas.getByShadowText('previous');
    const nextButton = canvas.getByShadowText('next');

    // the test opens on its first item
    await waitFor(() => expect(nextButton).toBeEnabled(), { timeout: 15000 });

    await fireEvent.click(sectionLink);
    await waitFor(
      async () => {
        const items = await getAssessmentItemsFromTestContainer(canvasElement);
        expect(items.map(item => item.getAttribute('data-title'))).toContain('Matching, options above');
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
        expect(items.map(item => item.getAttribute('data-title'))).toEqual(['Matching, options on the right']);
      },
      { timeout: 15000 }
    );
  }
};
