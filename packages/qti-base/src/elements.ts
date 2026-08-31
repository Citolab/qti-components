/**
 * Custom elements this package registers into an application's registry.
 *
 * Empty, deliberately. `qti-base` is abstractions and context — it contributes no elements to a
 * delivery application.
 *
 * The one entry that used to be here, `qti-config-test-provider`, is gone entirely. It was a
 * TEST-ONLY wrapper that every consumer of `import '@qti-components/base'` registered transitively,
 * and it carried `@customElement(...)` on top of this list — an UNGUARDED `customElements.define()`
 * at module-evaluation time. A module graph holding two copies of this package (a workspace build
 * alongside a published dist, which is what the editor resolves) evaluated it twice and the second
 * threw `NotSupportedError: ... already been used with this registry`, aborting module evaluation
 * and taking down every test file that imported it — 34 suites in the editor, none of which used
 * the element. `register.ts` had the guard right all along; the decorator bypassed it.
 *
 * Config for a single interaction is a property binding now — see config.context.ts.
 *
 * The array and `register.ts` stay so the elements + guarded-register convention the other 30
 * packages follow is already in place the day this package does own an element.
 */
export const qtiBaseElements: readonly { tag: string; ctor: CustomElementConstructor }[] = [];
