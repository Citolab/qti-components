import { expect } from '@storybook/test';

import { getItemByUri } from '../../../../../lib/qti-loader';

import type { QtiAssessmentItem } from '../../../../../lib';
import type { Meta, StoryObj } from '@storybook/web-components';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/basic/Q2 - Choice Interaction/single-cardinality-vocabulary',
  beforeEach: async () => {}
};
export default meta;

export const Q22_L1_D201: Story = {
  name: 'Q22-L1-D201',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    // No specific class applied for labels, behavior is at platform's discretion
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    // Test can validate that labels are displayed as per platform discretion, but no strict expectation
    choices.forEach(choice => {
      expect(choice.shadowRoot.querySelector('#label')).toBe(null); // Flexible validation, as labels can vary
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-1.xml')
    })
  ]
};

export const Q22_L1_D202: Story = {
  name: 'Q22-L1-D202',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    choices.forEach(choice => {
      expect(choice.shadowRoot.querySelector('#label')).toBeNull(); // Ensures no labels are shown
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-2a.xml')
    })
  ]
};

export const Q22_L1_D203: Story = {
  name: 'Q22-L1-D203',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['1', '2', '3', '4', '5', '6']; // Expected numeric order
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-2b.xml')
    })
  ]
};

export const Q22_L1_D204: Story = {
  name: 'Q22-L1-D204',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['a', 'b', 'c', 'd', 'e', 'f']; // Expected alphabetic order in lowercase
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-2c.xml')
    })
  ]
};

export const Q22_L1_D205: Story = {
  name: 'Q22-L1-D205',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']; // Expected upper-case alphabetic order
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-2d.xml')
    })
  ]
};

export const Q22_L1_D206: Story = {
  name: 'Q22-L1-D206',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['a', 'b', 'c', 'd', 'e', 'f']; // Expected lower-case alphabetic order without suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-3a.xml')
    })
  ]
};

export const Q22_L1_D207: Story = {
  name: 'Q22-L1-D207',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['a.', 'b.', 'c.', 'd.', 'e.', 'f.']; // Expected lower-case alphabetic order with period suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-3b.xml')
    })
  ]
};

export const Q22_L1_D208: Story = {
  name: 'Q22-L1-D208',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']; // Expected lower-case alphabetic order with parenthesis suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-3c.xml')
    })
  ]
};

export const Q22_L1_I209: Story = {
  name: 'Q22-L1-I209',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']; // Expected uppercase alphabetic order with no suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-3d.xml')
    })
  ]
};

export const Q22_L1_I210: Story = {
  name: 'Q22-L1-I210',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.']; // Expected uppercase alphabetic order with period suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-3e.xml')
    })
  ]
};

export const Q22_L1_I211: Story = {
  name: 'Q22-L1-I211',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['A)', 'B)', 'C)', 'D)', 'E)', 'F)']; // Expected uppercase alphabetic order with parenthesis suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-3f.xml')
    })
  ]
};

export const Q22_L1_I212: Story = {
  name: 'Q22-L1-I212',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['1', '2', '3', '4', '5', '6']; // Expected numeric order with no suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-3g.xml')
    })
  ]
};

export const Q22_L1_I213: Story = {
  name: 'Q22-L1-I213',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['1.', '2.', '3.', '4.', '5.', '6.']; // Expected numeric order with period suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-3h.xml')
    })
  ]
};

export const Q22_L1_I214: Story = {
  name: 'Q22-L1-I214',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['1)', '2)', '3)', '4)', '5)', '6)']; // Expected numeric order with parenthesis suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-3i.xml')
    })
  ]
};

export const Q22_L1_I215: Story = {
  name: 'Q22-L1-I215',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    choices.forEach(choice => {
      expect(choice.shadowRoot.querySelector('#label')).toBe(null);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-3j.xml')
    })
  ]
};

export const Q22_L1_I216: Story = {
  name: 'Q22-L1-I216',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    choices.forEach(choice => {
      expect(choice.shadowRoot.querySelector('#label').textContent.endsWith('.')).toBe(true);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-3k.xml')
    })
  ]
};

export const Q22_L1_I217: Story = {
  name: 'Q22-L1-I217',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    choices.forEach(choice => {
      expect(choice.shadowRoot.querySelector('#label').textContent.endsWith(')')).toBe(true);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('/assets/qti-conformance/Basic/Q2/single-cardinality-sv-3l.xml')
    })
  ]
};
