---
paths:
  - 'packages/**/*.ts'
---

# Lit elements

- **Registration is side-effect free.** A class file exports its class and never defines it; the
  package's `register.ts` / `elements.ts` calls `customElements.define`. No `@customElement`
  decorator in new code (roadmap phase 13 removes the existing ones). Keep the JSDoc
  `@customElement <tag>` tag: the CEM analyzer reads it, not the `define` call.
- **Shared behaviour is a mixin** (see `packages/interactions/core`). ReactiveControllers are not
  used. `@lit/context` carries tree-wide state (test, item, config); not for passing one value to a
  child.
- **Public surface is documented on the class**: a description, every public property and
  attribute, `@fires` for every event, `@csspart` for every part (with its state tokens) and
  `@cssstate` for every `:state()`. A member not in `plans/host-api.md` is `@internal`.
- **Styling hooks are parts and states only** (CONTRACT §3): every styled box in a shadow root has
  a `part`, templates carry no classes, and state is set through `ElementInternals.states`, the same
  on the mouse and keyboard paths.
- **Events** we send are `qc-*`; an internal event is not `composed`. Every `qc-` name is declared
  (`public-events.spec.ts`).
- `#private` fields, no underscore prefixes. Layout styles in the component's `*.styles.ts`,
  semantic paint in `qti-theme` (see `.claude/rules/theme.md`).
