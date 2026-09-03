# @qti-components/processing

## 1.4.0

### Minor Changes

- [#193](https://github.com/Citolab/qti-components/pull/193) [`7c7619c`](https://github.com/Citolab/qti-components/commit/7c7619c4a9ab8e98ec6ab7e5bfcc5475bc32aa3e) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Add `qti-outcome-condition` with its `qti-outcome-if` / `qti-outcome-else-if` / `qti-outcome-else`
  branches.

  `outcomeCondition` is the QTI 3.0 counterpart of `responseCondition` and the element the spec's
  own feedback examples branch on. Without it, an `outcomeProcessing` block that uses one had no
  element to match and its rules never ran.

  The two conditions are structurally identical — a container that walks its branches in order and
  processes the sub-rules of the first one that applies — so that behaviour now lives in a shared
  `QtiConditionBase` / `QtiConditionIfBase` / `QtiConditionElseBase` family that both the response-
  and outcome- elements extend. `qti-response-condition` and its branches keep their existing
  behaviour.

### Patch Changes

- Updated dependencies [[`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9)]:
  - @qti-components/base@2.1.0
