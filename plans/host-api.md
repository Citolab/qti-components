# Host API: `<qti-test>` and `<qti-item>`

The main plan for what implementing parties may use, change and rely on. It is written as the
reference page hosts will read; the **Now** column says what exists today, so the gap is the work
(`next`, Next major). When it is built, the text becomes the docs page "Public API" and this file
keeps only the open decisions.

This file holds the design and every decision about it. Which host uses which member, and what each
must do to upgrade, is in [`host-migration/`](host-migration/README.md); the part and state names are
CONTRACT §3.

## The rule

You talk to one element: `<qti-test>` for a test, `<qti-item>` for one item on its own. Both have
the same shape. You set its properties, call its methods and listen to its
events. Everything else is either something you place (`test-container` or `item-container`, the controls and
plugins), something you style (parts, states and `--qc-*` variables), or something you
extend (base classes, transforms, plugins). Anything not on this page may change in a minor.

```html
<qti-test src="/packages/maths/assessment.xml" navigate="item">
  <test-container></test-container>
  <nav><test-prev></test-prev><test-next></test-next></nav>
</qti-test>
```

```js
const test = document.querySelector('qti-test');
test.state = await load(); // resume, before or after the test loads
test.addEventListener('qc-test-state-changed', e => save(e.detail));
```

## What you may and may not do

The contract for implementers, in one table. "May" is supported: it keeps working within a major and
changes only with a migration note. "May not" works today in places but is internal: it can break in
any minor, without notice.

|                  | You may                                                                                                                                                                       | You may not                                                                                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Access**       | `<qti-test>` and `<qti-item>`; the item handle from `item(id)` / `qti-item.item`; `computedContext` and `computedItemContext` from a plugin; the entry points of each package | query our shadow roots; read `internals` or `internals.states` from script; consume `testContext`, `sessionContext`, `configContext` or `qtiContext` as a component; import below an entry point |
| **Call and set** | the properties, attributes and methods on this page; `config` as a whole object                                                                                               | other public-looking members (`getLoadingProgress`, `updateAssessmentItemView`, `_testElement`, …); mutate `state`, `config` or a context object in place                                        |
| **Listen**       | the `qc-*` events on this page, on `<qti-test>` or `<qti-item>`                                                                                                               | `qti-*` and other internal events; `cito-*` after the next major                                                                                                                                 |
| **Send**         | the `qc-*` requests, from a plugin inside `<qti-test>` or `<qti-item>`                                                                                                        | requests from the host page (call the method instead); internal events                                                                                                                           |
| **Style**        | `--qc-*` variables; `::part()` and `:state()` names from CONTRACT §3; unlayered CSS in a container's `<template><style>`                                                      | `--qti-*` variables; our class names or attributes (`.full-correct-response`, `[dragging]`, `data-draggable`, …); our cascade layers; `@mixin`s                                                  |
| **Alter**        | item and test XML through the transform callbacks; which element renders a QTI tag (`extendElementName`); feedback and rubric placement through the cancelable events         | nodes inside our shadow roots: add, remove or rewrite them; attributes we set on our own elements                                                                                                |
| **Add**          | markup next to an interaction or item (in `qc-item-rendered`, `qc-item-answer-key-shown`, `qc-item-correction-shown`); per-item markup with `<template item-ref>`; plugins    | markup inside an interaction; MutationObservers on our DOM (use a hook; if one is missing, that is our bug)                                                                                      |
| **Extend**       | subclass `Interaction`, `QtiFeedback`, a `Qti*Interaction` or `Qti*InteractionCorrection` class, overriding their documented members                                          | override private (`#`) or undocumented members; register your elements under a `qti-` or `qc-` name                                                                                              |

**Parts and states are named by rule** (CONTRACT §3), so a name can be guessed from its meaning: one
name per meaning and one meaning per name; roles are nouns (`chip`, `drop`, `bank`, `choice`,
`control`, `label`, `message`), states are adjectives or participles (`checked`, `full`, `lifted`,
`used`, `drag-over`, `drag-active`); a state is a `:state()` wherever the element has internals and
a part token with the same name only where it cannot; no prefix on parts and states; full words;
every public part and state is documented with `@csspart` / `@cssstate` on its element. Settled
words: `chip` is the item you drag (`drag` is the action); `answer-key` is the key, as state and as
part token; the verdict badge is `::part(correction candidate-correct|candidate-incorrect|candidate-partial)`.

## `<qti-test>` properties and attributes

| Property                        | Attribute                       | Type                                            | What it is                                                                                                                                                                                                                           | Now                                                  |
| ------------------------------- | ------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `src`                           | `src`                           | `string`                                        | URL of the `assessmentTest` XML. Changing it loads another test.                                                                                                                                                                     | on `test-container` as `testURL` / `test-url`        |
| `state`                         | —                               | `QtiTestState \| Promise<QtiTestState \| null>` | The candidate's persistable state, including the shuffle `seed` (`session.seed`). Read it to save; assign it to resume. A promise means "a state is coming": the test waits for it before it starts, and `null` means a first start. | exists; promise and seed in state new (#328)         |
| `navigate`                      | `navigate`                      | `'item' \| 'section'` (default `item`)          | The unit the test pages by. It no longer decides whether the test starts.                                                                                                                                                            | exists; default and no `null` new (#328)             |
| `startAt`                       | `start-at`                      | `string`                                        | The item-ref to start on (a deep link). Wins over the position in `state`.                                                                                                                                                           | new (#328)                                           |
| `view`                          | `view`                          | `View` (`candidate`, `scorer`, …)               | Who looks at the test. Shows the matching `[view]` elements and feedback.                                                                                                                                                            | request event `qc-test-switch-view` only             |
| `config`                        | —                               | `ConfigContext`                                 | All delivery options as one object: a view over the option attributes (see Delivery options).                                                                                                                                        | exists as `configContext`, also on `test-navigation` |
| `qtiContext`                    | —                               | `QtiContext`                                    | Candidate, environment and the shuffle `seed`. Pass the same seed on resume.                                                                                                                                                         | exists; alias on `test-navigation`                   |
| `itemData`                      | —                               | `{ identifier, …fields }[]`                     | Your own per-item fields, merged into each item that plugins and `<test-stamp>` templates read.                                                                                                                                      | on `test-navigation` as `initContext`                |
| `requestTimeout`                | `request-timeout`               | `number` (ms, default 30000)                    | How long an item may take to load before `qc-test-navigation-failed`.                                                                                                                                                                | exists                                               |
| `postLoadTransformCallback`     | —                               | `(transformer, itemRef) => transformer`         | Change each item's XML after it loads, before it renders.                                                                                                                                                                            | exists                                               |
| `postLoadTestTransformCallback` | —                               | `(transformer) => transformer`                  | Same, for the test XML.                                                                                                                                                                                                              | exists                                               |
| `autoScoreItems`                | `auto-score-items`              | `boolean`                                       | Score every answer change, without counting an attempt.                                                                                                                                                                              | attribute on `test-navigation`                       |
| `validationDisplayMode`         | `validation-display-mode`       | `'inline' \| 'native' \| 'both' \| 'none'`      | Where validity messages show (default `inline`).                                                                                                                                                                                     | `config` only                                        |
| `reportValidityAfterScoring`    | `report-validity-after-scoring` | `boolean`                                       | Show validity messages when an attempt ends.                                                                                                                                                                                         | `config` only                                        |
| `disableAtMaxChoices`           | `disable-at-max-choices`        | `boolean`                                       | Disable the other choices once `max-choices` is reached.                                                                                                                                                                             | `config` only, two names                             |
| `allowReorder`                  | `allow-reorder`                 | `'true' \| 'false'`                             | Let placed chips be reordered (default per interaction).                                                                                                                                                                             | `config` only                                        |
| `inlineChoicePrompt`            | `inline-choice-prompt`          | `string`                                        | The inline choice's empty option (default `select`).                                                                                                                                                                                 | `config` only                                        |
| `inlineChoiceAutosize`          | `inline-choice-autosize`        | `'true' \| 'false'`                             | Size an inline choice to its widest option (default `true`).                                                                                                                                                                         | `config` only                                        |
| `infoItemCategory`              | `info-item-category`            | `string`                                        | Items with this category are not numbered as questions.                                                                                                                                                                              | `config` only                                        |

**Start-up.** The test starts once: when the test has loaded and `state` has settled (a promise
has resolved). It starts at `startAt` if set, else at the position in `state`, else at the first
item. `navigateTo` is for moving during the test, not for starting it.

The rows from `autoScoreItems` down are the delivery options: what each means, and how `config`
relates to them, is under Delivery options.

## `<qti-test>` methods

| Method                           | Returns                          | What it does                                                                                                                                  | Now                                                                       |
| -------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `navigateTo(type, id?)`          | `void`                           | Go to an item or section. Linear tests may refuse; listen to `qc-test-navigated` or `-failed`.                                                | exists                                                                    |
| `endAttempt(itemId?)`            | `void`                           | End the attempt on the current (or given) item, as QTI defines it (§2.5): `numAttempts` + 1, response processing, feedback.                   | request event `qc-test-end-attempt` only                                  |
| `submit()`                       | `boolean`                        | Score the test (outcome processing from the declared defaults), then send `qc-test-submitted`.                                                | exists                                                                    |
| `reset(itemId?)`                 | `void`                           | Reset the current (or given) item, as `qti-item.reset()` does: responses, outcomes and attempts back to their defaults; template values stay. | new (#244)                                                                |
| `item(identifier)`               | `QtiAssessmentItem \| undefined` | The rendered item for an item-ref, or `undefined` when it is not rendered.                                                                    | `computedContext.itemElement(identifier)`                                 |
| `setOutcomes(outcomes, itemId?)` | `void`                           | Apply scores from a backend or a human scorer: on the test, or on one item with `itemId`.                                                     | `updateOutcomeVariable`, `updateItemVariables`, item `setOutcomeVariable` |
| `getOutcome(identifier)`         | `OutcomeVariable`                | A test-level outcome.                                                                                                                         | exists                                                                    |
| `showCorrectResponse(show)`      | `void`                           | Show the answer key in every rendered item. Added by `@qti-components/corrections`, on the elements it registers; the core does not know it.  | per item, corrections package                                             |
| `showCandidateCorrection(show)`  | `void`                           | Mark the candidate's answers right or wrong in every rendered item. Added by `@qti-components/corrections`.                                   | per item, corrections package; host event in 7.x                          |

`setOutcomes` takes `[{ identifier, value }]`, the shape `qc-item-outcomes-changed` sends, so a
backend result goes back in unchanged.

### The item you get from `item(id)` (and from `qti-item.item`)

| Member                  | What it is                                                                      | Now                   |
| ----------------------- | ------------------------------------------------------------------------------- | --------------------- |
| `identifier`            | The item's own identifier.                                                      | exists                |
| `refIdentifier`         | The item-ref identifier in the test; differs from `identifier`.                 | `assessmentItemRefId` |
| `disabled`              | Locks the item: no input, no focus.                                             | exists                |
| `readonly`              | Shows the answers, takes no input.                                              | exists                |
| `variables`             | Read or write all variables (review screens show a student's answers this way). | exists                |
| `processResponse()`     | Run response processing now.                                                    | exists (two flags)    |
| `setOutcomes(outcomes)` | Same as on the test, for this item.                                             | `setOutcomeVariable`  |

## `<qti-test>` events you listen to

Every public event reaches `<qti-test>`: item events bubble out of `test-container` and items.
Listen on the test; `detail` is typed in `HTMLElementEventMap`.

| Event                        | When                                                                                     | `detail`                                                 | Cancelable | Now                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------- | --------------------------------------------------- |
| `qc-test-loaded`             | The test XML is parsed; structure and declarations are known.                            | `QtiAssessmentTest`                                      | no         | exists                                              |
| `qc-test-state-changed`      | `state` changed. The one event to persist on.                                            | `QtiTestState`                                           | no         | exists                                              |
| `qc-test-navigation-started` | A navigation began; show a spinner.                                                      | `{ type, id }`                                           | no         | exists                                              |
| `qc-test-navigated`          | A navigation succeeded and its items are rendered.                                       | `{ type, id, items: { identifier, element }[] }`         | no         | exists without `items`; `qc-test-rendered` has them |
| `qc-test-navigation-failed`  | A navigation was refused (linear) or an item did not load.                               | `{ message, itemId?, sectionId?, details? }`             | no         | exists                                              |
| `qc-test-items-skipped`      | A pre-condition or branch rule passed over items.                                        | `{ ids }`                                                | no         | exists                                              |
| `qc-test-end-reached`        | A linear test has no next item.                                                          | `{}`                                                     | no         | exists                                              |
| `qc-test-submitted`          | `submit()` finished; test outcomes are final.                                            | `{}`                                                     | no         | exists                                              |
| `qc-item-rendered`           | An item is in the page. Decorate it here.                                                | `{ item, refIdentifier }`                                | no         | detail is the item only                             |
| `qc-item-response-changed`   | The candidate changed an answer.                                                         | `{ item, responseIdentifier, response }`                 | no         | exists                                              |
| `qc-item-outcomes-changed`   | Scoring applied outcomes, with their final values.                                       | `{ item, outcomes: { identifier, value }[] }`            | no         | exists                                              |
| `qc-item-feedback-show`      | Feedback is about to show. `preventDefault()` keeps it hidden so you can show it.        | `{ kind, identifier, outcomeIdentifier, element, item }` | yes        | `qc-feedback-show`                                  |
| `qc-item-feedback-hidden`    | Feedback that was shown is hidden again.                                                 | same                                                     | no         | `qc-feedback-hide`                                  |
| `qc-item-answer-key-shown`   | The answer key has rendered (`showCorrectResponse`, or after scoring). Decorate it here. | `{ item, elements }`                                     | no         | new                                                 |
| `qc-item-correction-shown`   | The candidate's verdicts have rendered (`showCandidateCorrection`, or after scoring).    | `{ item, elements }`                                     | no         | new                                                 |
| `qc-item-rubric-place`       | A rubric block is about to be placed. `preventDefault()` keeps it where it is.           | `{ className, element }`                                 | yes        | `qc-item-rubric-placement`                          |

**Naming.** `qc-<test|item>-<word>`. A notification is past tense (`navigated`, `hidden`). A
cancelable event that asks before something happens is the plain verb (`feedback-show`,
`rubric-place`). There is nothing else.

**Gone from the host API** (they stay internal or fold into the table above):
`qc-test-rendered` (into `qc-test-navigated`), `qc-item-ref-connected` (into `qc-item-rendered`),
`qc-item-outcome-changed` (one per outcome; use `qc-item-outcomes-changed`), and every `cito-*`
alias after the next major.

## `<qti-test>` events you send

Hosts call methods. Request events are for **plugins**: elements placed anywhere inside `<qti-test>`
that only see the DOM. A plugin dispatches the request on itself; it bubbles to the test.

| Request                       | Method it stands for             | `detail`                |
| ----------------------------- | -------------------------------- | ----------------------- |
| `qc-test-navigate`            | `navigateTo(type, id)`           | `{ type, id }`          |
| `qc-test-end-attempt`         | `endAttempt(itemId?)`            | `{ itemId? }`           |
| `qc-test-submit`              | `submit()`                       | `{}`                    |
| `qc-test-set-outcomes`        | `setOutcomes(outcomes, itemId?)` | `{ outcomes, itemId? }` |
| `qc-test-switch-view`         | `view = …`                       | `View`                  |
| `qc-test-update-plugin-state` | — (plugins only)                 | `{ plugin, value }`     |

`qc-test-update-outcome` and `qc-item-set-outcomes` become `qc-test-set-outcomes`.

## Delivery options

How items and interactions behave: scoring, validation, input limits. The same options exist on
`<qti-test>` and on `<qti-item>`, and the element hands them to everything inside it.

**Attributes are the source of truth.** Each option is an attribute with a camelCase property that
reflects to it, so a value set from script shows in the markup and in devtools. `config` is a view
over them, not a second store:

- **Reading** `config` returns an object built from the current attributes.
- **Assigning** sets the attributes for the keys you pass; a key set to `undefined` removes its
  attribute; keys you leave out keep their value. `config = { autoScoreItems: true }` does not undo
  `validation-display-mode` written in the markup.
- **Items and interactions** read the options through context, built from the attributes. Nothing
  inside reads the attributes directly.

```html
<qti-test src="…" navigate="item" auto-score-items validation-display-mode="none"></qti-test>
```

```js
test.config = { autoScoreItems: true, validationDisplayMode: 'none' }; // the same two attributes
```

| Attribute                       | Property / `config` key      | Values                                   | Default         | What it does                                                                                                                                                                            | Now                                                                                       |
| ------------------------------- | ---------------------------- | ---------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `auto-score-items`              | `autoScoreItems`             | boolean                                  | off             | Run response processing on every answer change (items that are not adaptive and not scored externally). Scoring a change is not an attempt: `numAttempts` does not count it (QTI §2.5). | attribute on `test-navigation`; not on `qti-item`                                         |
| `validation-display-mode`       | `validationDisplayMode`      | `inline` \| `native` \| `both` \| `none` | `inline`        | Where a validity message shows: under the interaction, as the browser's bubble, both, or not at all. Validity is set either way.                                                        | `config` only                                                                             |
| `report-validity-after-scoring` | `reportValidityAfterScoring` | boolean                                  | off             | Show validity messages for every interaction when an attempt ends.                                                                                                                      | `config` only; default differs today (test off, item on)                                  |
| `disable-at-max-choices`        | `disableAtMaxChoices`        | boolean                                  | off             | Disable the remaining choices once `max-choices` is reached.                                                                                                                            | `config` only, as two names (`disableAfterIfMaxChoicesReached`, `disableAfterMaxReached`) |
| `allow-reorder`                 | `allowReorder`               | `true` \| `false`                        | per interaction | Let a placed chip be dragged to another position in an order or sortable interaction.                                                                                                   | `config` only                                                                             |
| `inline-choice-prompt`          | `inlineChoicePrompt`         | text                                     | `select`        | The empty option's label in an inline choice.                                                                                                                                           | `config` only                                                                             |
| `inline-choice-autosize`        | `inlineChoiceAutosize`       | `true` \| `false`                        | `true`          | Size an inline choice to its widest option.                                                                                                                                             | `config` only                                                                             |
| `info-item-category`            | `infoItemCategory`           | category name                            | none            | Items with this category are not numbered as questions. `qti-test` only.                                                                                                                | `config` only                                                                             |

**Booleans that default to on** take `true` or `false` as their value (`inline-choice-autosize="false"`),
because a bare attribute can only switch something on. The others are plain boolean attributes.

**The corrections package adds its own** to its elements, the same way: `correct-response-mode` and
`full-correct-response-only-when-incorrect` (its documentation lists them).

## `<qti-item>`: one item on its own

The same shape as `<qti-test>`, one level down: you talk to `<qti-item>`, you place `item-container`
and the item controls inside it, and every item event reaches it. A host that knows one knows the
other: `src`, `state`, `view`, `config`, `qtiContext`, `endAttempt()`, `setOutcomes()`, `item`,
`qc-…-state-changed` mean the same thing on both.

```html
<qti-item src="/items/fractions-1.xml">
  <item-container></item-container>
  <item-show-correct-response></item-show-correct-response>
</qti-item>
```

```js
const qtiItem = document.querySelector('qti-item');
qtiItem.state = await load();
qtiItem.addEventListener('qc-item-state-changed', e => save(e.detail));
document.querySelector('#check').onclick = () => qtiItem.endAttempt();
```

### `<qti-item>` properties and attributes

| Property                     | Attribute                       | Type                                       | What it is                                                                                                                                 | Now                                              |
| ---------------------------- | ------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `src`                        | `src`                           | `string`                                   | URL of the `assessmentItem` XML. Changing it loads another item.                                                                           | on `item-container` as `itemURL` / `item-url`    |
| `xml`                        | —                               | `string`                                   | The item XML itself, when you have it in hand instead of a URL.                                                                            | on `item-container` as `itemXML`                 |
| `state`                      | —                               | `QtiItemState`                             | The candidate's persistable state of this item: responses, outcomes, template values, attempts. Assign it to resume, before or after load. | new; today `item.variables` on the inner element |
| `view`                       | `view`                          | `View` (`candidate`, `scorer`, …)          | Who looks at the item. Shows the matching `[view]` content, such as a scorer's rubric.                                                     | exists                                           |
| `config`                     | —                               | `ConfigContext`                            | The same view over the same option attributes as on `qti-test` (see Delivery options).                                                     | exists as `configContext`                        |
| `qtiContext`                 | —                               | `QtiContext`                               | Candidate, environment and the shuffle `seed`.                                                                                             | exists                                           |
| `disabled`                   | `disabled`                      | `boolean`                                  | Locks the item: no input, no focus.                                                                                                        | on the inner item only                           |
| `readonly`                   | `readonly`                      | `boolean`                                  | Shows the answers, takes no input.                                                                                                         | on the inner item only                           |
| `postLoadTransformCallback`  | —                               | `(transformer) => transformer`             | Change the item XML after it loads, before it renders.                                                                                     | new; only `qti-test` has it                      |
| `autoScoreItems`             | `auto-score-items`              | `boolean`                                  | Score every answer change, without counting an attempt.                                                                                    | not available on `qti-item`                      |
| `validationDisplayMode`      | `validation-display-mode`       | `'inline' \| 'native' \| 'both' \| 'none'` | Where validity messages show (default `inline`).                                                                                           | `config` only                                    |
| `reportValidityAfterScoring` | `report-validity-after-scoring` | `boolean`                                  | Show validity messages when an attempt ends.                                                                                               | `config` only                                    |
| `disableAtMaxChoices`        | `disable-at-max-choices`        | `boolean`                                  | Disable the other choices once `max-choices` is reached.                                                                                   | `config` only, two names                         |
| `allowReorder`               | `allow-reorder`                 | `'true' \| 'false'`                        | Let placed chips be reordered (default per interaction).                                                                                   | `config` only                                    |
| `inlineChoicePrompt`         | `inline-choice-prompt`          | `string`                                   | The inline choice's empty option (default `select`).                                                                                       | `config` only                                    |
| `inlineChoiceAutosize`       | `inline-choice-autosize`        | `'true' \| 'false'`                        | Size an inline choice to its widest option (default `true`).                                                                               | `config` only                                    |

The rows from `autoScoreItems` down are the delivery options, the same as on `qti-test` (see
Delivery options).

`QtiItemState` is today's `QtiTestStateItem` under a shorter name (`{ identifier, variables, state }`,
variables typed `response` / `outcome` / `template`, `state` the per-interaction state such as a
PCI's). An item stored from a test restores into a `qti-item` and back without conversion.

### `<qti-item>` methods

| Method                          | Returns                          | What it does                                                                                                                     | Now                                                |
| ------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `endAttempt()`                  | `boolean`                        | End the attempt as QTI defines it (§2.5): `numAttempts` + 1, response processing, feedback. `false` without response processing. | `item.processResponse()` on the inner element      |
| `setOutcomes(outcomes)`         | `void`                           | Apply scores from a backend or a human scorer.                                                                                   | `setOutcomeVariable` on the inner element          |
| `getOutcome(identifier)`        | `OutcomeVariable`                | One outcome.                                                                                                                     | on the inner element                               |
| `reset()`                       | `void`                           | Back to the declared defaults: responses, outcomes, attempts. Template values stay.                                              | `resetResponses()` on the inner element            |
| `showCorrectResponse(show)`     | `void`                           | Show the answer key. Added by `@qti-components/corrections`, on the elements it registers; the core does not know it.            | corrections package, inner element                 |
| `showCandidateCorrection(show)` | `void`                           | Mark the candidate's answers right or wrong. Added by `@qti-components/corrections`.                                             | corrections package, inner element                 |
| `item` (getter)                 | `QtiAssessmentItem \| undefined` | The rendered item: the same handle `qti-test.item(id)` returns.                                                                  | reachable only through `item-container.shadowRoot` |

### `<qti-item>` events you listen to

The item events from the `<qti-test>` table, plus the ones a standalone item needs. Inside a test
they reach `<qti-test>`; on their own they reach `<qti-item>`.

| Event                      | When                                                                                     | `detail`                                                 | Cancelable | Now                             |
| -------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------- | ------------------------------- |
| `qc-item-loaded`           | The item XML is parsed; declarations are known.                                          | `{ identifier }`                                         | no         | new                             |
| `qc-item-load-failed`      | The XML could not be loaded or parsed.                                                   | `{ src, message }`                                       | no         | new; today a `console.error`    |
| `qc-item-rendered`         | The item is in the page. Decorate it here.                                               | `{ item, refIdentifier }`                                | no         | exists, detail is the item only |
| `qc-item-state-changed`    | `state` changed. The one event to persist on.                                            | `QtiItemState`                                           | no         | new                             |
| `qc-item-response-changed` | The candidate changed an answer.                                                         | `{ item, responseIdentifier, response }`                 | no         | exists                          |
| `qc-item-attempt-ended`    | `endAttempt()` finished; outcomes are final for this attempt.                            | `{ item, numAttempts, completionStatus }`                | no         | new                             |
| `qc-item-outcomes-changed` | Scoring applied outcomes, with their final values.                                       | `{ item, outcomes }`                                     | no         | exists                          |
| `qc-item-feedback-show`    | Feedback is about to show; `preventDefault()` keeps it hidden.                           | `{ kind, identifier, outcomeIdentifier, element, item }` | yes        | `qc-feedback-show`              |
| `qc-item-feedback-hidden`  | Feedback that was shown is hidden again.                                                 | same                                                     | no         | `qc-feedback-hide`              |
| `qc-item-answer-key-shown` | The answer key has rendered (`showCorrectResponse`, or after scoring). Decorate it here. | `{ item, elements }`                                     | no         | new                             |
| `qc-item-correction-shown` | The candidate's verdicts have rendered (`showCandidateCorrection`, or after scoring).    | `{ item, elements }`                                     | no         | new                             |
| `qc-item-rubric-place`     | A rubric block is about to be placed; `preventDefault()` keeps it.                       | `{ className, element }`                                 | yes        | `qc-item-rubric-placement`      |

`qc-item-loaded`, `qc-item-state-changed` and `qc-item-attempt-ended` are sent inside a test too; there
`qc-test-state-changed` still carries the whole test.

### `<qti-item>` events you send

For item plugins, the controls placed inside `<qti-item>` (`item-show-correct-response`,
`item-show-candidate-correction`, `item-correct-response-mode`). Hosts call the methods.

| Request                             | Method it stands for            | `detail`          | Now                                                                               |
| ----------------------------------- | ------------------------------- | ----------------- | --------------------------------------------------------------------------------- |
| `qc-item-end-attempt`               | `endAttempt()`                  | `{}`              | new                                                                               |
| `qc-item-set-outcomes`              | `setOutcomes(outcomes)`         | `{ outcomes }`    | exists                                                                            |
| `qc-item-switch-view`               | `view = …`                      | `View`            | `item-switch-view` (internal name)                                                |
| `qc-item-show-correct-response`     | `showCorrectResponse(show)`     | `{ show, mode? }` | `item-show-correct-response`, plus `item-switch-correct-response-mode` for `mode` |
| `qc-item-show-candidate-correction` | `showCandidateCorrection(show)` | `{ show }`        | `item-show-candidate-correction`                                                  |

Item plugins read `computedItemContext`, which `<qti-item>` provides; it is not a host property.

## Hooks

A hook is a point where you step into our process: change what we are about to render, stop it and
take over, or decorate what we just rendered. Methods are commands; notifications only report; hooks
are the third kind. Everything on this list is already in the tables above. This chapter groups it.

**Which form a hook takes:**

- It must **return a value** (transformed XML): a callback property.
- It may **stop us**: a cancelable event, named with the plain verb (`feedback-show`).
- It lets you **decorate after we render**: a notification event, past tense (`rendered`, `shown`).
- It **injects markup or CSS**: a `<template>` child.

| Hook                                                       | Kind             | When                                   | What you can do                                                                                 |
| ---------------------------------------------------------- | ---------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `postLoadTestTransformCallback`                            | callback         | the test XML loaded, before render     | Change the test XML.                                                                            |
| `postLoadTransformCallback` (test and item)                | callback         | each item's XML loaded, before render  | Change the item XML; with `extendElementName`, render your own subclass of one of our elements. |
| `qc-item-feedback-show`                                    | cancelable event | feedback is about to show              | Stop it and show the content yourself.                                                          |
| `qc-item-rubric-place`                                     | cancelable event | a rubric block is about to move        | Keep it where it is.                                                                            |
| `qc-item-rendered` (and `qc-test-navigated`'s `items`)     | event            | an item is in the page                 | Decorate or annotate the item, once per render.                                                 |
| `qc-item-answer-key-shown`                                 | event            | the answer key has rendered            | Decorate the answer key: a heading, an icon.                                                    |
| `qc-item-correction-shown`                                 | event            | the candidate's verdicts have rendered | Decorate the verdicts.                                                                          |
| `<template item-ref>` in `qti-test`                        | template         | each item renders                      | Your markup per item.                                                                           |
| `<template><style>` in `test-container` / `item-container` | template         | the container's shadow root is created | Your CSS (see Styling).                                                                         |

Not hooks: `qc-test-state-changed`, `qc-item-response-changed` and `qc-item-outcomes-changed` report
only; the request events are commands from plugins; subclassing `Interaction` or `QtiFeedback` is
Extending. There is deliberately no hook that puts markup inside an interaction's shadow root: what a
host wants there is an input (a `--qc-*` icon, a part, a state) or belongs next to the interaction.

A candidate, not decided: a cancelable `qc-test-navigation-started`, so a host can stop a navigation
("you have unanswered questions"). No surveyed host needs it yet.

### Checked against Kennisnet

Every place Kennisnet patches our DOM today, read from `projects/shared/src/lib/qti` and
`projects/player` (not run), and what replaces it:

| Kennisnet today                                                            | How                                                                                                                           | With this API                                                                                        |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Own CSS for the test                                                       | appends a `<style>` to `test-container`'s shadow root (`player.ts:189-226`)                                                   | `<template><style>` in `test-container`                                                              |
| Modal feedback as a Bootstrap modal                                        | `extendElementName('qti-modal-feedback', 'custom')` and a subclass                                                            | still works; simpler: cancel `qc-item-feedback-show` and open its own modal                          |
| Delivery options                                                           | writes `configContext` once the shadow root exists (`qti-test.ts`)                                                            | attributes on `qti-test`                                                                             |
| Font Awesome drag handle on chips                                          | inserts an `<i>` into each chip (`draggables.ts`)                                                                             | `--qc-icon-drag`; no markup                                                                          |
| Verdict classes and check / cross / minus icons on chips and extended text | reads `internals.states`, adds classes, injects icons (`draggables.ts`, `qti-extended-text-interaction.ts`)                   | style `:state(candidate-correct)` and the other verdict states; icons in `qc-item-correction-shown`  |
| Select-point marker drawn as a pin with a verdict icon                     | one MutationObserver per interaction inside its shadow root (`select-point-interaction.ts`)                                   | `--qc-icon-marker` and `::part(point candidate-correct)`; a pin per verdict needs icon inputs (open) |
| "Juiste antwoord" heading above the answer key                             | inserts an `<h2>` (`response-heading.ts`)                                                                                     | add it in `qc-item-answer-key-shown`                                                                 |
| Usage text next to every select-point interaction                          | inserts a `div.select-point-info` after it (`select-point-interaction.ts:77-85`)                                              | add it in `qc-item-rendered`: the text never changes, so once per render is enough (below)           |
| Re-run all of the above when scoring reveals verdicts                      | an Angular effect on its store plus a timed rescan, because verdicts change states without adding nodes (`test-container.ts`) | gone: `qc-item-answer-key-shown` and `qc-item-correction-shown` say when                             |

With these, Kennisnet's MutationObservers (on `qti-test`, `test-navigation`, `test-container` and each
select-point interaction) can all go. What stays open is the verdict-specific marker icon for select
point.

The usage text, for example:

```js
test.addEventListener('qc-item-rendered', e => {
  e.detail.item.querySelectorAll('qti-select-point-interaction').forEach(addInfoMessage);
});
```

The text lands next to the interaction, in the item's content, never inside our shadow root.

## Placement elements

`test-container` and `item-container` render the test or item in their shadow root. You place them;
you do not talk to them. They keep one property and one slot:

| Member                             | What it is                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `customElementRegistry` (property) | A scoped registry for the shadow root. Set it before the element connects. |
| `<template><style>` (child)        | Your CSS, adopted into the shadow root (see Styling).                      |

## Styling

Three things, nothing else (qti-theme `CONTRACT.md` §8, §3, §11):

1. **`--qc-*` variables** on `:root`, or on any element with `data-qti-theme` for a subtree. The
   tables below are all of them. Each also reads its old `--cito-*` name for one major.
2. **Parts and states** (`::part(…)`, `:state(…)`) for anything a variable does not reach, written
   unlayered.
3. **Where that CSS goes:** in a `<template><style>` inside `test-container` or `item-container`,
   which it adopts into its shadow root.

`--qti-*` variables, class names inside our shadow roots and the theme's layers are not API.

**States of the host elements.** `qti-test` and `qti-item` carry `:state(loading)` while the test
or an item loads, so a loading indicator needs CSS only (#243; replaces the never-set
`navItemLoading` / `navTestLoading`).

**Browser support for `:state()`.** Native from Chrome and Edge 125 and Safari 17.4. Older browsers
get the same names through a shim that mirrors each state into `data-state`, and the theme carries
`[data-state~=…]` fallbacks. A host's own `:state()` rules do not reach those browsers; write the
`[data-state~=…]` arm as well where they matter (#326). Placed drag chips show no verdict colour
there.

### `--qc-*` variables

Set the core groups for a complete brand; the optional ones only when the brand needs that detail.
"light / dark" means the default follows `color-scheme`.

**Surface**

| Variable                  | What it sets                   | Default                 |
| ------------------------- | ------------------------------ | ----------------------- |
| `--qc-color-base-100`     | Background of items and fields | white / near black      |
| `--qc-color-base-content` | Text on that background        | near black / near white |

**Brand**

| Variable                     | What it sets                                  | Default                 |
| ---------------------------- | --------------------------------------------- | ----------------------- |
| `--qc-color-primary`         | Selected choices, primary buttons, focus ring | near black / near white |
| `--qc-color-primary-content` | Text on primary                               | white / near black      |
| `--qc-color-neutral`         | Neutral buttons and controls                  | near black / near white |
| `--qc-color-neutral-content` | Text on neutral                               | white / near black      |
| `--qc-color-chip`            | Background of a drag chip                     | `--qc-color-base-100`   |
| `--qc-color-chip-content`    | Text on a chip                                | inherited               |

**Verdicts**

| Variable             | What it sets                              | Default |
| -------------------- | ----------------------------------------- | ------- |
| `--qc-color-info`    | The answer key                            | blue    |
| `--qc-color-success` | A correct answer                          | green   |
| `--qc-color-warning` | A partly correct answer                   | amber   |
| `--qc-color-error`   | An incorrect answer, a validation message | red     |

**Shape**

| Variable               | What it sets                                             | Default             |
| ---------------------- | -------------------------------------------------------- | ------------------- |
| `--qc-radius-field`    | Corners of fields and buttons                            | `0.2rem`            |
| `--qc-radius-selector` | Corners of chips, checkboxes, hottext and small controls | `--qc-radius-field` |
| `--qc-radius-box`      | Corners of drop zones, banks and panels                  | `--qc-radius-field` |
| `--qc-border-width`    | Every border                                             | `1px`               |
| `--qc-border-style`    | Every border's style (`solid`, `dotted`, …)              | `solid`             |

**Size and rhythm**

| Variable             | What it sets                                            | Default    |
| -------------------- | ------------------------------------------------------- | ---------- |
| `--qc-spacing`       | The spacing unit; gaps and paddings derive from it      | `0.5rem`   |
| `--qc-size-selector` | Checkbox and radio size: the control is four times this | `0.25em`   |
| `--qc-size-field`    | Vertical padding inside inline fields                   | `0.125rem` |
| `--qc-line-height`   | Line height inside fields                               | `1.5`      |

**Type**

| Variable                   | What it sets   | Default            |
| -------------------------- | -------------- | ------------------ |
| `--qc-font-family`         | Reading text   | the page's font    |
| `--qc-font-family-heading` | Headings h1–h6 | `--qc-font-family` |

**Feel**

| Variable      | What it sets                                                       | Default |
| ------------- | ------------------------------------------------------------------ | ------- |
| `--qc-depth`  | Shadow strength, `0` (flat) to `1`                                 | `0`     |
| `--qc-motion` | Animation, `0` (off) to `1`; `prefers-reduced-motion` turns it off | `1`     |

**Optional: edges and focus**

| Variable            | What it sets                   | Default                                |
| ------------------- | ------------------------------ | -------------------------------------- |
| `--qc-color-border` | Every edge in one brand colour | text mixed 45% into the background     |
| `--qc-color-focus`  | The focus ring                 | `--qc-color-primary` if set, else blue |

**Optional: drag and drop**

| Variable                 | What it sets                           | Default                          |
| ------------------------ | -------------------------------------- | -------------------------------- |
| `--qc-color-chip-border` | A chip's edge                          | the component border             |
| `--qc-shadow-chip`       | A chip's shadow at rest                | a line under it, by `--qc-depth` |
| `--qc-icon-drag`         | The drag handle's icon, a `url()` mask | three dots                       |
| `--qc-size-drag-icon`    | The handle's width                     | `0.25em`                         |
| `--qc-color-drag-icon`   | The handle's colour                    | `currentColor`                   |

**Optional: order interaction**

| Variable                          | What it sets                | Default    |
| --------------------------------- | --------------------------- | ---------- |
| `--qc-color-order-placed`         | Background of a placed chip | the chip's |
| `--qc-color-order-placed-content` | Text of a placed chip       | the chip's |
| `--qc-color-order-placed-border`  | Edge of a placed chip       | the chip's |

**Optional: select point**

| Variable             | What it sets                                       | Default   |
| -------------------- | -------------------------------------------------- | --------- |
| `--qc-icon-marker`   | The marker's icon, a `url()`                       | a map pin |
| `--qc-marker-anchor` | Where the icon sits on the point (vertical offset) | `-100%`   |

Plus `color-scheme` (a CSS property, not a variable): every light / dark default follows it.

## Extending

| You want to                           | Use                                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| change item or test XML before render | `postLoadTransformCallback`, `postLoadTestTransformCallback`, `transformer.extendElementName`  |
| write your own interaction            | subclass `Interaction` from `@citolab/qti-components/qti-base` (guide: Extending interactions) |
| replace feedback rendering            | subclass `QtiFeedback`, or cancel `qc-item-feedback-show`                                      |
| add a review or stats view            | subclass a `Qti*Interaction` or `Qti*InteractionCorrection` class                              |
| build a control or panel              | a plugin inside `<qti-test>`: reads `computedContext`, sends the requests above                |
| render a per-item template            | `<template item-ref>` inside `qti-test`                                                        |

`computedContext` is the one context a plugin reads; `qti-test` provides it. `testContext`, `sessionContext`,
`configContext` and `qtiContext` are not API for components; use the properties above.

## Deprecated names

These still work for one major, then go. Each warns once in development.

| Deprecated                                                                                                                                                         | Use instead                                                                                               | Note                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `configContext` (on `qti-test`)                                                                                                                                    | `config`                                                                                                  | Same object; reading either returns the other.                                   |
| `configContext` (on `test-navigation`)                                                                                                                             | `qti-test.config`                                                                                         |                                                                                  |
| `initContext` (on `test-navigation`)                                                                                                                               | `qti-test.itemData`                                                                                       | Same array shape.                                                                |
| `updateOutcomeVariable(identifier, value)`                                                                                                                         | `setOutcomes([{ identifier, value }])`                                                                    | On the test and on the item.                                                     |
| `setOutcomeVariable(identifier, value)`                                                                                                                            | `item.setOutcomes([{ identifier, value }])`                                                               | On the item.                                                                     |
| `qtiContext` (on `test-navigation`)                                                                                                                                | `qti-test.qtiContext`                                                                                     | Already an alias.                                                                |
| `<test-navigation>`                                                                                                                                                | nothing: place children directly in `qti-test`                                                            | An empty wrapper; its properties forward to `qti-test`.                          |
| `test-url` / `testURL` (on `test-container`)                                                                                                                       | `qti-test` `src`                                                                                          |                                                                                  |
| `item-url` / `itemURL` (on `item-container`)                                                                                                                       | `qti-item` `src`                                                                                          |                                                                                  |
| `itemXML` (on `item-container`)                                                                                                                                    | `qti-item` `xml`                                                                                          |                                                                                  |
| `configContext` (on `qti-item`)                                                                                                                                    | `config`                                                                                                  | Same object.                                                                     |
| `computedContext` (property on `qti-item`)                                                                                                                         | —                                                                                                         | Stays as the provider of `computedItemContext` for plugins; not a host property. |
| `processResponse()` (on the inner item)                                                                                                                            | `qti-item.endAttempt()`                                                                                   | The inner item keeps it for `qti-test`.                                          |
| `resetResponses()` (on the inner item)                                                                                                                             | `qti-item.reset()`                                                                                        |                                                                                  |
| `item-switch-view`, `item-show-correct-response`, `item-show-candidate-correction`, `item-switch-correct-response-mode`                                            | the `qc-item-*` requests                                                                                  | Internal names today; handled next to the new ones.                              |
| `auto-score-items` (on `test-navigation`)                                                                                                                          | `auto-score-items` on `qti-test`                                                                          |                                                                                  |
| `disableAfterIfMaxChoicesReached`, `disableAfterMaxReached`                                                                                                        | `disable-at-max-choices` / `disableAtMaxChoices`                                                          | Both keys still accepted in `config`.                                            |
| Old part and state names (`:state(drag)`, `::part(drags)`, `:state(dragging)`, `:state(placeholder)`, `::part(correction-correct)`, `:state(correct-response)`, …) | the CONTRACT §3 names (`chip`, `bank`, `lifted`, `used`, `correction candidate-correct`, `answer-key`, …) | Set next to the new names; the theme reads only the new ones.                    |
| `navigate` unset or `null` to stop the test from starting                                                                                                          | `state` as a promise, or `start-at`                                                                       | `navigate` is the unit only, default `item`.                                     |
| `cito-*` events                                                                                                                                                    | the `qc-*` name                                                                                           | Sent and handled next to the new name.                                           |

`updateItemVariables(itemRefId, variables, state?)` stays as it is for now: it also sets the
item's `state`, which `setOutcomes` does not cover. Decide with the next item-tier change.

## Size

| Surface                  | Today                                            | `<qti-test>`                               | `<qti-item>`               |
| ------------------------ | ------------------------------------------------ | ------------------------------------------ | -------------------------- |
| Elements a host talks to | test: 3, item: 2, plus the inner item            | 1 (+ item handle)                          | 1 (+ item handle)          |
| Properties               | ~14 over the test elements, 6 over the item ones | 10, plus 8 delivery options                | 9, plus 7 delivery options |
| Methods                  | ~12, two names for setting an outcome            | 8 (+ 2 on the item)                        | 7                          |
| Events to listen to      | 18, plus `cito-*` aliases                        | 14                                         | 10 (shared `qc-item-*`)    |
| Requests                 | 7 public, 4 internal item names                  | 6, plugins only                            | 5, plugins only            |
| CSS variables            | 37 `--qc-*`, `--qti-*` reachable                 | 37 `--qc-*` (25 core, 12 optional), shared |                            |

## How this is enforced

- **Imports:** the package `exports` map; nothing below an entry point resolves.
- **Types:** members not on this page are `@internal` and stripped from the published `.d.ts`; an
  API report in CI fails on any change to the surface.
- **Events:** internal events are not `composed`, so they never leave `test-container`'s shadow
  root and cannot be heard from outside. `public-events.spec.ts` fails on an undeclared `qc-` event.
- **Autocomplete:** the custom-elements manifest lists only the members on this page.
- **Deprecations:** `cito-*` aliases and moved properties warn once in development.
- **Contract stories:** every member on this page has a story whose play function fails when the
  member breaks (#240), plus tests that use the library the way each host does (#251).
- **Not enforceable:** a host can still set `--qti-*` and query open shadow roots. This page says it
  is unsupported; closing the shadow roots would break hosts today.

## Decided

- **Folded-in issues** (2026-10-27): `test-navigation` folds into `qti-test` (closes #249); a standalone
  `qti-item` has `state` (closes #236); this plan replaces the public-API review topic (closes #321).
- **`testHostContext` stays internal** (#304): the fold removes `test-navigation`'s use of it.
  `test-container` and `qti-assessment-item-ref` still read the test transform callback and
  `<template item-ref>` from `qti-test` across the shadow root, so the context stays, internal and
  narrowed to those two. They do not move into `config`, which holds only how items behave.
- **The core does not know the corrections package** (#245): `showCorrectResponse`,
  `showCandidateCorrection`, `correct-response-mode` and `full-correct-response-only-when-incorrect`
  are added by `@qti-components/corrections` to the elements it registers.
- **Start-up is explicit** (#328): `state` may be a promise, the seed is in the state, `start-at`
  wins over the stored position, `navigate` defaults to `item` and no longer means "do not start"
  (`null` is deprecated for one major).
- **After-state hooks** (2026-10-27): `qc-item-answer-key-shown` and `qc-item-correction-shown` are
  sent once the answer key or the verdicts have rendered, with the rendered elements in `detail`. A
  host decorates them there (Kennisnet's "Juiste antwoord" heading, its verdict icons) instead of
  observing our DOM. Chosen over a label option, a CSS-only `content`, a template and a promise.
- **Options are attributes; `config` is a view** (2026-10-27): every delivery option is an attribute
  with a reflecting property, on `qti-test` and `qti-item` alike. `config` reads as an object built from
  them and assigning it merges into them (`undefined` removes one). `configContext` is its deprecated
  name. `autoScoreItems` is a delivery option, so it works on `qti-item` too; `infoItemCategory` is a
  `qti-test`-only attribute.
- **Corrections options move to `@qti-components/corrections`** (2026-10-27): `correctResponseMode`
  and `fullCorrectResponseOnlyWhenIncorrect` leave the core `ConfigContext`; the corrections package
  declares them on its own config type and documents them.
- **One disable option** (2026-10-27): `disableAfterIfMaxChoicesReached` and `disableAfterMaxReached`
  become one option, `disableAtMaxChoices`; both old names are deprecated aliases for one major.
- **Names** (2026-10-27): `config`, `itemData` and `setOutcomes` are the API. `configContext`,
  `initContext`, `updateOutcomeVariable` and `setOutcomeVariable` stay as deprecated aliases for one
  major (see Deprecated names).
- **`src`** (2026-10-27): the test URL is `src` on `qti-test`. `test-url` / `testURL` on
  `test-container` stays as a deprecated alias for one major.
- **`<qti-item>` has the shape of `<qti-test>`** (2026-10-27, draft): `src`, `xml`, `state`, `view`,
  `config`, `qtiContext`, `disabled`, `readonly` and the transform callback move onto `qti-item`;
  `item-container` keeps only `customElementRegistry` and the `<template><style>`, like
  `test-container`. `QtiItemState` is the per-item entry of `QtiTestState`.
- **`test-navigation` folds into `qti-test`** (2026-10-27): `qti-test` provides `computedContext` and
  handles `qc-test-end-attempt` and `qc-test-set-outcomes` itself, so a host needs only `qti-test` and
  `test-container`, and plugins work anywhere inside `qti-test`. `<test-navigation>` stays for one
  major as a deprecated wrapper that does nothing; its properties (`configContext`, `initContext`,
  `qtiContext`, `auto-score-items`) forward to `qti-test`. The wrapper listens to nothing, so a host
  that keeps it does not get an attempt ended twice.

  The concerns stay apart inside `qti-test`, as units rather than elements:

  | Unit                                                                   | Owns                                                                                                             | Reads                           | Writes                                      |
  | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------- |
  | Test model (`TestBaseMixin`, `TestProcessingMixin`, `TestStateMixin`)  | `testContext`: responses, outcomes, test outcomes, outcome processing, `state`                                   | the items                       | `testContext`, `sessionContext`             |
  | Navigation (`TestNavigationMixin`)                                     | loading and showing items, `navigate`, sequencing                                                                | `sessionContext`                | which item is shown                         |
  | Session rules (new: `test-navigation`'s body, one mixin or controller) | `computedContext`: item session control, attempts, done, the attempts lock, end-attempt and set-outcome requests | `testContext`, `sessionContext` | `computedContext`, `disabled` on used items |

  The session-rules unit keeps `afterAttemptEnded` and `activeAssessmentItem` as its protected
  extension point; the corrections package's `qti-test` subclass overrides them instead of
  subclassing `TestNavigation`. Its specs run on the unit without the rest of `qti-test`.

  Handler order changes: `test-navigation` was a descendant, so it heard `qc-test-loaded`,
  `qti-assessment-item-connected` and `qti-item-context-updated` before `qti-test`. On one element
  the registration order decides; the session-rules unit registers after the test model, as
  `TestStateMixin` already assumes. The fold is done when the attempts-used and end-attempt specs and
  the linear, sequencing and adaptive stories pass both with and without `<test-navigation>`.

### Carried over from the host survey

Decided before this plan, in the public-API survey, and still in force:

- **The state contract** is `QtiTestState`. Neither main host needs config, view or declarations in
  it; each keeps its own extra fields (pages, frontier, manual scores) next to it.
- **`href` stays out of the state.** It is test structure; read it from `qti-assessment-item-ref`
  (Kennisnet calls its scoring backend with it).
- **Bookmarks live in `state.session`**, as plugin state (`session.plugins`, `<test-bookmark>`).
- **`qti-test-context-updated` stays, deprecated,** until both main hosts persist on `state`.
- **Plugins read one context, `computedContext`,** with `itemElement(identifier)`; `testContext` is
  the host's model of responses and outcomes, not plugin API.
- **Plugins ship inside `@qti-components/test`**, registered with it; no per-plugin packages or entry
  points. `plugin-boundary.spec.ts` fails when the core refers to a plugin or a plugin imports test
  internals. Plugin tags and events do not use `qti-`.
- **Events:** public events carry `qc-` and nothing else does; one module per package declares them
  and augments `HTMLElementEventMap`, and a spec fails on an undeclared `qc-` dispatch. All public
  events bubble and are composed. No `on-` prefix and no `:` in a name. The `cito-*` names are sent
  and handled for one major. (This replaces the survey's decision 13, which still said `cito-`.)
- **A closed item is disabled** (QTI §2.2.1, impl. guide §4.4.2.1): once `max-attempts` is used, the
  test disables the item; the answer stays visible, End Attempt is greyed out. Adaptive items ignore
  `max-attempts`. `auto-score-items` lifts the limit. Stories: `conformance/spec/attempts`.
- **The library adds no observers on the host's behalf;** it offers hooks (see Hooks).

## Open decisions

The order in which this plan is built, and what depends on what, is in [ROADMAP.md](ROADMAP.md).

- **Our options against QTI**: research in [options-against-qti.md](options-against-qti.md).
- **Scoring that follows `submission-mode`** (#299): `auto-score-items` stays until scoring follows
  `submission-mode`, then is deprecated for one major. Research in
  [submission-mode-scoring.md](submission-mode-scoring.md).
- **PeilingLezen** is surveyed by imports only; survey its 7.14 → 9.x gap before it upgrades.

Settled 2026-10-27:

- **Lane:** `next`, after PR #347.
- **Navigation controls** stay in core; a separate package would be too small.
- **Highlights** are out of this plan.
