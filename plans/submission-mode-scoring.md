# Scoring that follows `submission-mode`

Roadmap phase 7 (#299). Decisions go into [host-api.md](host-api.md); this file is deleted when
the phase ships.

## The problem

QTI (impl. guide §4.1): in a simultaneous part responses are processed when the part ends, so "the candidate can take one and
only one attempt at each item and feedback cannot be seen during the test". A browser cannot
process every item at the end, because only the shown items are rendered, so the proposal is to
process an item when the candidate leaves it, which is earlier than QTI says.

Before deciding:

- the processing on leave must not count an attempt, change `completionStatus`, lock the item
  (`attempts-used.spec` already asserts no lock in a simultaneous part) or render feedback;
- whether reporting validity on leave contradicts the shipped timing ("too few only after a
  submit");
- adaptive items and feedback in a simultaneous part: read impl. guide §3.7.2 and §4.4 before
  stating that they are not allowed there;
- a backend can process all items at the end; the docs page says so.

## Proposal (not decided)

- In a simultaneous part, process an item's responses when the candidate leaves it, and report
  validity then (what `report-validity-after-scoring` does today).
- In an individual part, process on submit or end attempt, as QTI says.
- `auto-score-items` is deprecated for one major once this ships.

## Steps

- [ ] Read impl. guide §3.7.2 and §4.4 (adaptive items, sections) and record what they say.
- [ ] Decide whether processing on leave is acceptable, with that evidence (it is earlier than QTI).
- [ ] Decide the validity timing on leave against the shipped "too few only after a submit".
- [ ] Specs: no attempt counted, `completionStatus` unchanged, no lock, no feedback rendered.
- [ ] Docs page section: what we do in the browser and what a backend can do at the end of the part.

## Done when

- The specs above pass, and `auto-score-items` is deprecated with a host-migration entry per host
  that sets it.
