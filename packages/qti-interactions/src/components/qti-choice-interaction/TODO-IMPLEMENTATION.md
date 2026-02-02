# QTI Choice Interaction - Implementation TODOs

Based on proof-of-concept story tests, the following features need implementation or review.

**Test Summary**: 113 passed, 16 failed (129 total)

---

## 🔴 Priority 1: Validation Message Display

### Issue: `reportValidity()` doesn't display validation messages in UI

**Failing Tests:**

- `Validation Message - Min Choices`
- `Validation Message - Cleared When Valid`
- `Custom Validation Message`
- `Custom Validation Messages via Data Attributes`

**Current Behavior:**

- `reportValidity()` returns `true` even when `min-choices` constraint is not met
- No validation message is rendered in the shadow DOM
- Custom validation messages via `data-min-choices-message` are not used

**Expected Behavior:**

- `reportValidity()` should return `false` when constraints not met
- Should render validation message in `[part="validation-message"]` element
- Should support custom messages via data attributes

**Files to Modify:**

- `packages/qti-base/src/abstract/interaction.ts`
- `packages/qti-interactions/src/mixins/choices/choices.mixin.ts`

**Implementation Notes:**

```typescript
// In validate() or reportValidity():
// 1. Check min-choices constraint
// 2. If invalid, set validity via _internals.setValidity()
// 3. Render message to shadow DOM element
// 4. Support data-min-choices-message attribute
```

---

## 🔴 Priority 2: ElementInternals Validity State

### Issue: Validity state not properly set with constraints

**Failing Tests:**

- `Method: reportValidity()` - returns true instead of false
- `Internals: validity state` - `validity.valid` is true when should be false

**Current Behavior:**

- `_internals.validity.valid` always returns `true`
- `min-choices` constraint doesn't affect validity state

**Expected Behavior:**

- When `min-choices="2"` and only 1 choice selected, `validity.valid` should be `false`
- `validity.valueMissing` or `validity.customError` should be set appropriately

**Implementation Notes:**

```typescript
// Use setValidity() to properly set constraint violations:
this._internals.setValidity(
  { valueMissing: true },
  'Please select at least 2 choices',
  this // anchor element
);
```

---

## 🟡 Priority 3: ARIA State Management

### Issue: `ariaChecked` not initialized on choices

**Failing Tests:**

- `ARIA aria-checked State` - expected `'false'` but got `null`

**Current Behavior:**

- `choice.internals.ariaChecked` is `null` when not selected
- Only set to `'true'` when selected

**Expected Behavior:**

- Should be `'false'` initially for unselected choices
- Should be `'true'` when selected
- Should be `'mixed'` if applicable

**Files to Modify:**

- `packages/qti-interactions/src/components/qti-simple-choice/qti-simple-choice.ts`

---

## 🟡 Priority 4: Individual Choice Disabled Attribute

### Issue: `disabled` attribute on individual choices not working

**Failing Tests:**

- `ARIA aria-disabled State` - `choices.B.disabled` is false when set in HTML
- `Disabled Individual Choice` - choices.A is null (template issue + disabled handling)
- `Keyboard: Disabled Choice Not Focusable` - choices.A is null

**Current Behavior:**

- Setting `disabled` on `<qti-simple-choice disabled>` doesn't work as expected
- Disabled choices may not be properly excluded from tab order

**Expected Behavior:**

- Individual choices should support `disabled` attribute
- Disabled choices should have `tabindex="-1"`
- Disabled choices should not respond to clicks

**Files to Modify:**

- `packages/qti-interactions/src/components/qti-simple-choice/qti-simple-choice.ts`

---

## 🟡 Priority 5: Keyboard Navigation

### Issue: Tab navigation and Space selection not working correctly

**Failing Tests:**

- `Keyboard: Tab Navigation` - focus doesn't move to choices
- `Keyboard: Space to Select` - space key doesn't select

**Current Behavior:**

- Tab from external element doesn't focus first choice
- Space key may not trigger selection

**Expected Behavior:**

- Tab should navigate between choices
- Space/Enter should select focused choice
- Arrow keys for radio group navigation (when max-choices=1)

**Investigation Needed:**

- May be testing library issue with shadow DOM focus
- May need to verify actual keyboard handling in component

---

## 🟡 Priority 6: DOM Mutation Handling

### Issue: Response not cleared when selected choices are removed

**Failing Tests:**

- `Remove Selected Choice` - response still contains 'A' after choice removed
- `Replace All Choices` - old selection persists after innerHTML replacement

**Current Behavior:**

- When a selected choice is removed from DOM, its identifier remains in response
- Form value not updated when choices are removed

**Expected Behavior:**

- When selected choice removed, remove its identifier from response
- Update form value accordingly
- May use MutationObserver or slotchange event

**Files to Modify:**

- `packages/qti-interactions/src/mixins/choices/choices.mixin.ts`

**Implementation Notes:**

```typescript
// On slotchange or mutation:
// 1. Get current choice identifiers
// 2. Filter response to only include existing choices
// 3. Update form value
```

---

## 🟡 Priority 7: Event Detail Structure

### Issue: `qti-interaction-response` event detail structure

**Failing Test:**

- `Event Detail Content` - `detail.responseIdentifier` is undefined

**Current Behavior:**

- Event detail may not include `responseIdentifier` property

**Expected Behavior:**

- Event detail should include:
  ```typescript
  {
    responseIdentifier: string;
    response: string[];
  }
  ```

**Files to Modify:**

- `packages/qti-base/src/abstract/interaction.ts` (event dispatch)

---

## 🟢 Priority 8: Form Value Format

### Issue: Multiple values combined into single string

**Failing Test:**

- `State Preserved After DOM Change` - value is `['A,B']` instead of `['A', 'B']`

**Current Behavior:**

- Multiple selections submitted as `"A,B"` (comma-separated string)

**Expected Behavior:**

- Each selection as separate form value, or
- Document the expected format clearly

**Note:** This may be by design - verify QTI spec requirements.

---

## Test File Reference

All failing tests are in:

- [qti-choice-interaction.validation.stories.ts](./qti-choice-interaction.validation.stories.ts)
- [qti-choice-interaction.a11y.stories.ts](./qti-choice-interaction.a11y.stories.ts)
- [qti-choice-interaction.api.stories.ts](./qti-choice-interaction.api.stories.ts)
- [qti-choice-interaction.behavior.stories.ts](./qti-choice-interaction.behavior.stories.ts)
- [qti-choice-interaction.dom.stories.ts](./qti-choice-interaction.dom.stories.ts)
- [qti-choice-interaction.config.stories.ts](./qti-choice-interaction.config.stories.ts)

---

## Implementation Order Suggestion

1. **Validation & Validity** (Priority 1 & 2) - Core form functionality
2. **ARIA States** (Priority 3) - Accessibility compliance
3. **Disabled Attribute** (Priority 4) - Expected HTML behavior
4. **DOM Mutation** (Priority 6) - Data integrity
5. **Event Detail** (Priority 7) - API consistency
6. **Keyboard** (Priority 5) - May require investigation first
7. **Form Value Format** (Priority 8) - Verify spec first
