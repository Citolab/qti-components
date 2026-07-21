import { allQtiElements } from './all-qti-elements';
import { qtiCorrectionElements } from './elements';

export type CorrectionElementDefinition = {
  tag: string;
  ctor: CustomElementConstructor;
};

/** Creates a complete scoped registry with correction variants replacing standard interactions. */
export function createCorrectionRegistry(extra: readonly CorrectionElementDefinition[] = []): CustomElementRegistry {
  const registry = new CustomElementRegistry();
  const overrides = new Map<string, CustomElementConstructor>(
    qtiCorrectionElements.map(definition => [definition.tag, definition.ctor])
  );

  for (const { tag, ctor } of [...allQtiElements, ...qtiCorrectionElements, ...extra]) {
    if (!registry.get(tag)) {
      registry.define(tag, overrides.get(tag) ?? ctor);
    }
  }

  return registry;
}

/** Shared complete registry used by correction stories and application integrations. */
export const correctionRegistry = createCorrectionRegistry();
