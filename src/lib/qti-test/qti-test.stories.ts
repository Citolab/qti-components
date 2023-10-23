import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { useEffect, useRef, virtual, useState } from 'haunted';

import '../qti-components/index';
import './index';

import packages from '../../assets/api/packages.json';

import { QtiAssessmentTest } from './qti-assessment-test';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';

export default {
  title: 'qti-test',
  argTypes: {
    view: {
      options: ['candidate', 'scorer'],
      control: { type: 'radio' }
    },
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    'navigation-mode': {
      control: { type: 'radio' },
      options: ['linear', 'nonlinear']
    },
    'submission-mode': {
      control: { type: 'radio' },
      options: ['individual', 'simultaneous']
    }
  },
  args: {
    serverLocation: 'http://localhost:6006/api',
    qtipkg: 'biologie'
  },
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      values: [{ name: 'gray', value: '#eeeeee', default: true }]
    }
  },
  decorators: [story => html`${virtual(story)()}`]
};

export const QtiTestStory = {
  render: args => {
    const itemRefEls = useRef<Map<string, QtiAssessmentItemRef>>(new Map());
    const testEl = createRef<QtiAssessmentTest>();

    return html`
      <qti-test ${ref(testEl)} assessment-test-uri="${args.serverLocation}/${args.qtipkg}/bb-bi-22-examenvariant-1.xml">
      </qti-test>
    `;
  }
};

/*
<button @click=${() => localStorage.setItem('context', JSON.stringify(testEl.value.context))}>Save</button>
<button @click=${() => (testEl.value.context = JSON.parse(localStorage.getItem('context')))}>Load</button>
*/
