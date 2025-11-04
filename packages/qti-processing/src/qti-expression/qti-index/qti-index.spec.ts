import { describe, it, expect } from 'vitest';
import '@qti-components/components';

import { html, render } from 'lit';

import type { QtiIndex } from './qti-index';
describe('qti-index', () => {
  it('returns element using numeric n attribute', () => {
    const template = () => html`
      <qti-index n="2">
        <qti-ordered>
          <qti-base-value base-type="integer">10</qti-base-value>
          <qti-base-value base-type="integer">20</qti-base-value>
          <qti-base-value base-type="integer">30</qti-base-value>
        </qti-ordered>
      </qti-index>
    `;
    render(template(), document.body);

    const qtiIndex = document.body.querySelector('qti-index') as QtiIndex;
    expect(+qtiIndex.calculate()).toBe(20);
  });

  it('returns null when n attribute is missing', () => {
    const template = () => html`
      <qti-index>
        <qti-ordered>
          <qti-base-value base-type="integer">10</qti-base-value>
          <qti-base-value base-type="integer">20</qti-base-value>
        </qti-ordered>
      </qti-index>
    `;
    render(template(), document.body);

    const qtiIndex = document.body.querySelector('qti-index') as QtiIndex;
    expect(qtiIndex.calculate()).toBeNull();
  });

  it('returns null when index exceeds container size', () => {
    const template = () => html`
      <qti-index n="3">
        <qti-ordered>
          <qti-base-value base-type="integer">10</qti-base-value>
          <qti-base-value base-type="integer">20</qti-base-value>
        </qti-ordered>
      </qti-index>
    `;
    render(template(), document.body);

    const qtiIndex = document.body.querySelector('qti-index') as QtiIndex;
    expect(qtiIndex.calculate()).toBeNull();
  });

  it('returns null when index is not positive', () => {
    const template = () => html`
      <qti-index n="0">
        <qti-ordered>
          <qti-base-value base-type="integer">10</qti-base-value>
          <qti-base-value base-type="integer">20</qti-base-value>
        </qti-ordered>
      </qti-index>
    `;
    render(template(), document.body);

    const qtiIndex = document.body.querySelector('qti-index') as QtiIndex;
    expect(qtiIndex.calculate()).toBeNull();
  });

  it('preserves the base-type of the extracted value', () => {
    const template = () => html`
      <qti-index n="2">
        <qti-ordered>
          <qti-base-value base-type="float">10.5</qti-base-value>
          <qti-base-value base-type="boolean">true</qti-base-value>
          <qti-base-value base-type="string">test</qti-base-value>
        </qti-ordered>
      </qti-index>
    `;
    render(template(), document.body);

    const qtiIndex = document.body.querySelector('qti-index') as QtiIndex;
    expect(qtiIndex.calculate()).toBe('true');
  });

  it('errors when child does not have ordered cardinality', () => {
    const template = () => html`
      <qti-index n="1">
        <qti-base-value base-type="integer">10</qti-base-value>
      </qti-index>
    `;
    render(template(), document.body);

    const qtiIndex = document.body.querySelector('qti-index') as QtiIndex;
    expect(qtiIndex.calculate()).toBeNull();
  });
});
