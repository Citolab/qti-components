# Our options against QTI

Roadmap phase 5. Decisions that come out of this go into [host-api.md](host-api.md) (Delivery
options); this file is deleted when the phase ships.

## Goal

The core with no options set behaves as the QTI spec says. Every option is a documented departure:
a docs page (an `.mdx` in `docs/` with `!dev` stories) says what it does, why it exists, and which
host asked for it.

## Starting positions

the spec says; every option is a documented departure, on a docs page that says why it exists.
Starting positions:

| Option                          | QTI says                                                                                | Starting position                                                                     | To find out                                 |
| ------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| `navigate`                      | one item at a time is the delivery's choice; nothing on showing a section               | default `item`; `section` is ours                                                     | none                                        |
| `auto-score-items`              | responses are processed on submit (individual) or at the end of the part (simultaneous) | replaced by scoring that follows `submission-mode`                                    | see below                                   |
| `validation-display-mode`       | too many is invalid at once; too few only matters on submit or end attempt              | the default already times it so; the option only picks how it shows                   | whether `native` and `both` are used        |
| `report-validity-after-scoring` | nothing                                                                                 | may be subsumed by submission-mode scoring                                            | which host sets it, and why                 |
| `disable-at-max-choices`        | the candidate may go over the maximum and is told                                       | off                                                                                   | none                                        |
| `allow-reorder`                 | nothing                                                                                 | Kennisnet's; today it defaults to **on** (`config.context.ts:73`), not off            | which default we want, and whether it stays |
| `inline-choice-prompt`          | the item sets `data-prompt` on the interaction (shared vocabulary)                      | the item's `data-prompt` wins; the option is a host fallback for the default `select` | whether a host fallback is needed at all    |
| `inline-choice-autosize`        | `qti-input-width-*` classes size it                                                     | on; off only for a host's own layout                                                  | who turns it off                            |
| `info-item-category`            | an item-ref's `category`; an item without interactions has nothing to answer            | only `qti-test` reads it                                                              | whether "no interactions" replaces it       |

## Steps

- [ ] Per option: which hosts set it (`plans/host-migration/*.md`, the host sources) and why.
- [ ] Per option: the QTI rule it departs from, with the spec section.
- [ ] Decide keep, change the default, or drop; record it in `host-api.md`.
- [ ] Write the docs page.

## Done when

- Every row above has a decision in `host-api.md` and a section on the docs page.
- The core stories (phase 4) set no option and pass.
