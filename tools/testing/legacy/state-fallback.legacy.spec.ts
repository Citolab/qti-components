import normalizeCss from 'modern-normalize/modern-normalize.css?inline';
import { beforeEach, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';

import '@qti-components/interactions';

import itemCss from '@qti-components/theme/item-css';

/**
 * What a browser without `:state()` actually renders.
 *
 * Runs in the `legacy` project (`pnpm run test:legacy`): Chrome 120, whose `CustomStateSet` rejects
 * bare names and whose CSS parser drops any selector list containing `:state()`. There the
 * qti-base shim mirrors states into `data-state`, and the theme only paints through the
 * `[data-state~=…]` arms tools/postcss/custom-state-fallback.mjs writes into it.
 *
 * Every assertion is written for BOTH profiles, keyed on `NATIVE`, so the same file can run in a
 * current Chromium for comparison (`LEGACY_BROWSER=bundled pnpm run test:legacy`). That is also
 * what the contact sheet at the bottom is for: one screenshot per browser, side by side.
 */

const NATIVE = CSS.supports('selector(:state(x))');

type StatefulElement = HTMLElement & { internals?: ElementInternals };

const settle = () => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

const tokenColor = (token: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
};

const applyTheme = () => {
  document.querySelectorAll('style[data-legacy]').forEach(s => s.remove());
  for (const css of [normalizeCss, itemCss]) {
    const style = document.createElement('style');
    style.setAttribute('data-legacy', '');
    style.textContent = css;
    document.head.appendChild(style);
  }
};

const mount = async (html: string) => {
  document.body.innerHTML = `<qti-item-body>${html}</qti-item-body>`;
  await settle();
};

const setState = async (el: StatefulElement, state: string) => {
  el.internals!.states.add(state);
  await settle();
};

/** Bank chips carrying a candidate verdict, one per drag interaction. */
const BANK_CHIPS = [
  {
    name: 'gap-match',
    carrier: '[identifier="winter"]',
    html: `<qti-gap-match-interaction response-identifier="R" style="width:320px">
        <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
        <p>In the <qti-gap identifier="G1"></qti-gap> of discontent.</p>
      </qti-gap-match-interaction>`
  },
  {
    name: 'order',
    carrier: '[identifier="A"]',
    html: `<qti-order-interaction response-identifier="R" style="width:480px">
        <qti-simple-choice identifier="A">Alpha</qti-simple-choice>
      </qti-order-interaction>`
  },
  {
    name: 'associate',
    carrier: '[identifier="A"]',
    html: `<qti-associate-interaction response-identifier="R" max-associations="2" style="width:480px">
        <qti-simple-associable-choice identifier="A" match-max="1">Antonio</qti-simple-associable-choice>
      </qti-associate-interaction>`
  },
  {
    // Its candidate rule shares a selector list with the placed chip's `::part(drag):state(…)`.
    name: 'match',
    carrier: '[identifier="S1"]',
    html: `<qti-match-interaction response-identifier="R" style="width:480px">
        <qti-simple-match-set><qti-simple-associable-choice identifier="S1" match-max="1">S</qti-simple-associable-choice></qti-simple-match-set>
        <qti-simple-match-set><qti-simple-associable-choice identifier="T1" match-max="1">T</qti-simple-associable-choice></qti-simple-match-set>
      </qti-match-interaction>`
  },
  {
    // Same shared list as match.
    name: 'graphic-gap-match',
    carrier: '[identifier="G1"]',
    html: `<qti-graphic-gap-match-interaction response-identifier="R">
        <img slot="image" alt="" width="200" height="120" />
        <qti-gap-text identifier="G1" match-max="1">winter</qti-gap-text>
        <qti-associable-hotspot coords="0,0,60,40" identifier="H1" match-max="1" shape="rect"></qti-associable-hotspot>
      </qti-graphic-gap-match-interaction>`
  }
];

const GAP_MATCH_PLACED = `<qti-gap-match-interaction response-identifier="R" style="width:320px">
    <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
    <p>In the <qti-gap identifier="G1"></qti-gap> of discontent.</p>
  </qti-gap-match-interaction>`;

/** Places `winter` in G1 and returns the chip the gap renders in its shadow, `part="drag"`. */
const placeChip = async () => {
  await mount(GAP_MATCH_PLACED);
  (document.querySelector('qti-gap-match-interaction') as HTMLElement & { response: unknown }).response = ['winter G1'];
  await settle();
  return document.querySelector('qti-gap')!.shadowRoot!.querySelector('[part~="drag"]') as StatefulElement;
};

describe(`custom-state fallback (${NATIVE ? 'native :state()' : 'legacy, shimmed'})`, () => {
  beforeEach(() => applyTheme());

  test('the browser profile is the one this run claims', () => {
    if (!NATIVE) expect(navigator.userAgent, 'the legacy project must run the old Chrome').toMatch(/Chrome\/120\./);
  });

  test('states are mirrored to data-state exactly where :state() is missing', async () => {
    await mount(`<qti-choice-interaction response-identifier="R" max-choices="1">
        <qti-simple-choice identifier="A">Alpha</qti-simple-choice>
      </qti-choice-interaction>`);
    const choice = document.querySelector('qti-simple-choice') as StatefulElement;
    choice.click();
    await settle();

    const mirrored = (choice.getAttribute('data-state') ?? '').split(' ').includes('checked');
    expect(mirrored, 'data-state carries `checked` only when the shim is installed').toBe(!NATIVE);
  });

  test('a checked radio is painted through the fallback arm', async () => {
    await mount(`<qti-choice-interaction response-identifier="R" max-choices="1">
        <qti-simple-choice identifier="A">Alpha</qti-simple-choice>
      </qti-choice-interaction>`);
    const choice = document.querySelector('qti-simple-choice') as StatefulElement;
    choice.click();
    await settle();

    const control = choice.shadowRoot!.querySelector('[part~="control"]') as HTMLElement;
    expect(getComputedStyle(control).backgroundColor).toBe(tokenColor('--qti-primary'));
  });

  test.each(BANK_CHIPS.map(c => [c.name, c] as const))(
    '%s: a bank chip takes its candidate verdict colour',
    async (_name, spec) => {
      for (const [state, token] of [
        ['candidate-correct', '--qti-correct'],
        ['candidate-incorrect', '--qti-incorrect']
      ] as const) {
        await mount(spec.html);
        const chip = document.querySelector(spec.carrier) as StatefulElement;
        await setState(chip, state);

        expect(getComputedStyle(chip).color, `${spec.name} / ${state}`).toBe(tokenColor(token));
      }
    }
  );

  /**
   * The limitation, not a bug pinned in place. `::part(drag):state(candidate-correct)` cannot carry
   * a fallback arm — nothing but plain pseudo-classes may follow `::part()`, and `data-state` sits on
   * the host anyway — so a browser without `:state()` drops it and the placed chip stays unpainted.
   */
  test('a placed chip takes its candidate verdict colour only where :state() is native', async () => {
    const placed = await placeChip();
    expect(placed, 'the gap renders the placed chip as part="drag"').toBeTruthy();
    const before = getComputedStyle(placed).color;
    await setState(placed, 'candidate-correct');

    const painted = getComputedStyle(placed).color === tokenColor('--qti-correct');
    expect(painted, `placed chip colour ${getComputedStyle(placed).color}, was ${before}`).toBe(NATIVE);
  });

  /** Not an assertion: a picture of the cases above, to compare browsers by eye. */
  test('contact sheet', async () => {
    const rows: string[] = [
      `<p><b>${navigator.userAgent.match(/Chrome\/[\d.]+/)?.[0]}</b> — ${NATIVE ? 'native :state()' : 'shimmed'}</p>`,
      `<p>checked radio</p><qti-choice-interaction response-identifier="RC" max-choices="1">
         <qti-simple-choice identifier="A">Alpha</qti-simple-choice></qti-choice-interaction>`,
      ...BANK_CHIPS.map(c => `<p>${c.name} bank chip, candidate-correct</p><div data-case="${c.name}">${c.html}</div>`),
      `<p>gap-match placed chip, candidate-correct</p><div data-case="placed">${GAP_MATCH_PLACED}</div>`
    ];
    document.body.innerHTML = `<qti-item-body style="display:block;width:560px;padding:8px">${rows.join('')}</qti-item-body>`;
    await settle();

    (document.querySelector('qti-simple-choice[identifier="A"]') as HTMLElement).click();
    for (const c of BANK_CHIPS) {
      const chip = document.querySelector(`[data-case="${c.name}"] ${c.carrier}`) as StatefulElement;
      chip.internals!.states.add('candidate-correct');
    }
    const interaction = document.querySelector('[data-case="placed"] qti-gap-match-interaction') as HTMLElement & {
      response: unknown;
    };
    interaction.response = ['winter G1'];
    await settle();
    const placed = interaction.querySelector('qti-gap')!.shadowRoot!.querySelector('[part~="drag"]') as StatefulElement;
    placed.internals!.states.add('candidate-correct');
    await settle();

    const chrome = navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] ?? 'unknown';
    await page.screenshot({
      element: document.querySelector('qti-item-body')!,
      path: `__screenshots__/state-fallback-chrome-${chrome}.png`
    });
  });
});
