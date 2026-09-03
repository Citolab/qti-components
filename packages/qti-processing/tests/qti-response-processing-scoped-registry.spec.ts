import { afterEach, describe, expect, it } from 'vitest';

import '@qti-components/elements/register';
import '@qti-components/processing/register';

import { qtiContentElements } from '@qti-components/elements/elements';
import { qtiProcessingElements, QtiResponseCondition } from '@qti-components/processing/elements';

import type { QtiAssessmentItem, QtiResponseProcessing } from '@qti-components/elements';

/*
 * The scoped stand-in for `qti-response-condition`. Distinct from the class the same tag has in the
 * global registry, so an `instanceof` says WHICH registry upgraded the rule — the point of the
 * suite. This is the shape a delivery application in a scoped registry actually has: the tags are
 * defined globally as well (importing the packages registers them), and the scoped registry
 * overrides some of them, the way `qti-corrections` does.
 */
class ScopedResponseCondition extends QtiResponseCondition {}

const scopedRegistry = (() => {
  const registry = new CustomElementRegistry();
  for (const { tag, ctor } of [...qtiProcessingElements, ...qtiContentElements]) {
    if (!registry.get(tag)) registry.define(tag, tag === 'qti-response-condition' ? ScopedResponseCondition : ctor);
  }
  return registry;
})();

const itemXML = `<qti-assessment-item identifier="scoped-map-response" title="Composition of Water" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="identifier">
    <qti-correct-response>
      <qti-value>H</qti-value>
      <qti-value>O</qti-value>
    </qti-correct-response>
    <qti-mapping lower-bound="0" upper-bound="2" default-value="-2">
      <qti-map-entry map-key="H" mapped-value="1"></qti-map-entry>
      <qti-map-entry map-key="O" mapped-value="1"></qti-map-entry>
      <qti-map-entry map-key="Cl" mapped-value="-1"></qti-map-entry>
    </qti-mapping>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
  <qti-item-body></qti-item-body>
  <qti-response-processing
    template="https://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response.xml"
  ></qti-response-processing>
</qti-assessment-item>`;

const renderInScopedShadowRoot = async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open', customElementRegistry: scopedRegistry });
  shadow.innerHTML = itemXML;

  const assessmentItem = shadow.querySelector('qti-assessment-item') as QtiAssessmentItem;
  const responseProcessing = shadow.querySelector('qti-response-processing') as QtiResponseProcessing;
  await assessmentItem.updateComplete;
  await responseProcessing.updateComplete;

  return { assessmentItem, responseProcessing };
};

afterEach(() => {
  document.body.replaceChildren();
});

describe('qti-response-processing in a scoped registry', () => {
  it('upgrades the substituted template rules with the scoped registry', async () => {
    const { responseProcessing } = await renderInScopedShadowRoot();

    expect(responseProcessing.firstElementChild).toBeInstanceOf(ScopedResponseCondition);
  });

  it('processes the substituted template', async () => {
    const { assessmentItem } = await renderInScopedShadowRoot();

    assessmentItem.updateResponseVariable('RESPONSE', ['H', 'O']);
    assessmentItem.processResponse();

    expect(+assessmentItem.getOutcome('SCORE').value).toEqual(2);
  });
});
