import { css } from 'lit';

import { boxSizing, correctionPart } from '@qti-components/base';

export default [
  boxSizing,
  correctionPart,
  css`
    :host {
      display: inline-block;
    }

    /*
   * The QTI presentation class .qti-input-width-N promises room for N characters, so the CSS
   * says exactly that: N times the width of a zero glyph, which is the definition of the ch
   * unit — the same metric the HTML size attribute uses, and the one the conformance suite
   * measures against (see inputCharCapacity in the Q20 stories).
   *
   * This used to be a ladder of sixteen hand-tuned rem values, and they were only approximately
   * N: about 1.1rem per character up to -6, then about 0.8rem per character from -10 up. So the
   * small classes were roughly double what they claimed and the large ones about 1.5x. Worse, a
   * rem is fixed while a character is not, so every theme that changed the input's font silently
   * changed how many characters fit. In ch the promise holds in any font at any size.
   *
   * Two details:
   *
   * content-box is what makes the unit mean anything. Under the border-box reset above, the
   * theme's padding and border would be taken *out* of the N characters, and .qti-input-width-1
   * would leave no room for the one character it names. The input is inside this shadow tree, so
   * it can opt out; a document-level reset never reaches it.
   *
   * The 2px is the caret's column. Without it the final character scrolls out from under the
   * cursor as it is typed. It also keeps clientWidth — which the CSSOM rounds to a whole pixel —
   * from landing a hair under N characters and failing the conformance assertion.
   *
   * Both the width and the content-box are gated on the class being present. An input with no
   * qti-input-width-N keeps the width its theme gives it and stays border-box like everything
   * else; only an input that has been *promised* N characters opts out to guarantee them.
   */
    :host([class*='qti-input-width-']) [part='input'] {
      box-sizing: content-box;
      width: calc(var(--qti-input-width) * 1ch + 2px);
      min-width: calc(var(--qti-input-width) * 1ch + 2px);
    }

    :host(.qti-input-width-1) {
      --qti-input-width: 1;
    }
    :host(.qti-input-width-2) {
      --qti-input-width: 2;
    }
    :host(.qti-input-width-3) {
      --qti-input-width: 3;
    }
    :host(.qti-input-width-4) {
      --qti-input-width: 4;
    }
    :host(.qti-input-width-6) {
      --qti-input-width: 6;
    }
    :host(.qti-input-width-10) {
      --qti-input-width: 10;
    }
    :host(.qti-input-width-15) {
      --qti-input-width: 15;
    }
    :host(.qti-input-width-20) {
      --qti-input-width: 20;
    }
    :host(.qti-input-width-25) {
      --qti-input-width: 25;
    }
    :host(.qti-input-width-30) {
      --qti-input-width: 30;
    }
    :host(.qti-input-width-35) {
      --qti-input-width: 35;
    }
    :host(.qti-input-width-40) {
      --qti-input-width: 40;
    }
    :host(.qti-input-width-45) {
      --qti-input-width: 45;
    }
    :host(.qti-input-width-50) {
      --qti-input-width: 50;
    }
    :host(.qti-input-width-72) {
      --qti-input-width: 72;
    }

    :host {
      position: relative;
      /* Both names, one declaration: anchor-name is not additive, and this rule comes after the
         shared correctionPart fragment, so declaring only --text-entry-host would silently drop the
         correction badge's anchor. */
      anchor-name: --text-entry-host, --qti-correction-anchor;
    }

    /*
   * Correct-response overlay sits ABOVE the host's border, anchored to the
   * host via CSS anchor positioning (position-area: top). Visually
   * decoupled from the host's bordered/colored candidate-correction state —
   * even when both modes are on, the "paris" tag doesn't get the red/green
   * border.
   */
    [part='correct'] {
      position: absolute;
      position-anchor: --text-entry-host;
      position-area: top span-right;
      margin-bottom: 0.25rem;
      padding: var(--qti-padding-vertical) var(--qti-padding-horizontal);
      background-color: var(--qti-bg);
      white-space: nowrap;
    }
  `
];
