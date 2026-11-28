/** The test elements selection and ordering read, by local name (QTI 3, and the 2.x spellings these transforms still accept). */

export const isLocal = (el: Element, ...names: string[]): boolean =>
  names.includes(el.localName) || names.includes(el.localName?.toLowerCase?.());

export const isItemRef = (el: Element): boolean => isLocal(el, 'qti-assessment-item-ref', 'assessmentitemref');

export const isSection = (el: Element): boolean => isLocal(el, 'qti-assessment-section', 'assessmentsection');

export const attrIsTrue = (el: Element, ...names: string[]): boolean =>
  names.some(n => {
    const v = (el.getAttribute(n) ?? '').trim().toLowerCase();
    return v === 'true' || v === '1';
  });

export const attrIsFalse = (el: Element, ...names: string[]): boolean =>
  names.some(n => {
    const v = (el.getAttribute(n) ?? '').trim().toLowerCase();
    return v === 'false' || v === '0';
  });

export const isOrdering = (el: Element): boolean => isLocal(el, 'qti-ordering', 'ordering');

export const isSelection = (el: Element): boolean => isLocal(el, 'qti-selection', 'selection');

export const isSessionControl = (el: Element): boolean => isLocal(el, 'qti-item-session-control', 'itemsessioncontrol');

/** The item-refs and sections directly inside a section: what selection and ordering move. */
export const sectionUnits = (section: Element): Element[] =>
  Array.from(section.children).filter(child => isItemRef(child) || isSection(child));
