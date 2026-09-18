import '@citolab/qti-components';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { QtiAssessmentItem } from './qti-assessment-item';

/**
 * Lit derives an attribute name by lowercasing the property, so a camelCase
 * property bound to a hyphenated QTI attribute has to say so explicitly. Where
 * it does not, the attribute silently never arrives.
 */
describe('qti-assessment-item hyphenated attributes', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => container.remove());

  const mount = async (markup: string) => {
    container.innerHTML = markup;
    const item = container.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await item.updateComplete;
    return item;
  };

  it('reads time-dependent onto timeDependent', async () => {
    const item = await mount('<qti-assessment-item identifier="I" time-dependent="true"></qti-assessment-item>');
    expect(item.timeDependent).toBe('true');
  });

  it('reads a false time-dependent too', async () => {
    const item = await mount('<qti-assessment-item identifier="I" time-dependent="false"></qti-assessment-item>');
    expect(item.timeDependent).toBe('false');
  });

  it('leaves it null when the attribute is absent', async () => {
    const item = await mount('<qti-assessment-item identifier="I"></qti-assessment-item>');
    expect(item.timeDependent).toBeNull();
  });
});
