---
'@qti-components/base': minor
'@qti-components/elements': minor
'@citolab/qti-components': minor
---

Interactions, feedback and `readonly` now follow the item context instead of being pushed to by the item. The public members are unchanged, and the timing was kept on purpose: `item.variables = …` shows the values in rendered interactions straight away, and `setOutcomeVariable` / `processResponse` leave `showStatus` correct when they return. This is covered by this repo's own stories and specs. It has not been run against a host application, so hosts should check the flows below before upgrading.

What changes:

- An interaction adopts the item's value for its response when that value changes to something other than what the interaction last published. A score or timer updating, or the candidate's own answer coming back, does not rewrite it. An interaction that registers after the variables were set now picks them up, and an unanswered item no longer overwrites a `response` attribute on the interaction.
- `QtiFeedback` decides its own `showStatus` from the item context. `checkShowFeedback()` stays public. The `qti-register-feedback` event is no longer sent. Nothing in this repo or in the host code we looked at listened to it, but a listener would now hear nothing.
- Feedback is only decided when its outcome changed or an attempt was made. The one visible difference: restoring variables equal to the declared defaults, on an item with no attempt yet, no longer switches on a `show-hide="hide"` modal feedback (it used to open on a restore of nothing). Block and inline feedback decide when they connect and are unchanged. A custom feedback that extends `QtiFeedback` directly behaves like the modal.
- `readonly` on `qti-assessment-item` is published in the item context (`ItemContext.readonly`) and the interactions follow it. A `readonly` attribute present from the start now applies; before, only a change after the first render did.

To check in a host:

- Review or replay screens that assign `item.variables` or `item.responses` and read the interactions right after.
- Code that sets an outcome and reads or patches the feedback straight after, including observers on the feedback's DOM.
- Custom interactions whose `response` setter is not safe to call again with the same value. The base class calls it when the item's value changes and the interaction did not publish that value itself.
- Custom feedback that reached into `QtiFeedback`'s private `_context`. It is now a read-only getter.
