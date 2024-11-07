import { QtiAssessmentItem, QtiSimpleChoice } from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect } from '@storybook/test';
import { fireEvent, screen } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getItemByUri } from '../../../../../lib/qti-loader';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/basic/Q2 - Choice Interaction/single-cardinality-vocabulary',
  beforeEach: async ({ args }) => {}
};
export default meta;

export const Q22_L1_D201: Story = {
  name: 'Q22-L1-D201',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
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
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-1.xml')
    })
  ]
};

export const Q22_L1_D202: Story = {
  name: 'Q22-L1-D202',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');
    await element.updateComplete;

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    choices.forEach(choice => {
      expect(choice.shadowRoot.querySelector('#label')).toBeNull(); // Ensures no labels are shown
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-2a.xml')
    })
  ]
};

export const Q22_L1_D203: Story = {
  name: 'Q22-L1-D203',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
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
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-2b.xml')
    })
  ]
};

export const Q22_L1_D204: Story = {
  name: 'Q22-L1-D204',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
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
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-2c.xml')
    })
  ]
};

export const Q22_L1_D205: Story = {
  name: 'Q22-L1-D205',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']; // Expected upper-case alphabetic order
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-2d.xml')
    })
  ]
};

export const Q22_L1_D206: Story = {
  name: 'Q22-L1-D206',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['a', 'b', 'c', 'd', 'e', 'f']; // Expected lower-case alphabetic order without suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-3a.xml')
    })
  ]
};

export const Q22_L1_D207: Story = {
  name: 'Q22-L1-D207',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['a.', 'b.', 'c.', 'd.', 'e.', 'f.']; // Expected lower-case alphabetic order with period suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-3b.xml')
    })
  ]
};

export const Q22_L1_D208: Story = {
  name: 'Q22-L1-D208',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']; // Expected lower-case alphabetic order with parenthesis suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-3c.xml')
    })
  ]
};

export const Q22_L1_I209: Story = {
  name: 'Q22-L1-I209',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']; // Expected uppercase alphabetic order with no suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-3d.xml')
    })
  ]
};

export const Q22_L1_I210: Story = {
  name: 'Q22-L1-I210',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.']; // Expected uppercase alphabetic order with period suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-3e.xml')
    })
  ]
};

export const Q22_L1_I211: Story = {
  name: 'Q22-L1-I211',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['A)', 'B)', 'C)', 'D)', 'E)', 'F)']; // Expected uppercase alphabetic order with parenthesis suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-3f.xml')
    })
  ]
};

export const Q22_L1_I212: Story = {
  name: 'Q22-L1-I212',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['1', '2', '3', '4', '5', '6']; // Expected numeric order with no suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-3g.xml')
    })
  ]
};

export const Q22_L1_I213: Story = {
  name: 'Q22-L1-I213',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['1.', '2.', '3.', '4.', '5.', '6.']; // Expected numeric order with period suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-3h.xml')
    })
  ]
};

export const Q22_L1_I214: Story = {
  name: 'Q22-L1-I214',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['1)', '2)', '3)', '4)', '5)', '6)']; // Expected numeric order with parenthesis suffix
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent).toBe(labels[index]);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-3i.xml')
    })
  ]
};

export const Q22_L1_I215: Story = {
  name: 'Q22-L1-I215',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    choices.forEach(choice => {
      expect(choice.shadowRoot.querySelector('#label')).toBe(null);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-3j.xml')
    })
  ]
};

export const Q22_L1_I216: Story = {
  name: 'Q22-L1-I216',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = ['.', '.', '.', '.', '.', '.']; // Expected suffix for each label as period
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent.endsWith('.')).toBe(true);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-3k.xml')
    })
  ]
};

export const Q22_L1_I217: Story = {
  name: 'Q22-L1-I217',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
    `;
  },
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector('qti-choice-interaction');

    const choices = Array.from(element.querySelectorAll('qti-simple-choice'));
    const labels = [')', ')', ')', ')', ')', ')']; // Expected suffix for each label as parenthesis
    choices.forEach((choice, index) => {
      expect(choice.shadowRoot.querySelector('#label').textContent.endsWith(')')).toBe(true);
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q2/single-cardinality-sv-3l.xml')
    })
  ]
};
