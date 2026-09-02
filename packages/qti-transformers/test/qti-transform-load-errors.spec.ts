import { afterEach, vi } from 'vitest';

import { qtiTransformManifest } from '../src/qti-transform-manifest';
import { qtiTransformTest } from '../src/qti-transform-test';

/**
 * A `load()` that neither resolves nor rejects hangs its caller forever, so
 * `await expect(...).rejects` would sit until the suite timeout rather than
 * fail. Race the load against a short timer so an unsettled promise is an
 * explicit, fast assertion failure.
 */
const settlementOf = (promise: Promise<unknown>): Promise<'resolved' | 'rejected' | 'never-settled'> =>
  Promise.race([
    promise.then(
      () => 'resolved' as const,
      () => 'rejected' as const
    ),
    new Promise<'never-settled'>(resolve => setTimeout(() => resolve('never-settled'), 100))
  ]);

const stubFailingFetch = () => {
  const fetchMock = vi.fn(async () => {
    throw new TypeError('Failed to fetch');
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const stubNotFoundFetch = () => {
  const fetchMock = vi.fn(async () => new Response('', { status: 404 }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('load() failure propagation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('qtiTransformTest', () => {
    it('rejects when the network fetch fails', async () => {
      stubFailingFetch();

      await expect(settlementOf(qtiTransformTest().load('https://example.com/tests/assessment.xml'))).resolves.toBe(
        'rejected'
      );
    });

    it('surfaces the underlying failure to the caller', async () => {
      stubFailingFetch();

      await expect(qtiTransformTest().load('https://example.com/tests/assessment.xml')).rejects.toThrow(
        'Failed to load XML: Failed to fetch'
      );
    });

    it('rejects on a non-OK response', async () => {
      stubNotFoundFetch();

      await expect(qtiTransformTest().load('https://example.com/tests/assessment.xml')).rejects.toThrow(
        'Failed to load XML: HTTP error! status: 404'
      );
    });

    it('still resolves with the api on success', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('<qti-assessment-test identifier="T1" />', { status: 200 }))
      );

      const api = await qtiTransformTest().load('https://example.com/tests/assessment.xml');

      expect(api.xmlDoc().querySelector('qti-assessment-test')?.getAttribute('identifier')).toBe('T1');
    });
  });

  describe('qtiTransformManifest', () => {
    it('rejects when the network fetch fails', async () => {
      stubFailingFetch();

      await expect(settlementOf(qtiTransformManifest().load('https://example.com/imsmanifest.xml'))).resolves.toBe(
        'rejected'
      );
    });

    it('surfaces the underlying failure to the caller', async () => {
      stubFailingFetch();

      await expect(qtiTransformManifest().load('https://example.com/imsmanifest.xml')).rejects.toThrow(
        'Failed to load XML: Failed to fetch'
      );
    });

    it('still resolves with the api on success', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(
          async () =>
            new Response(
              `<manifest><resources><resource identifier="assessment.xml" type="imsqti_test_xmlv3p0" href="tests/assessment.xml" /></resources></manifest>`,
              { status: 200 }
            )
        )
      );

      const api = await qtiTransformManifest().load('https://example.com/imsmanifest.xml');

      expect(api.assessmentTest()).toEqual({ href: 'tests/assessment.xml', identifier: 'assessment.xml' });
    });
  });
});
