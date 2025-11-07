import '@citolab/qti-components';
import { describe, it, expect } from 'vitest';
import { html, render } from 'lit';

import type { QtiDelete } from './qti-delete';
import type { QtiAssessmentItem } from '@qti-components/elements';

describe('qti-delete', () => {
  it('should check if the variable identified in the first child is contained in the second one', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-outcome-declaration
          identifier="REVEALED"
          cardinality="single"
          base-type="identifier"
        ></qti-outcome-declaration>

        <qti-outcome-declaration identifier="CLOSED" cardinality="multiple" base-type="identifier">
          <qti-default-value>
            <qti-value>DoorA</qti-value>
            <qti-value>DoorB</qti-value>
            <qti-value>DoorC</qti-value>
          </qti-default-value>
        </qti-outcome-declaration>
        <qti-delete>
          <qti-variable identifier="REVEALED"></qti-variable>
          <qti-variable identifier="CLOSED"></qti-variable>
        </qti-delete>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiDelete = document.body.querySelector('qti-delete') as QtiDelete;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('REVEALED', ['DoorB']);

    expect(['DoorA', 'DoorC']).toEqual(qtiDelete.calculate());
  });
});
