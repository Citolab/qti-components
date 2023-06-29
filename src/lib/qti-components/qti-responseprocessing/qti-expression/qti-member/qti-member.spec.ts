import { html, render } from 'lit';
import { QtiMember } from './qti-member';
import { describe, expect, it } from '@jest/globals';
import '../../../index';

describe('qti-contains', () => {
  const failTemplate = () => html`
    <qti-assessment-item data-testid="qti-assessment">
      <qti-outcome-declaration base-type="string" cardinality="multiple" identifier="BODY">
        <qti-default-value>
          <qti-value>part1</qti-value>
          <qti-value>part2</qti-value>
          <qti-value>part3</qti-value>
        </qti-default-value>
      </qti-outcome-declaration>
      <qti-member data-testid="qti-member">
        <qti-base-value base-type="string">part2</qti-base-value>
        <qti-variable identifier="BODY"></qti-variable>
      </qti-member>
    </qti-assessment-item>
  `;

  it('The member operator takes two sub-expressions', () => {
    render(failTemplate(), document.body);
    const qtiMember = document.body.querySelector('qti-member') as QtiMember;
    const result = qtiMember.calculate();
    expect(result).toBeTruthy();
  });
});
