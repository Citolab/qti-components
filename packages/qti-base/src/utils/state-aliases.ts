/**
 * The vocabulary of custom states (CONTRACT.md §3 in qti-theme), with the names it replaced.
 *
 * A state is set under the name the contract uses. For one major the old name is set too, so a
 * host that still reads `:state(drag)` keeps working while the theme reads `:state(chip)`. When the
 * alias period ends, empty the table; every call site then sets only the new name.
 *
 * Not in the table, because the old name meant something else on another element:
 * - a drop target's `drag-active` replaced `active` + `enabled`; the interaction host's `drag-active`
 *   replaced `dragzone-active` + `dragzone-enabled`. Each call site names its own old pair.
 * - a drop target's `full` replaced the attribute `disabled`, which stays as an attribute.
 * - `answer-key` replaced `show-correct-response` on an interaction host and `correct-response` on a
 *   choice; the corrections package passes the one that applies.
 */
export const STATE_ALIASES: Readonly<Record<string, readonly string[]>> = {
  chip: ['drag'],
  drop: ['droppable'],
  lifted: ['dragging'],
  used: ['placeholder'],
  'return-target': ['return-anchor'],
  'drag-over': ['hover'],
  'candidate-partial': ['candidate-partially-correct']
};

type StateSet = Pick<Set<string>, 'add' | 'delete' | 'has'>;

/**
 * Set or clear a state and its aliases. `states` may be undefined on an element without internals;
 * then nothing happens, as before.
 */
export function setState(
  states: StateSet | undefined | null,
  name: string,
  on: boolean,
  oldNames?: readonly string[]
): void {
  if (!states) return;
  const names = [name, ...(oldNames ?? STATE_ALIASES[name] ?? [])];
  for (const n of names) {
    if (on) states.add(n);
    else states.delete(n);
  }
}

/** Whether a state is set, under its contract name or an alias. */
export function hasState(states: StateSet | undefined | null, name: string): boolean {
  if (!states) return false;
  if (states.has(name)) return true;
  return (STATE_ALIASES[name] ?? []).some(n => states.has(n));
}
