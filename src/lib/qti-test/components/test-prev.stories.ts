import { expect, fireEvent } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { findByShadowTitle, getByShadowText } from 'shadow-dom-testing-library';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { TestPrev as TestPrevClass } from './test-prev';
import { TestContext } from '../context/test.context';

const { events, args, argTypes, template } = getWcStorybookHelpers('test-prev');

type Story = StoryObj<TestPrevClass & typeof args>;

const meta: Meta<TestPrevClass> = {
  title: 'qti-test/test-components/test-prev',
  component: 'test-prev',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

const PlayerTemplate = (args: any) => html`
  <qti-test
    data-testid="qti-player"
    testURL="/assets/qti-conformance/Basic/T4-T7/assessment.xml"
    .context=${{
      navItemId: 't1-test-entry-item4'
    } as TestContext}
  >
    <test-container></test-container>
    <test-prev>vorige</test-prev>
  </qti-test>
`;

// const PlayerTemplate = (args: any) =>
//   html`<qti-test
//     data-testid="qti-player"
//     testURL="/assets/api/conformance/assessment.xml"
//     .context=${{
//       navItemId: 't1-test-entry-item4'
//     } as TestContext}
//   >
//     <test-container></test-container>
//     ${template(args, html`vorige`)}
//   </qti-test>`;

export const TestPrev: Story = {
  render: PlayerTemplate.bind({}),
  play: async ({ canvasElement }) => {
    const prevButton = getByShadowText(canvasElement, 'vorige');
    expect(prevButton).toBeDisabled();
    const firstItem = await findByShadowTitle(canvasElement, 'T1 - Extended Text Interaction');
    expect(prevButton).not.toBeDisabled();
    expect(firstItem).toBeInTheDocument();
    await new Promise(resolve => setTimeout(resolve, 500));
    await fireEvent.click(prevButton);
    await new Promise(resolve => setTimeout(resolve, 500));

    await fireEvent.click(prevButton);
    await new Promise(resolve => setTimeout(resolve, 500));

    await fireEvent.click(prevButton);
    const secondItem = await findByShadowTitle(canvasElement, 'T1 - Test Entry - Item 1');
    expect(secondItem).toBeInTheDocument();
    expect(prevButton).toBeDisabled();
  }
};
