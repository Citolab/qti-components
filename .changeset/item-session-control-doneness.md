---
'@qti-components/test': minor
'@qti-components/base': minor
'@qti-components/elements': minor
'@citolab/qti-components': minor
---

Gate linear navigation and further attempts on item doneness.

An item is done once an attempt has ended and either reached the optimal outcome or exhausted its
`max-attempts`. `test-navigation` computes that centrally and publishes `done` and `optimal` on the
computed context.

Optimality is judged from the scored outcome where there is one — `SCORE` having reached `MAXSCORE`,
which handles partial-credit and `qti-mapping` items correctly — and otherwise from an exact match
against the declared `qti-correct-response`. Items with neither (essays, info items) count as done
after one attempt, since there is no optimal value to require.

It is latched only when `processResponse` ends an attempt: `qti-assessment-item` now flags that
context update with `responseProcessed`, so a mid-attempt selection never counts. A restored session
seeds the latch once from the persisted context.

`test-next` in linear/individual mode gates on `done` in place of "any attempt ended", and
`test-end-attempt` is additionally disabled once a non-adaptive item's last ended attempt was
already optimal — there is nothing left to improve.
