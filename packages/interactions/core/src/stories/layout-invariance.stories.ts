import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

import '@qti-components/interactions';

/**
 * Layout-invariance diagnostics — the visible twin of `drag-drop.invariance.spec.ts`.
 *
 * The contract: a chip's border-box is the same size in the bank and once it has been dropped, and
 * filling a dropzone does not resize it. When that breaks the failure is a 2px reflow mid-drag —
 * invisible to VRT (it compares end states) and to conformance (it only sees the response string).
 *
 * Each story renders the live interaction, drops a chip for real (`interaction.handleDrop`), then
 * reads the box-model the theme puts on the chip in each of its two homes — the bank and the drop —
 * and tabulates them side by side. Any row where the two disagree (padding, border, font-weight) is
 * highlighted red: that is where the chip changes size on drop. The verdict is container-independent
 * — it compares the styling, not the rendered width, so a narrow drop slot wrapping the chip can't
 * mask or fake it.
 *
 * Pinned to the Kennisnet substrate (`parameters.styleSubstrate`), the theme the contract is held
 * to; flip the toolbar Style picker to compare. `order` and `associate` are the two known
 * violators; `gap-match` and `match` are the compliant controls.
 */
const meta: Meta = {
  title: 'Diagnostics/Layout Invariance',
  parameters: {
    styleSubstrate: 'kennisnet',
    chromatic: { disableSnapshot: true }
  }
};
export default meta;

type Story = StoryObj;

const settle = (ms = 300) => new Promise(r => setTimeout(r, ms));

type Metrics = {
  padX: string;
  padY: string;
  border: string;
  weight: string;
};

/**
 * Capture the box-model the theme puts on a chip: the padding, border and font-weight that decide
 * its size. Read straight off the real element in each home, so it is container-independent — a live
 * drop slot is often narrower than the bank and would wrap the chip, hiding the real difference
 * behind container width. The invariance contract is that these agree between bank and drop.
 */
const metricsOf = (e: HTMLElement): Metrics => {
  const cs = getComputedStyle(e);
  return {
    padX: `${cs.paddingLeft} / ${cs.paddingRight}`,
    padY: `${cs.paddingTop} / ${cs.paddingBottom}`,
    border: `${cs.borderLeftWidth} / ${cs.borderRightWidth}`,
    weight: cs.fontWeight
  };
};

type Spec = {
  interaction: string;
  chipId: string;
  /** Resolve the drop target from the interaction element. */
  target: (interaction: any) => HTMLElement;
};

/**
 * Build the report DOM: the two overlaid footprints plus a readout. Appended into the story's own
 * `.li-report` slot so it sits directly beneath the live interaction.
 */
const renderReport = (mount: HTMLElement, name: string, bank: Metrics, placed: Metrics) => {
  const row = (label: string, b: string, p: string) => {
    const differ = b !== p;
    return `<tr style="${differ ? 'background:#fef2f2;' : ''}">
      <td style="padding:1px 8px 1px 0; color:#6b7280;">${label}</td>
      <td style="padding:1px 12px 1px 0; color:#15803d;">${b}</td>
      <td style="padding:1px 0; color:${differ ? '#b91c1c' : '#374151'};">${p}${differ ? '  ⟵ differs' : ''}</td>
    </tr>`;
  };

  // The contract, stated container-independently: the bank chip and the placed chip must wear the
  // same box model. If any of padding / border / font-weight differ, the chip's size depends on its
  // home — a resize-on-drop waiting for the wrong content to expose it (the spec pins one at +2px).
  const pass =
    bank.padX === placed.padX &&
    bank.padY === placed.padY &&
    bank.border === placed.border &&
    bank.weight === placed.weight;

  mount.innerHTML = `
    <div style="font:600 0.95rem/1.3 system-ui, sans-serif; margin-bottom:0.35rem;">
      ${name} —
      <span style="color:${pass ? '#15803d' : '#b91c1c'}">${pass ? 'PASS · one box model in both homes' : 'FAIL · bank and placed wear different box models'}</span>
    </div>
    <div style="font:0.75rem/1.4 system-ui; color:#6b7280; margin-bottom:0.6rem; max-width:44rem;">
      A chip must be the same size in the bank and once dropped. These are the box-model properties
      that decide its size, read off the real chip in each home. Any red row is where the two
      disagree — the chip changes size on drop, and the drag bank / sentence reflows around it.
    </div>
    <table style="font:0.78rem/1.6 ui-monospace, monospace; border-collapse:collapse;">
      <thead><tr style="text-align:left; color:#9ca3af;">
        <th style="font-weight:400; padding-right:10px;">property</th>
        <th style="font-weight:600; padding-right:16px; color:#15803d;">bank chip</th>
        <th style="font-weight:600; color:#b91c1c;">placed chip</th>
      </tr></thead>
      <tbody>
        ${row('padding L/R', bank.padX, placed.padX)}
        ${row('padding T/B', bank.padY, placed.padY)}
        ${row('border L/R', bank.border, placed.border)}
        ${row('font-weight', bank.weight, placed.weight)}
      </tbody>
    </table>`;
};

/** Shared render: the live interaction markup, plus an empty slot the play fn fills with the report. */
const withReport = (interactionMarkup: string, note = '') => html`
  <div style="display:flex; flex-direction:column; align-items:flex-start; gap:1.25rem;">
    <div class="li-interaction">${unsafeHTML(interactionMarkup)}</div>
    <hr style="border:none; border-top:1px solid #e5e7eb; margin:0;" />
    <div class="li-report" style="min-height:2rem; color:#9ca3af; font:0.8rem system-ui;">measuring…</div>
    ${note
      ? html`<div
          style="font:0.75rem/1.5 system-ui; color:#92400e; background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:0.5rem 0.7rem; max-width:44rem;"
        >
          ${unsafeHTML(note)}
        </div>`
      : ''}
  </div>
`;

/** The play function: drop the chip, measure both footprints, draw the report. */
const measure =
  (spec: Spec) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await settle(); // let the substrate <link> + fonts settle before the first measurement
    const interaction = canvasElement.querySelector(spec.interaction) as any;
    const report = canvasElement.querySelector('.li-report') as HTMLElement;
    if (!interaction || !report) return;

    const chip = canvasElement.querySelector(`[identifier="${spec.chipId}"]`) as HTMLElement;
    const bank = metricsOf(chip);

    const target = spec.target(interaction);
    interaction.handleDrop(chip, target);
    await settle();

    const placedEl = (interaction.chipsIn(target)?.[0] as HTMLElement) ?? chip;
    const placed = metricsOf(placedEl);

    renderReport(report, spec.interaction.replace('qti-', '').replace('-interaction', ''), bank, placed);
  };

// ── Known violators ─────────────────────────────────────────────────────────

export const Order: Story = {
  name: 'order — KNOWN VIOLATION',
  render: () =>
    withReport(
      `
      <qti-order-interaction response-identifier="R" style="width: 480px">
        <qti-simple-choice identifier="A">Hypothese formuleren</qti-simple-choice>
        <qti-simple-choice identifier="B">Data verzamelen</qti-simple-choice>
      </qti-order-interaction>`,
      `<strong>Order has two faults.</strong> The box model differs (below), <em>and</em> — even once
       that is unified — a placed card stretches to fill its drop slot while the bank card sizes to
       its content, and the drop grows ~2px the moment it is filled. That second, layout-coupling
       fault is what keeps <code>drag-drop.invariance.spec.ts</code> red; it needs the drop to reserve
       the chip's box up front (a component change, like gap-match's <code>--qti-dropzone-min-*</code>),
       not just a CSS nudge. A green table below is necessary but not sufficient for order.`
    ),
  play: measure({
    interaction: 'qti-order-interaction',
    chipId: 'A',
    target: i => i.shadowRoot.querySelector(`[part~='drop']`)
  })
};

export const Associate: Story = {
  name: 'associate — KNOWN VIOLATION',
  render: () =>
    withReport(`
      <qti-associate-interaction response-identifier="R" max-associations="2" style="width: 480px">
        <qti-simple-associable-choice identifier="A" match-max="1">Antonio</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="B" match-max="1">Brutus</qti-simple-associable-choice>
      </qti-associate-interaction>`),
  play: measure({
    interaction: 'qti-associate-interaction',
    chipId: 'A',
    target: i => i.shadowRoot.querySelector(`[part~='drop']`)
  })
};

// ── Compliant controls ──────────────────────────────────────────────────────

export const GapMatch: Story = {
  name: 'gap-match — compliant',
  render: () =>
    withReport(`
      <qti-gap-match-interaction response-identifier="R" style="width: 320px">
        <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
        <qti-gap-text identifier="summer" match-max="1">summer</qti-gap-text>
        <qti-gap-text identifier="autumn" match-max="1">autumn</qti-gap-text>
        <p>
          In the <qti-gap identifier="G1"></qti-gap> of our discontent, made glorious
          <qti-gap identifier="G2"></qti-gap> by this sun of York.
        </p>
      </qti-gap-match-interaction>`),
  play: measure({
    interaction: 'qti-gap-match-interaction',
    chipId: 'winter',
    target: i => i.querySelector('[identifier="G1"]')
  })
};

export const Match: Story = {
  name: 'match — compliant',
  render: () =>
    withReport(`
      <qti-match-interaction response-identifier="R" style="width: 480px">
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="S1" match-max="1">Source one</qti-simple-associable-choice>
        </qti-simple-match-set>
        <qti-simple-match-set>
          <qti-simple-associable-choice identifier="T1" match-max="1">Target one</qti-simple-associable-choice>
        </qti-simple-match-set>
      </qti-match-interaction>`),
  play: measure({
    interaction: 'qti-match-interaction',
    chipId: 'S1',
    target: i => i.querySelector('[identifier="T1"]')
  })
};
