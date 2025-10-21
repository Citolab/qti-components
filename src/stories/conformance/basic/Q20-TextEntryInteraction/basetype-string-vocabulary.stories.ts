import { expect } from 'storybook/test';
import { userEvent } from 'storybook/test';
import { html } from 'lit';

import { getItemByUri } from '../../../../lib/qti-loader/qti-loader';

import type { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/basic/Q20 - Text Entry Interaction/baseType-string-vocabulary',
  beforeEach: async () => {}
};
export default meta;

const getInputString = (charCount: number) => {
  return 'W'.repeat(charCount);
};

export const Q20_L1_D101: Story = {
  name: 'Q20-L1-D101',
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const classes = textEntryInteraction.classList;
    const containsWidthClass = !!Array.from(classes).find(c => c.startsWith('qti-input-width'));

    // Check if input width is set by platform defaults since no width class is applied
    expect(containsWidthClass).toBeFalsy(); // or validate against platform’s default behavior
  },
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-1.xml')
    })
  ]
};

export const Q20_L1_D102: Story = {
  name: 'Q20-L1-D102',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2a.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    // type a character into the input field
    await userEvent.type(input, getInputString(1));
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    // Check if input has a width of at least 1 character
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D103: Story = {
  name: 'Q20-L1-D103',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2b.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');
    // type a character into the input field
    await userEvent.type(input, getInputString(2));
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    // Check if input has a width of at least 1 character
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D104: Story = {
  name: 'Q20-L1-D104',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2c.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    // Check if input has a width of at least 3 characters
    expect(textEntryInteraction.classList.contains('qti-input-width-3')).toBeTruthy();

    const chars = getInputString(3);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D105: Story = {
  name: 'Q20-L1-D105',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2d.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    // Check if input has a width of at least 4 characters
    expect(textEntryInteraction.classList.contains('qti-input-width-4')).toBeTruthy();
    const chars = getInputString(4);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

// THIS ONE SHOULD TESTS A CLASS THAT IS NOT DESCRIBED IN THE SPECS

// export const Q20_L1_D112: Story = {
//   name: 'Q20-L1-D112',
//   loaders: [
//     async () => ({
//       xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2j.xml')
//     })
//   ],
//   render: (args, { argTypes, loaded: { xml } }) => {
//     let item;
//     const onItemConnected = ({ detail: qtiAssessmentItem }) => {
//       item = qtiAssessmentItem;
//     };

//     return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
//   },
//   play: async ({ canvasElement }) => {
//     const assessmentItem = canvasElement.querySelector('qti-assessment-item');
//     const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
//     const input = textEntryInteraction.shadowRoot.querySelector('input');

//     // Check if input has a width of at least 5 characters
//     expect(textEntryInteraction.classList.contains('qti-input-width-5')).toBeTruthy();
//     const chars = getInputString(5);
//     await userEvent.type(input, chars);
//     const width = input.clientWidth;
//     const contentWidth = input.scrollWidth;
//     expect(contentWidth).toBeLessThanOrEqual(width);
//   }
// };

export const Q20_L1_D106: Story = {
  name: 'Q20-L1-D106',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2e.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    // Check if input has a width of at least 6 characters
    expect(textEntryInteraction.classList.contains('qti-input-width-6')).toBeTruthy();
    const chars = getInputString(6);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D107: Story = {
  name: 'Q20-L1-D107',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2f.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    // Check if input has a width of at least 10 characters
    expect(textEntryInteraction.classList.contains('qti-input-width-10')).toBeTruthy();
    const chars = getInputString(10);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D108: Story = {
  name: 'Q20-L1-D108',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2g.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    // Check if input has a width of at least 15 characters
    expect(textEntryInteraction.classList.contains('qti-input-width-15')).toBeTruthy();
    const chars = getInputString(15);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D109: Story = {
  name: 'Q20-L1-D109',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2h.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    // Check if input has a width of at least 20 characters
    expect(textEntryInteraction.classList.contains('qti-input-width-20')).toBeTruthy();
    const chars = getInputString(20);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D113: Story = {
  name: 'Q20-L1-D113',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2k.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    // Check if input has a width of at least 25 characters
    expect(textEntryInteraction.classList.contains('qti-input-width-25')).toBeTruthy();
    const chars = getInputString(25);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D114: Story = {
  name: 'Q20-L1-D114',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2l.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    // Check if input has a width of at least 30 characters
    expect(textEntryInteraction.classList.contains('qti-input-width-30')).toBeTruthy();
    const chars = getInputString(30);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D115: Story = {
  name: 'Q20-L1-D115',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2m.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    expect(textEntryInteraction.classList.contains('qti-input-width-35')).toBeTruthy();
    const chars = getInputString(35);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D116: Story = {
  name: 'Q20-L1-D116',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2n.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    expect(textEntryInteraction.classList.contains('qti-input-width-40')).toBeTruthy();
    const chars = getInputString(40);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D117: Story = {
  name: 'Q20-L1-D117',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2o.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    expect(textEntryInteraction.classList.contains('qti-input-width-45')).toBeTruthy();
    const chars = getInputString(45);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D118: Story = {
  name: 'Q20-L1-D118',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2p.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    expect(textEntryInteraction.classList.contains('qti-input-width-50')).toBeTruthy();
    const chars = getInputString(50);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D110: Story = {
  name: 'Q20-L1-D110',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-2i.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    expect(textEntryInteraction.classList.contains('qti-input-width-72')).toBeTruthy();
    const chars = getInputString(72);
    await userEvent.type(input, chars);
    const width = input.clientWidth;
    const contentWidth = input.scrollWidth;
    expect(contentWidth).toBeLessThanOrEqual(width);
  }
};

export const Q20_L1_D111: Story = {
  name: 'Q20-L1-D111',
  loaders: [
    async () => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q20/text-entry-sv-3.xml')
    })
  ],
  render: (_args, { loaded: { xml } }) => {
    let item: any;
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
    };

    return html` <div class="item" @qti-assessment-item-connected=${onItemConnected}>${xml}</div> `;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = canvasElement.querySelector('qti-assessment-item');
    const textEntryInteraction = assessmentItem.querySelector('qti-text-entry-interaction');
    const input = textEntryInteraction.shadowRoot.querySelector('input');

    // Type some text that violates the pattern mask
    await userEvent.type(input, 'invalidText');

    // Assuming the platform should show a pattern mask violation message
    const patternMaskMessage = textEntryInteraction.getAttribute('data-patternmask-message');
    expect(patternMaskMessage).toBeTruthy();
    // Here you could add checks to verify that the message is actually displayed,
    // depending on how your platform handles pattern mask violations.
  }
};
