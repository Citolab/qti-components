import { booleanAttribute, childElement, childElements, integerAttribute } from './xml-node.js';

import type { XmlElement } from './xml-node.js';

/**
 * The structure and the resolved rules of a `qti-assessment-test`, read from its XML once per load.
 * Plain JSON, so a server can build it from the same file.
 *
 * Experimental (0.x): roadmap 1 phase T1; see `plans/test-model.md`.
 */
export interface TestModel {
  identifier: string;
  title: string;
  testParts: TestPartModel[];
}

export interface TestPartModel {
  identifier: string;
  /** Defined on the test part only (QTI 3 XSD); a section never changes it. */
  navigationMode: 'linear' | 'nonlinear';
  submissionMode: 'individual' | 'simultaneous';
  sessionControl: SessionControl;
  sections: SectionModel[];
}

export interface SectionModel {
  kind: 'section';
  identifier: string;
  title: string;
  visible: boolean;
  sessionControl: SessionControl;
  /** The item-refs and sections directly inside this one, in document order, as the XML has them. */
  content: SectionContent[];
}

export interface ItemRefModel {
  kind: 'itemRef';
  identifier: string;
  href: string;
  categories: string[];
  sessionControl: SessionControl;
  /** What this item-ref's own `qti-item-session-control` declares, nothing inherited. */
  declaredSessionControl: Partial<SessionControl>;
}

export type SectionContent = SectionModel | ItemRefModel;

/** `qti-item-session-control`, resolved for one level (QTI 3 info model §7.19). */
export interface SessionControl {
  /** 0 is unlimited. Ignored for adaptive items, which end by `completionStatus`. */
  maxAttempts: number;
  showFeedback: boolean;
  allowReview: boolean;
  showSolution: boolean;
  allowComment: boolean;
  /** Applies only in a test part with individual submission. */
  allowSkipping: boolean;
  /** Applies only in a test part with individual submission. */
  validateResponses: boolean;
}

/**
 * The values when no level declares an attribute: the XSD defaults, and 1 for `max-attempts`,
 * which the spec text gives ("if it is unspecified it is treated as 1 for non-adaptive items").
 */
export const DEFAULT_SESSION_CONTROL: Readonly<SessionControl> = Object.freeze({
  maxAttempts: 1,
  showFeedback: false,
  allowReview: true,
  showSolution: false,
  allowComment: false,
  allowSkipping: true,
  validateResponses: false
});

/**
 * Build the model of a test from its `qti-assessment-test` element: the XML document under Node, the
 * rendered element in the browser. Reads attributes and child elements only, so no element needs
 * to be registered.
 *
 * Session control inherits per attribute: each one comes from the closest level that declares it
 * (item-ref, then each enclosing section, then the test part), and its default only when none does.
 * The spec: a test-part setting applies "unless the setting is overridden", and the defaults "are
 * used only in the absence of any applicable constraint" (implementation guide §4.4.2).
 */
export function buildTestModel(test: XmlElement): TestModel {
  if (test.localName !== 'qti-assessment-test') {
    throw new TypeError(`Expected a qti-assessment-test element, not ${String(test.localName)}.`);
  }
  return {
    identifier: test.getAttribute('identifier') ?? '',
    title: test.getAttribute('title') ?? '',
    testParts: childElements(test, 'qti-test-part').map(buildTestPart)
  };
}

function buildTestPart(part: XmlElement): TestPartModel {
  const sessionControl = resolveSessionControl(DEFAULT_SESSION_CONTROL, part);
  return {
    identifier: part.getAttribute('identifier') ?? '',
    navigationMode: part.getAttribute('navigation-mode') === 'linear' ? 'linear' : 'nonlinear',
    submissionMode: part.getAttribute('submission-mode') === 'simultaneous' ? 'simultaneous' : 'individual',
    sessionControl,
    sections: childElements(part, 'qti-assessment-section').map(section => buildSection(section, sessionControl))
  };
}

function buildSection(section: XmlElement, inherited: SessionControl): SectionModel {
  const sessionControl = resolveSessionControl(inherited, section);
  return {
    kind: 'section',
    identifier: section.getAttribute('identifier') ?? '',
    title: section.getAttribute('title') ?? '',
    visible: booleanAttribute(section, 'visible') ?? true,
    sessionControl,
    content: childElements(section, 'qti-assessment-section', 'qti-assessment-item-ref').map(child =>
      child.localName === 'qti-assessment-section'
        ? buildSection(child, sessionControl)
        : buildItemRef(child, sessionControl)
    )
  };
}

function buildItemRef(itemRef: XmlElement, inherited: SessionControl): ItemRefModel {
  const category = itemRef.getAttribute('category')?.trim();
  return {
    kind: 'itemRef',
    identifier: itemRef.getAttribute('identifier') ?? '',
    href: itemRef.getAttribute('href') ?? '',
    categories: category ? category.split(/\s+/) : [],
    sessionControl: resolveSessionControl(inherited, itemRef),
    declaredSessionControl: declaredSessionControl(itemRef)
  };
}

/** `inherited`, with what `owner`'s own `qti-item-session-control` declares on top. */
function resolveSessionControl(inherited: Readonly<SessionControl>, owner: XmlElement): SessionControl {
  return { ...inherited, ...declaredSessionControl(owner) };
}

/** Only the attributes `owner`'s `qti-item-session-control` declares, so an absent one inherits. */
function declaredSessionControl(owner: XmlElement): Partial<SessionControl> {
  const element = childElement(owner, 'qti-item-session-control');
  if (!element) return {};
  const declared: Partial<SessionControl> = {
    maxAttempts: integerAttribute(element, 'max-attempts'),
    showFeedback: booleanAttribute(element, 'show-feedback'),
    allowReview: booleanAttribute(element, 'allow-review'),
    showSolution: booleanAttribute(element, 'show-solution'),
    allowComment: booleanAttribute(element, 'allow-comment'),
    allowSkipping: booleanAttribute(element, 'allow-skipping'),
    validateResponses: booleanAttribute(element, 'validate-responses')
  };
  return Object.fromEntries(Object.entries(declared).filter(([, value]) => value !== undefined));
}

/** The item-refs directly inside a section, in document order; not those of its subsections. */
export const ownItemRefs = (section: SectionModel): ItemRefModel[] =>
  section.content.filter((child): child is ItemRefModel => child.kind === 'itemRef');

/** Every section, depth first in document order: a section before its subsections. */
export function sectionsInOrder(sections: SectionModel[]): SectionModel[] {
  return sections.flatMap(section => [
    section,
    ...sectionsInOrder(section.content.filter((child): child is SectionModel => child.kind === 'section'))
  ]);
}

/** Every item-ref inside the given sections, at any depth, in document order. */
export function itemRefsInOrder(sections: SectionContent[]): ItemRefModel[] {
  return sections.flatMap(child => (child.kind === 'itemRef' ? [child] : itemRefsInOrder(child.content)));
}
