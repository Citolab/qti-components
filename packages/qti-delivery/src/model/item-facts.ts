import { booleanAttribute, childElement, childElements } from './xml-node.js';

import type { XmlElement } from './xml-node.js';

/**
 * What a `qti-assessment-item` says about itself, read from its XML when it is fetched: no live
 * state, nothing that needs the item rendered. Plain JSON, so a server can read the same file.
 *
 * Experimental (0.x): roadmap 1 phase T1; see `plans/test-model.md`.
 */
export interface ItemFacts {
  /** The item's own `identifier`, which may differ from the item-ref's. */
  identifier: string;
  /** `adaptive`; false when absent (XSD default). */
  adaptive: boolean;
  /** `time-dependent`; false when absent. */
  timeDependent: boolean;
  /**
   * A response declaration has a correct response, or a mapping with a map entry, or an area
   * mapping with an area-map entry: something to compare a response with.
   */
  hasCorrectResponse: boolean;
  /** The item has `qti-response-processing`. */
  hasResponseProcessing: boolean;
  /** `external-scored` on the `SCORE` outcome declaration, or null when not externally scored. */
  externalScored: 'human' | 'externalMachine' | null;
  /** `label`, or null when absent. */
  label: string | null;
  /** `title`; empty when absent. */
  title: string;
}

/**
 * Read the facts of an item from its `qti-assessment-item` element: the XML document under Node,
 * the fetched document in the browser. Reads attributes and child elements only, so no element
 * needs to be registered.
 */
export function readItemFacts(item: XmlElement): ItemFacts {
  if (item.localName !== 'qti-assessment-item') {
    throw new TypeError(`Expected a qti-assessment-item element, not ${String(item.localName)}.`);
  }
  const responseDeclarations = childElements(item, 'qti-response-declaration');
  const score = childElements(item, 'qti-outcome-declaration').find(
    declaration => declaration.getAttribute('identifier') === 'SCORE'
  );
  return {
    identifier: item.getAttribute('identifier') ?? '',
    adaptive: booleanAttribute(item, 'adaptive') ?? false,
    timeDependent: booleanAttribute(item, 'time-dependent') ?? false,
    hasCorrectResponse: responseDeclarations.some(hasSomethingToCompareWith),
    hasResponseProcessing: childElement(item, 'qti-response-processing') !== null,
    externalScored: externalScored(score),
    label: item.getAttribute('label'),
    title: item.getAttribute('title') ?? ''
  };
}

function hasSomethingToCompareWith(declaration: XmlElement): boolean {
  if (childElement(declaration, 'qti-correct-response')) return true;
  const mapping = childElement(declaration, 'qti-mapping');
  if (mapping && childElement(mapping, 'qti-map-entry')) return true;
  const areaMapping = childElement(declaration, 'qti-area-mapping');
  return areaMapping !== null && childElement(areaMapping, 'qti-area-map-entry') !== null;
}

function externalScored(declaration: XmlElement | undefined): ItemFacts['externalScored'] {
  const value = declaration?.getAttribute('external-scored')?.trim();
  return value === 'human' || value === 'externalMachine' ? value : null;
}
