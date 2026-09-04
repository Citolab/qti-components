---
'@qti-components/base': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Gate `atEnd` test feedback behind a `test-show-feedback` button.

This revises the `atEnd` behaviour introduced by the `access` characteristic: matching the
outcome now makes the feedback *available* rather than showing it immediately. It stays hidden
until the candidate navigates to it — a host without a `test-show-feedback` button never shows
`atEnd` feedback at all. `during` feedback is unaffected; it still shows the instant its outcome
matches.

- `SessionContext` gains `navFeedbackIdentifier` — the identifier of the atEnd feedback currently
  on screen, or null otherwise.
- `ComputedContext` gains `availableFeedbacks` (`{ identifier, partId }[]`) — the atEnd feedbacks
  whose end-of-part/end-of-test outcome has matched. `test-navigation` builds this from a new
  `qti-test-feedback-availability-changed` event that `qti-test-feedback` dispatches whenever its
  own availability flips.
- `qti-test-feedback` derives its `atEnd` visibility from navigation: available and the
  candidate's current `navFeedbackIdentifier` matches its own identifier. It withdraws
  availability the moment the candidate moves into a different test part.
- A new `<test-show-feedback>` button enables once a feedback is available for the active
  part (or a test-root feedback), and disables again once the candidate is already viewing it.
  Clicking dispatches a `feedback`-typed `qti-request-navigation`, which `test-navigation.mixin`
  now understands alongside `item` and `section` — it clears the on-screen item and records the
  feedback as shown. Navigating to any item or section afterwards clears
  `navFeedbackIdentifier`, hiding the feedback again.
