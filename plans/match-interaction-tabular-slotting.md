# Plan: Refactor `qti-match-interaction` tabular mode to slot light-DOM choices

## Goal

In tabular mode (`class="qti-match-tabular"`), reuse the actual `qti-simple-associable-choice` elements from the two `qti-simple-match-set` children as the column header row and first column of the matrix — instead of cloning their `childNodes` into `<th>`/`<td>` cells. Drag-drop mode is untouched. Public API is preserved.

## Architectural decision — monolithic, named-slot attribute routing

The editor (`@qti-editor/prose-qti`) solves the same surface problem with a dual-controller orchestrator (`TabularController` + `DragDropController`) and `shadowRootOptions: { slotAssignment: 'manual' }`. **We are NOT mirroring that architecture.** Reasons:

1. The editor needs manual slot assignment because **ProseMirror writes `slot=""` onto the lightdom** and would clobber default named-slot routing. That problem does not exist at runtime in `@qti-components`.
2. `DragDropSlottedMixin` (still required for drag-drop mode) **writes `slot=""` attributes during drop operations**. Enabling `slotAssignment: 'manual'` on the class would break drag-drop mode. Forking the mixin to use `slot.assign(...)` is out of scope.
3. A full dual-controller split would force us to re-route `response`, `validate`, `toggleInternalCorrectResponse`, `toggleCandidateCorrection`, and the `DragDropSlottedSortableMixin` chain through a controller abstraction the codebase doesn't otherwise use — large diff, no benefit.

**Approach:** keep the single `QtiMatchInteraction` class, keep the mixin chain, keep default (automatic) slot assignment. In tabular mode:

- Write `slot="match-rows"` onto the first `qti-simple-match-set` and `slot="match-cols"` onto the second (light-DOM mutation).
- Render two named slots (`<slot name="match-rows">`, `<slot name="match-cols">`) inside a CSS grid template that places them in column 1 (rows 2..N) and row 1 (columns 2..N).
- Continue rendering the input cells (radio/checkbox) into the grid from `this.sourceChoices × this.targetChoices`, using grid-row/grid-column coordinates — same `part` names and same change-handler wiring as today.
- Use `display: contents` on the slotted match-set so its children participate directly in the grid (mirroring the editor's pattern).
- On exit from tabular mode (class removed), strip the `slot` attributes so the default slot picks them up again for drag-drop mode.

## Phase 0 — Discovery (DONE — captured here)

### Files in scope

- [packages/interactions/match-interaction/src/qti-match-interaction.ts](packages/interactions/match-interaction/src/qti-match-interaction.ts) — the file to refactor
- [packages/interactions/match-interaction/src/qti-match-interaction.styles.ts](packages/interactions/match-interaction/src/qti-match-interaction.styles.ts) — styles to extend
- [packages/interactions/match-interaction/src/qti-match-interaction.stories.ts](packages/interactions/match-interaction/src/qti-match-interaction.stories.ts) — `Tabular`, `TabularAardrijkskunde`, `TabularMultiple` stories (lines 719–914)

### Reference implementation (read-only — for copy/adapt)

- `/Users/patrickklein/Projects/Editor/QTI-Editor/packages/prose-qti/src/components/match/components/qti-match-interaction/match-tabular.ts` — `TabularController.render()` + `tabularStyles` + `routeSlots()`. **This is the source of truth for the grid CSS and template shape.** Adapt, don't copy the controller scaffolding.
- `/Users/patrickklein/Projects/Editor/QTI-Editor/packages/prose-qti/src/components/match/components/qti-match-interaction/match-shared.ts` — useful only for the `getMatchSets(host)` helper shape; otherwise not needed.

### Allowed APIs (verified to exist)

- `Interaction` base from `@qti-components/base`: `response` getter/setter, `responseVariable`, `validate()`, `toggleInternalCorrectResponse(show)`, `toggleCandidateCorrection(show)`.
- `DragDropSlottedMixin`, `DragDropSlottedSortableMixin` from `@qti-components/interactions-core/mixins/drag-drop-observables`.
- Lit: `html`, `nothing`, `@property`, `@state`, `css`.
- Element APIs: `Element.setAttribute('slot', ...)`, `Element.removeAttribute('slot')`, `Element.toggleAttribute()`. **DO NOT call `slot.assign(...)`** — we are not in manual-slot-assignment mode.

### Anti-patterns to avoid

- ❌ Do not set `static shadowRootOptions = { slotAssignment: 'manual' }` — breaks `DragDropSlottedMixin`.
- ❌ Do not introduce a controller class (`TabularController`) — out of scope.
- ❌ Do not call `slot.assign(...)` from anywhere.
- ❌ Do not change the `response` payload shape (`["sourceId targetId", ...]`).
- ❌ Do not change the dispatched event name (`qti-interaction-response`) or detail shape.
- ❌ Do not remove the `correctOptions` `@state` field or the `part` names (`r-header`, `c-header`, `input-cell`, `rb`, `cb`, `rb-checked`, `cb-checked`, `rb-correct`, `rb-incorrect`, `cb-correct`, `cb-incorrect`, `checkmark`, `row`, `table`) — Storybook screenshots and consumer CSS may depend on them. Add new parts; don't drop existing ones unless verified unused.

---

## Phase 1 — Styles: add grid layout for tabular mode

**Where:** [packages/interactions/match-interaction/src/qti-match-interaction.styles.ts](packages/interactions/match-interaction/src/qti-match-interaction.styles.ts)

**Reference:** copy the grid CSS shape from match-tabular.ts `tabularStyles` (the `.grid`, `display: contents` on `::slotted(qti-simple-match-set)`, and `display: contents` on its descendants).

**What to add (append to the existing `css\`...\`` template):**

```css
:host(.qti-match-tabular) [part='grid'] {
  display: grid;
  /* col 1 = row-headers; remaining cols = one per target choice */
  grid-template-columns: minmax(150px, auto) repeat(var(--qti-match-cols, 1), minmax(48px, 1fr));
  /* row 1 = column-headers; remaining rows = one per source choice */
  grid-template-rows: minmax(46px, auto) repeat(var(--qti-match-rows, 1), minmax(46px, auto));
  gap: 0;
}

:host(.qti-match-tabular) slot[name='match-rows'],
:host(.qti-match-tabular) slot[name='match-cols'] {
  display: contents;
}

:host(.qti-match-tabular) ::slotted(qti-simple-match-set[slot='match-rows']),
:host(.qti-match-tabular) ::slotted(qti-simple-match-set[slot='match-cols']) {
  display: contents;
}

/* slot[name='match-rows'] is positioned by the choices having grid-row set inline.
   Choices in match-rows live in column 1; choices in match-cols live in row 1. */
```

**Anti-pattern guard:** do not give `slot:not([hidden])` the default flex layout for the tabular case — the existing rule on line 6–11 applies to drag-drop. Scope the new rules to `:host(.qti-match-tabular)` so drag-drop CSS is untouched.

**Verification:** `grep -n 'display: contents' packages/interactions/match-interaction/src/qti-match-interaction.styles.ts` returns the new rules. `pnpm -F @qti-components/match-interaction build` succeeds (or whichever build script the package uses — check `package.json`).

---

## Phase 2 — Component: refactor render + slot routing

**Where:** [packages/interactions/match-interaction/src/qti-match-interaction.ts](packages/interactions/match-interaction/src/qti-match-interaction.ts)

### 2a. Slot-attribute routing on the two match-set elements

Add a private method that writes/removes `slot` attributes on the two light-DOM match-sets and writes `style="grid-row: N"` / `style="grid-column: N"` inline on each choice element so the grid places them correctly.

Insert in `connectedCallback` after `this.sourceChoices` / `this.targetChoices` are populated, and call again when class changes (see 2c):

```ts
private syncTabularSlotting(): void {
  const isTabular = this.classList.contains('qti-match-tabular');
  const sets = this.querySelectorAll(':scope > qti-simple-match-set');
  const [sourceSet, targetSet] = [sets[0] as HTMLElement | undefined, sets[1] as HTMLElement | undefined];

  if (isTabular) {
    sourceSet?.setAttribute('slot', 'match-rows');
    targetSet?.setAttribute('slot', 'match-cols');
    // Row-headers: column 1, rows 2..N+1
    this.sourceChoices.forEach((c, i) => {
      c.style.gridColumn = '1';
      c.style.gridRow = String(i + 2);
    });
    // Column-headers: row 1, columns 2..M+1
    this.targetChoices.forEach((c, j) => {
      c.style.gridRow = '1';
      c.style.gridColumn = String(j + 2);
    });
    // Drive the grid template via CSS vars
    this.style.setProperty('--qti-match-rows', String(this.sourceChoices.length));
    this.style.setProperty('--qti-match-cols', String(this.targetChoices.length));
  } else {
    // Restore drag-drop mode: drop the slot attrs and inline grid placement.
    sourceSet?.removeAttribute('slot');
    targetSet?.removeAttribute('slot');
    [...this.sourceChoices, ...this.targetChoices].forEach(c => {
      c.style.removeProperty('grid-column');
      c.style.removeProperty('grid-row');
    });
    this.style.removeProperty('--qti-match-rows');
    this.style.removeProperty('--qti-match-cols');
  }
}
```

**Anti-pattern guards:**
- Do not call this before `sourceChoices` / `targetChoices` are populated.
- Do not write inline grid coordinates outside tabular mode — they'd leak into drag-drop layout.
- Do **not** call `slot.assign()` here.

### 2b. New render template — replace the `<table>` branch

Reference: editor's `TabularController.render()`. The structure we want in the shadow DOM is:

```ts
override render() {
  const isTabular = this.class.split(' ').includes('qti-match-tabular');
  const hasCorrectResponse = this.correctOptions !== null;

  return html`
    <slot name="prompt"></slot>
    <slot ?hidden=${isTabular}></slot>

    ${isTabular
      ? html`
          <div part="grid">
            <!-- Row 1, Col 1: empty corner -->
            <div part="corner" style="grid-row: 1; grid-column: 1;"></div>

            <!-- Row 1, Cols 2..M+1: target choices, slotted as-is from lightdom -->
            <slot name="match-cols" part="c-header"></slot>

            <!-- Rows 2..N+1, Col 1: source choices, slotted as-is from lightdom -->
            <slot name="match-rows" part="r-header"></slot>

            <!-- Input cells: rendered per (source, target) pair, placed by grid coords -->
            ${this.sourceChoices.flatMap((row, r) =>
              this.targetChoices.map((col, c) => {
                const rowId = row.getAttribute('identifier');
                const colId = col.getAttribute('identifier');
                const value = `${rowId} ${colId}`;
                const selectedInRowCount =
                  (this.response || []).filter(v => v.split(' ')[0] === rowId).length || 0;
                const checked = this.response?.includes(value) || false;
                const type = row.matchMax === 1 ? 'radio' : 'checkbox';
                const isCorrect = !!this.correctOptions?.find(
                  o => o.source === rowId && o.target === colId
                );
                const part =
                  type === 'radio'
                    ? `rb ${checked ? 'rb-checked' : ''} ${hasCorrectResponse ? (isCorrect ? 'rb-correct' : 'rb-incorrect') : ''}`
                    : `cb ${checked ? 'cb-checked' : ''} ${hasCorrectResponse ? (isCorrect ? 'cb-correct' : 'cb-incorrect') : ''}`;
                const disable =
                  this.correctOptions?.length > 0
                    ? true
                    : row.matchMax === 1
                      ? false
                      : row.matchMax !== 0 && selectedInRowCount >= row.matchMax && !checked;
                return html`
                  <div
                    part="input-cell"
                    style="grid-row: ${r + 2}; grid-column: ${c + 2}; display: flex; align-items: center; justify-content: center;"
                  >
                    <input
                      type=${type}
                      part=${part}
                      name=${rowId}
                      value=${value}
                      .checked=${checked}
                      .disabled=${disable}
                      @change=${(e: { target: any }) => this.handleRadioChange(e)}
                      @click=${(e: { target: HTMLInputElement }) =>
                        row.matchMax === 1 ? this.handleRadioClick(e) : null}
                    />
                    ${type === 'checkbox' && checked
                      ? html`
                          <svg
                            part="checkmark"
                            viewBox="0 0 24 24"
                            style="position: absolute; width: 20px; height: 20px; pointer-events: none;"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
                          </svg>
                        `
                      : ''}
                  </div>
                `;
              })
            )}
          </div>
        `
      : nothing}

    <div role="alert" part="message" id="validation-message"></div>
  `;
}
```

Key differences from the current template:
- The whole `<table>` is replaced by `<div part="grid">`.
- The two `<th>`/`<td>` header loops are replaced by the two named slots, which now host the **real** light-DOM choice elements.
- Input cells use inline `grid-row` / `grid-column` instead of being children of `<tr>`/`<td>`.
- **`.checked` is now bound** on each render (`.checked=${checked}`) — the old `<table>` version omitted this because the table was re-rendered every change. Grid cells could persist across renders, so bind explicitly.

**Anti-pattern guards:**
- Do not drop the `part="r-header"`/`part="c-header"` — they're moved onto the slot elements so consumer CSS can still target them.
- Keep the `<slot name="prompt">` and the default `<slot ?hidden=${isTabular}>` exactly as they are — drag-drop mode still uses the default slot.
- Keep `parts`: `grid` (new), `corner` (new), `r-header`, `c-header`, `input-cell`, `rb`/`cb` + state variants, `checkmark`, `message`. Drop `table`, `row` only if a separate grep confirms they're unused outside this file (see Phase 4 grep checks); otherwise leave a transitional `part="grid table"` and `part="input-cell row"` to keep external CSS working.

### 2c. Invoke `syncTabularSlotting()` at the right moments

In `connectedCallback`, after `sourceChoices`/`targetChoices` are populated:
```ts
this.syncTabularSlotting();
```

Add a `willUpdate` (or override existing) that re-runs `syncTabularSlotting()` when `this.class` changes:

```ts
protected override willUpdate(changed: PropertyValues): void {
  super.willUpdate?.(changed);
  if (changed.has('class')) this.syncTabularSlotting();
}
```

(`class` is already a reactive `@property` on the class — line 31.)

**Anti-pattern guard:** do not call `syncTabularSlotting()` from `render()` — render must be side-effect-free w.r.t. lightdom.

### 2d. Leave the rest alone

- `handleRadioClick`, `handleRadioChange` — unchanged.
- `validate()` — unchanged.
- `toggleInternalCorrectResponse` — unchanged (the tabular branch already only sets `this.correctOptions` and lets the render do the work).
- `toggleCandidateCorrection` — unchanged (operates on lightdom `internals.states`).
- `response` getter/setter branching — unchanged.

**Verification checklist for Phase 2:**
- `grep -n '<table' packages/interactions/match-interaction/src/qti-match-interaction.ts` returns no hits.
- `grep -n 'slot.assign' packages/interactions/match-interaction/src/qti-match-interaction.ts` returns no hits.
- `grep -n 'shadowRootOptions' packages/interactions/match-interaction/src/qti-match-interaction.ts` returns no hits.
- `grep -n 'syncTabularSlotting' packages/interactions/match-interaction/src/qti-match-interaction.ts` returns exactly 3 hits (definition + connect + willUpdate).
- The package typechecks: from repo root, `pnpm -F @qti-components/match-interaction build` (or the equivalent — confirm the script name from the package's `package.json`).

---

## Phase 3 — Verify in Storybook + lightdom round-trip

**Stories to exercise** (from `qti-match-interaction.stories.ts`):

- `Tabular` (lines 719–773) — 4 source × 3 target, `match-max=1`. Radio behavior, single selection per row, click-same-radio deselects.
- `TabularAardrijkskunde` (lines 776–857) — rich content inside choices (nested `<div><p>`). **This is the load-bearing story for slotting** — proves that complex children render correctly when slotted rather than cloned.
- `TabularMultiple` (lines 860–914) — `match-max=2`, checkbox behavior, disable-when-max-reached.

**Manual checks** (run Storybook, open each story):

1. **Headers render the real lightdom**: open devtools, find `qti-simple-match-set[slot="match-rows"]` and confirm its `qti-simple-associable-choice` children appear as the first column. Confirm one set has `slot="match-rows"`, the other has `slot="match-cols"`, and neither is duplicated.
2. **Click a radio in `Tabular`** → state updates, `qti-interaction-response` fires with `detail.response = ["S T"]`.
3. **Click same radio again** → deselects (handleRadioClick path). `response` becomes `[]`.
4. **Toggle to non-tabular variants** in the same Storybook session (use `class=""` controls or a sibling story) — verify drag-drop still works, slot attributes are stripped from match-sets, no leftover `grid-row`/`grid-column` styles on choices.
5. **Show-correct-response**: trigger whatever Storybook control flips `correctResponse` rendering — confirm the `rb-correct` / `rb-incorrect` / `cb-correct` / `cb-incorrect` parts apply to the right cells (i.e., grid placement matches identifier × identifier).
6. **`TabularAardrijkskunde`**: confirm the rich nested HTML in choices renders. (This was the original failure mode of cloneNode — script tags, slotted custom elements, event listeners were lost. Slotting restores them.)
7. **Candidate correction**: invoke `toggleCandidateCorrection(true)` and confirm `:state(candidate-correct)` / `:state(candidate-incorrect)` apply to the choices on lightdom (since we never cloned them, this should now actually be visible in the row-headers too — a free bonus).

**Verification checklist for Phase 3:**
- All three tabular stories render visually correct (a 2D grid, headers come from the lightdom choices).
- No console errors / warnings.
- Drag-drop stories (e.g. the default `Default`/`MatchMaxOne` story) still work — verify slot attributes are absent on match-sets in those stories.

---

## Phase 4 — Final verification + cleanup

1. **Search for external `part` consumers** in the repo:
   ```
   grep -rn 'part(\(table\|row\)' packages/ --include='*.css' --include='*.ts'
   ```
   If any consumer targets `part="table"` or `part="row"`, keep them as transitional aliases on the new `grid` / `input-cell` elements. Otherwise drop.

2. **No regressions in drag-drop mode** — re-run `Default`, `MatchMaxOne`, and any drag-drop story under the `qti-match-interaction.stories.ts` file. Spot-check that `qti-simple-match-set` elements have **no** `slot` attribute in drag-drop mode (open devtools).

3. **Run the package test suite** if one exists:
   ```
   pnpm -F @qti-components/match-interaction test
   ```

4. **Confirm no inventions**: nothing in this diff references `slot.assign`, `slotAssignment: 'manual'`, `TabularController`, `DragDropController`, `emitNodeAttrsChange`, or `qti-prosemirror-node-attrs-change`. Those belong to the editor; they would be hallucinations here.

---

## Open questions to confirm before executing

- **Is `Tabular*` story coverage exercised in CI** (vitest/playwright/storybook test-runner)? If yes, name the script. If no, Phase 3 is manual-only and Phase 4 cannot include automated verification.
- **Are `part="table"` / `part="row"` referenced** by any consumer (e.g., the editor, the player app)? Run the Phase 4.1 grep before deleting them.
- **Does `qti-simple-match-set` have a shadow root** that would block its children from being rendered when its host is slotted? Investigation report says no — but if a regression appears in the Aardrijkskunde story, this is the first thing to re-check.

If any of these surface a blocker, revisit Phase 2 before continuing.
