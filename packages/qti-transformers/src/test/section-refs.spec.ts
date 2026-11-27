import { afterEach, describe, expect, it, vi } from 'vitest';

import { qtiTransformTest } from '../qti-transform-test';

/**
 * `qti-assessment-section-ref` is a facade (QTI 3 info model §7.5): the loaded test behaves as if the
 * referenced section were written in it. The suite's own sample (Advanced/T12, S9-L2-D1) keeps its
 * section next to the test, so these cases put sections in subfolders to prove the URLs follow.
 */

const NS = 'xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"';

const test = (body: string) =>
  `<qti-assessment-test ${NS} identifier="t" title="T"><qti-test-part identifier="p" navigation-mode="nonlinear" submission-mode="individual">${body}</qti-test-part></qti-assessment-test>`;
const section = (identifier: string, body: string) =>
  `<qti-assessment-section ${NS} identifier="${identifier}" title="${identifier}" visible="true">${body}</qti-assessment-section>`;

/** Serves `files` (path → XML) at `/pkg/`; anything else is a 404. */
const serve = (files: Record<string, string>) => {
  const fetchMock = vi.fn(async (url: string) => {
    const path = decodeURI(String(url)).replace(/^\/pkg\//, '');
    return path in files ? new Response(files[path], { status: 200 }) : new Response('', { status: 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const sectionIds = (api: Awaited<ReturnType<ReturnType<typeof qtiTransformTest>['load']>>) =>
  Array.from(api.xmlDoc().getElementsByTagName('*'))
    .filter(el => el.localName === 'qti-assessment-section')
    .map(el => el.getAttribute('identifier'));

const itemHrefs = (api: Awaited<ReturnType<ReturnType<typeof qtiTransformTest>['load']>>) =>
  api.items().map(item => item.href);

describe('qti-assessment-section-ref', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('includes the referenced section where the reference was, under the reference identifier', async () => {
    serve({
      'test.xml': test(
        `${section('S1', '<qti-assessment-item-ref identifier="i1" href="items/1.xml"/>')}<qti-assessment-section-ref identifier="S2" href="section2.xml"/>`
      ),
      'section2.xml': section('own-id', '<qti-assessment-item-ref identifier="i2" href="items/2.xml"/>')
    });

    const api = await qtiTransformTest().load('/pkg/test.xml');

    expect(sectionIds(api)).toEqual(['S1', 'S2']);
    expect(itemHrefs(api)).toEqual(['/pkg/items/1.xml', '/pkg/items/2.xml']);
    expect(api.xml()).not.toContain('qti-assessment-section-ref');
  });

  it('keeps the URLs of a section in a subfolder pointing at its own files', async () => {
    serve({
      'test.xml': test('<qti-assessment-section-ref identifier="S" href="sections/s.xml"/>'),
      'sections/s.xml': section(
        'S',
        '<qti-rubric-block view="candidate"><qti-content-body><img src="img/a.png" alt="a"/></qti-content-body></qti-rubric-block><qti-assessment-item-ref identifier="i" href="../items/i.xml"/><qti-assessment-item-ref identifier="j" href="https://cdn.example/j.xml"/>'
      )
    });

    const api = await qtiTransformTest().load('/pkg/test.xml');

    expect(itemHrefs(api)).toEqual(['/pkg/sections/../items/i.xml', 'https://cdn.example/j.xml']);
    expect(api.xmlDoc().getElementsByTagName('img')[0].getAttribute('src')).toBe('/pkg/sections/img/a.png');
  });

  it('resolves a reference inside a referenced section relative to that section', async () => {
    serve({
      'test.xml': test('<qti-assessment-section-ref identifier="Outer" href="a/outer.xml"/>'),
      'a/outer.xml': section('Outer', '<qti-assessment-section-ref identifier="Inner" href="b/inner.xml"/>'),
      'a/b/inner.xml': section('Inner', '<qti-assessment-item-ref identifier="i" href="i.xml"/>')
    });

    const api = await qtiTransformTest().load('/pkg/test.xml');

    expect(sectionIds(api)).toEqual(['Outer', 'Inner']);
    expect(itemHrefs(api)).toEqual(['/pkg/a/b/i.xml']);
  });

  it('includes one section file referenced twice, once per reference, when it holds no item-refs', async () => {
    const fetchMock = serve({
      'test.xml': test(
        '<qti-assessment-section-ref identifier="First" href="s.xml"/><qti-assessment-section-ref identifier="Second" href="s.xml"/>'
      ),
      's.xml': section(
        'S',
        '<qti-rubric-block view="candidate"><qti-content-body><p>Read carefully.</p></qti-content-body></qti-rubric-block>'
      )
    });

    const api = await qtiTransformTest().load('/pkg/test.xml');

    expect(sectionIds(api)).toEqual(['First', 'Second']);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('rejects a test that repeats an item-ref identifier once its sections are included', async () => {
    serve({
      'test.xml': test(
        '<qti-assessment-section-ref identifier="First" href="s.xml"/><qti-assessment-section-ref identifier="Second" href="s.xml"/>'
      ),
      's.xml': section('S', '<qti-assessment-item-ref identifier="i" href="i.xml"/>')
    });

    await expect(qtiTransformTest().load('/pkg/test.xml')).rejects.toThrow(/repeats qti-assessment-item-ref "i"/);
  });

  it('refuses a section that refers back to itself', async () => {
    serve({
      'test.xml': test('<qti-assessment-section-ref identifier="A" href="a.xml"/>'),
      'a.xml': section('A', '<qti-assessment-section-ref identifier="B" href="b.xml"/>'),
      'b.xml': section('B', '<qti-assessment-section-ref identifier="A2" href="a.xml"/>')
    });

    await expect(qtiTransformTest().load('/pkg/test.xml')).rejects.toThrow(/refers back to itself/);
  });

  it('rejects when a referenced section cannot be loaded, or is not a section', async () => {
    serve({ 'test.xml': test('<qti-assessment-section-ref identifier="S" href="missing.xml"/>') });
    await expect(qtiTransformTest().load('/pkg/test.xml')).rejects.toThrow(/Failed to load XML/);

    serve({
      'test.xml': test('<qti-assessment-section-ref identifier="S" href="item.xml"/>'),
      'item.xml': `<qti-assessment-item ${NS} identifier="x"/>`
    });
    await expect(qtiTransformTest().load('/pkg/test.xml')).rejects.toThrow(/does not hold a single/);
  });

  it('passes the abort signal on to the referenced sections', async () => {
    const fetchMock = serve({
      'test.xml': test('<qti-assessment-section-ref identifier="S" href="s.xml"/>'),
      's.xml': section('S', '')
    });
    const controller = new AbortController();

    await qtiTransformTest().load('/pkg/test.xml', controller.signal);

    expect(fetchMock).toHaveBeenLastCalledWith('/pkg/s.xml', { signal: controller.signal });
  });

  it('leaves a test without references as it was', async () => {
    const xml = test(section('S', '<qti-assessment-item-ref identifier="i" href="i.xml"/>'));
    const fetchMock = serve({ 'test.xml': xml });

    const api = await qtiTransformTest().load('/pkg/test.xml');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(itemHrefs(api)).toEqual(['/pkg/i.xml']);
  });

  it('warns that a test given as a string cannot include referenced sections', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    qtiTransformTest().parse(test('<qti-assessment-section-ref identifier="S" href="s.xml"/>'));

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('qti-assessment-section-ref'));
    warn.mockRestore();
  });
});
