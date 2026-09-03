---
'@qti-components/test': minor
'@qti-components/base': minor
'@qti-components/corrections': minor
'@citolab/qti-components': minor
---

Reveal the solution after an ended attempt when `show-solution` says so.

`test-navigation` settles item doneness on an ended attempt and hands it to a new
`afterAttemptEnded` extension point, alongside the item and its computed-context entry. The hook is
needed because the computed context only catches up on the next update, after the event has finished
bubbling.

`TestNavigationCorrection` overrides it for the standard `qti-item-session-control show-solution`:
an ended attempt marks the candidate's selection, and a done item also reveals the correct answer.
The player takes no opinion of its own — whether marks accumulate across attempts belongs to the
corrections rendering, not to item session control.
