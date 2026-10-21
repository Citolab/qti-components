/** Wires a practice test into `root`; see `formative-host.js`. */
export function startFormativeTest(
  root: ParentNode,
  options?: { checksBeforeSolution?: number | null; storageKey?: string; restart?: () => void }
): void;
