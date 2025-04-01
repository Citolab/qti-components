import { expect } from '@storybook/test';

import { getItemByUri } from '../../../../../lib/qti-loader';

import type { QtiAssessmentItem } from '../../../../../lib';
import type { Meta, StoryObj } from '@storybook/web-components';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/basic/Q2 - Choice Interaction/multiple-cardinality-vocabulary',
  beforeEach: async ({ args }) => {}
};
export default meta;

export const Q2_L1_D101: Story = {
  name: 'Q2-L1-D101',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    choices.forEach(choice => {
      expect(choice.shadowRoot.querySelector('#label')).toBeNull();
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-1.xml')
    })
  ]
};

export const Q2_L1_D102: Story = {
  name: 'Q2-L1-D102',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['a', 'b', 'c', 'd', 'e', 'f'];
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-2a.xml')
    })
  ]
};

export const Q2_L1_D103: Story = {
  name: 'Q2-L1-D103',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-2b.xml')
    })
  ]
};

export const Q2_L1_D104: Story = {
  name: 'Q2-L1-D104',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['1', '2', '3', '4', '5', '6'];
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-2c.xml')
    })
  ]
};

export const Q2_L1_D105: Story = {
  name: 'Q2-L1-D105',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    choices.forEach(choice => {
      expect(choice.shadowRoot.querySelector('#label')).toBeNull();
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-2d.xml')
    })
  ]
};

export const Q2_L1_D106: Story = {
  name: 'Q2-L1-D106',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)'];
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-3a.xml')
    })
  ]
};

export const Q2_L1_D107: Story = {
  name: 'Q2-L1-D107',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['a.', 'b.', 'c.', 'd.', 'e.', 'f.'];
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-3b.xml')
    })
  ]
};

export const Q2_L1_D108: Story = {
  name: 'Q2-L1-D108',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['a', 'b', 'c', 'd', 'e', 'f'];
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-3c.xml')
    })
  ]
};

export const Q2_L1_D109: Story = {
  name: 'Q2-L1-D109',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['A)', 'B)', 'C)', 'D)', 'E)', 'F)'];
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-3d.xml')
    })
  ]
};

export const Q2_L1_D110: Story = {
  name: 'Q2-L1-D110',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.'];
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-3e.xml')
    })
  ]
};

export const Q2_L1_D111: Story = {
  name: 'Q2-L1-D111',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-3f.xml')
    })
  ]
};

export const Q2_L1_D112: Story = {
  name: 'Q2-L1-D112',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['1)', '2)', '3)', '4)', '5)', '6)'];
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-3g.xml')
    })
  ]
};

export const Q2_L1_D113: Story = {
  name: 'Q2-L1-D113',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['1.', '2.', '3.', '4.', '5.', '6.'];
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-3h.xml')
    })
  ]
};

export const Q2_L1_D114: Story = {
  name: 'Q2-L1-D114',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['1', '2', '3', '4', '5', '6'];
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-3i.xml')
    })
  ]
};

export const Q2_L1_D115: Story = {
  name: 'Q2-L1-D115',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    choices.forEach(choice => {
      expect(choice.shadowRoot.querySelector('#label')).toBeNull();
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-3j.xml')
    })
  ]
};

export const Q2_L1_D116: Story = {
  name: 'Q2-L1-D116',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    choices.forEach(choice => {
      expect(choice.shadowRoot.querySelector('#label').textContent.endsWith('.')).toBe(true);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-3k.xml')
    })
  ]
};

export const Q2_L1_D117: Story = {
  name: 'Q2-L1-D117',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    choices.forEach(choice => {
      expect(choice.shadowRoot.querySelector('#label').textContent.endsWith(')')).toBe(true);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/multiple-cardinality-sv-3l.xml')
    })
  ]
};
