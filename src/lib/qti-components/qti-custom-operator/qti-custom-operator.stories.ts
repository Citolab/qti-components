import { html } from 'lit';
import { virtual } from 'haunted';

import '../index';

export default {
  component: 'qti-custom-operator',
  decorators: [story => html`${virtual(story)()}`]
};

import zp from './qti-custom-operator.xml?raw';

export const CustomOperator = {
  render: () => {
    return html` <qti-item .xml=${zp}></qti-item> `;
  }
};
