import '@citolab/qti-components';

import { html, render } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';

import type { ComputedContext } from '@qti-components/base';
import type { TestNavigation } from './test-navigation';

/**
 * `test-navigation` builds the structure and the session-control cascade of `computedContext` from
 * the test's markup (`buildTestModel`): nested sections are listed once each, with only their own
 * item-refs, and every session-control attribute comes from the closest level that declares it.
 */

const testMarkup = html`
  <qti-test>
    <test-navigation>
      <test-container>
        <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T" title="Model">
          <qti-test-part identifier="P" navigation-mode="nonlinear" submission-mode="individual">
            <qti-assessment-section identifier="OUTER" title="Outer" visible="true">
              <qti-item-session-control max-attempts="3" allow-skipping="false"></qti-item-session-control>
              <qti-assessment-item-ref identifier="I1" href="items/i1.xml"></qti-assessment-item-ref>
              <qti-assessment-section identifier="INNER" title="Inner" visible="true">
                <qti-assessment-item-ref identifier="I2" href="items/i2.xml">
                  <qti-item-session-control show-feedback="true"></qti-item-session-control>
                </qti-assessment-item-ref>
                <qti-assessment-item-ref identifier="I3" href="items/i3.xml"></qti-assessment-item-ref>
              </qti-assessment-section>
            </qti-assessment-section>
          </qti-test-part>
        </qti-assessment-test>
      </test-container>
    </test-navigation>
  </qti-test>
`;

/** OUTER holds a subsection first (I1), then a subsection between, then its own item-ref (I3). */
const interleavedMarkup = html`
  <qti-test>
    <test-navigation>
      <test-container>
        <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T" title="Order">
          <qti-test-part identifier="P" navigation-mode="nonlinear" submission-mode="individual">
            <qti-assessment-section identifier="OUTER" title="Outer" visible="true">
              <qti-assessment-section identifier="A" title="A" visible="true">
                <qti-assessment-item-ref identifier="I1" href="items/i1.xml"></qti-assessment-item-ref>
              </qti-assessment-section>
              <qti-assessment-section identifier="B" title="B" visible="true">
                <qti-assessment-item-ref identifier="I2" href="items/i2.xml"></qti-assessment-item-ref>
              </qti-assessment-section>
              <qti-assessment-item-ref identifier="I3" href="items/i3.xml"></qti-assessment-item-ref>
            </qti-assessment-section>
          </qti-test-part>
        </qti-assessment-test>
      </test-container>
    </test-navigation>
  </qti-test>
`;

const settle = async () => {
  for (let i = 0; i < 3; i++) await new Promise(resolve => setTimeout(resolve));
};

describe('test-navigation computedContext from the test model', () => {
  let host: HTMLDivElement;

  const mount = async (markup = testMarkup): Promise<ComputedContext> => {
    host = document.createElement('div');
    render(markup, host);
    document.body.append(host);
    await settle();
    return (host.querySelector('test-navigation') as TestNavigation & { computedContext: ComputedContext })
      .computedContext;
  };

  afterEach(() => host?.remove());

  it('lists each nested section once, with only its own item-refs', async () => {
    const [part] = (await mount()).testParts;
    expect(part.sections.map(section => [section.identifier, section.items.map(item => item.identifier)])).toEqual([
      ['OUTER', ['I1']],
      ['INNER', ['I2', 'I3']]
    ]);
  });

  it('numbers items in document order where a subsection comes first or between item-refs', async () => {
    const context = await mount(interleavedMarkup);
    const items = context.testParts[0].sections.flatMap(section => section.items);
    // The flat list keeps each section's own item-refs together; the numbers follow the test.
    expect(items.map(item => [item.identifier, item.index])).toEqual([
      ['I3', 3],
      ['I1', 1],
      ['I2', 2]
    ]);
  });

  it('keeps the titles the upgraded elements move to data-title', async () => {
    const context = await mount();
    expect(context.title).toBe('Model');
    expect(context.testParts[0].sections.map(section => section.title)).toEqual(['Outer', 'Inner']);
  });

  it('inherits session control per attribute, through the enclosing sections', async () => {
    const items = (await mount()).testParts[0].sections.flatMap(section => section.items);
    const byId = Object.fromEntries(items.map(item => [item.identifier, item]));
    // I2 declares only show-feedback: max-attempts and allow-skipping still come from OUTER.
    expect(byId.I2).toMatchObject({ maxAttempts: 3, allowSkipping: false, showFeedback: true, showSolution: false });
    // I3 declares nothing: INNER declares nothing, so it inherits from OUTER, not from the part.
    expect(byId.I3).toMatchObject({ maxAttempts: 3, allowSkipping: false, showFeedback: false });
  });
});
