/** Helpers shared by more than one correction interaction. */

/** A choice element that can carry a per-candidate correction verdict. */
export type CorrectableChoice = HTMLElement & {
  identifier: string;
  candidateCorrection: 'correct' | 'incorrect' | 'partially-correct' | null;
};

/** Splits a `"source target"` correct-response into its pairs. */
export const parsePairs = (response: Readonly<string | string[] | null>): Array<{ source: string; target: string }> => {
  if (!response) return [];
  const entries = Array.isArray(response) ? response : [response];
  return entries.map(entry => {
    const [source, target] = entry.split(' ');
    return { source, target };
  });
};
