import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import { getAssessmentItemFromItemContainer } from '../../../../../tools/testing/test-utils';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiItem } from './qti-item';

const { events, args, argTypes, template } = getStorybookHelpers('qti-item');

type Story = StoryObj<QtiItem & typeof args>;

const meta: Meta<QtiItem> = {
  component: 'qti-item',
  subcomponents: { ItemContainer: 'item-container' },
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
  // tags: ['autodocs']
};
export default meta;

export const Default: Story = {
  render: args => {
    return html`${template(args, html`<item-container item-url="/qti-item/example-choice-item.xml"></item-container>`)}`;
  }
};

/**
 * `view` picks the audience, which is what reveals content tagged for it — here the
 * `qti-rubric-block view="scorer"` carrying the answer model. At `candidate` it stays hidden,
 * exactly as it is for a learner sitting the item.
 *
 * Standalone: no `<qti-test>` anywhere. That is the point — resolving the view used to be a
 * test-only capability, so a rubric block in an item delivered on its own could not be shown
 * by any public API.
 */
export const ScorerView: Story = {
  render: args => {
    return html`${template(
      { ...args, view: 'scorer' },
      html`<item-container item-url="/assets/api/kennisnet/ITEM002.xml"></item-container>`
    )}`;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = await getAssessmentItemFromItemContainer(canvasElement);
    const rubric = await waitFor(() => {
      const block = assessmentItem?.querySelector('qti-rubric-block[view="scorer"]');
      if (!block) throw new Error('rubric block not parsed yet');
      return block;
    });

    await waitFor(() => expect(rubric).toHaveClass('show'));
    expect(getComputedStyle(rubric).display).toBe('block');
  }
};

/** The same item for a candidate: the answer model is not theirs to read. */
export const CandidateView: Story = {
  render: args => {
    return html`${template(
      { ...args, view: 'candidate' },
      html`<item-container item-url="/assets/api/kennisnet/ITEM002.xml"></item-container>`
    )}`;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = await getAssessmentItemFromItemContainer(canvasElement);
    const rubric = await waitFor(() => {
      const block = assessmentItem?.querySelector('qti-rubric-block[view="scorer"]');
      if (!block) throw new Error('rubric block not parsed yet');
      return block;
    });

    expect(rubric).not.toHaveClass('show');
    expect(getComputedStyle(rubric).display).toBe('none');
  },
  tags: ['!autodocs']
};
