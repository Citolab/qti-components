import { css } from 'lit';

/**
 * The candidate-correction badge shared by correction-package elements.
 *
 * The component decides where the badge sits in the markup — last, after the label — and how big
 * its box is. It decides nothing about how it looks. The disc, the tick, the cross, and whether it
 * is lifted out of flow at all are the theme's, keyed on ::part(correction-correct) /
 * ::part(correction-incorrect).
 *
 * It replaces six implementations of one idea: four ::after glyph blocks in kennisnet, an
 * ::before/::after pair in order-interaction, and a .correct-option span that gap-match and match
 * built in JavaScript with inline styles. Several of those set margin-left and width inside a
 * :state(candidate-*) rule — a transient state doing layout, which is the bug this contract exists
 * to prevent.
 *
 * Reachable everywhere. A chip has three homes, and inside a drop target's shadow root the document
 * cannot see its badge: parts do not chain, so ::part(drag)::part(correction) is inert. A part
 * token survives exportparts, so one bare ::part(correction-correct) reaches the badge in the drag
 * bank, on the floating clone, and inside a gap. Verified in Chromium.
 *
 * Deliberately not anchored, and not absolutely positioned. Both were tried; both left
 * qti-choice-interaction unable to reach layout stability, and the VRT stability detector spent 20
 * seconds waiting before capturing a half-settled frame. A theme that wants a corner badge can
 * position ::part(correction-correct) itself — it is a part, that is the point.
 */
export const correctionPart = css`
  /* Nothing at all until the item judges this element. */
  [part~='correction'] {
    display: none;
  }

  [part~='correction-correct'],
  [part~='correction-incorrect'],
  [part~='correction-partially-correct'] {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    box-sizing: border-box;
    width: var(--qti-correction-size, 1em);
    height: var(--qti-correction-size, 1em);
    margin-left: var(--qti-correction-gap, 0.4em);

    pointer-events: none;
  }
`;
