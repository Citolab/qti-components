/**
 * Numeric core: indices of the chosen longest increasing subsequence within a
 * sequence of distinct numbers.
 *
 * Tiebreaker: strict `>` comparisons keep the smallest predecessor index when
 * lengths tie, and the smallest ending index is picked when multiple indices
 * achieve the maximum length. This is equivalent to "the first LIS found when
 * iterating left-to-right".
 */
export function findLongestIncreasingSubsequenceIndices(sequence: number[]): Set<number> {
  if (sequence.length === 0) {
    return new Set();
  }

  const lengthEndingAt: number[] = new Array(sequence.length).fill(1);
  const predecessorIndex: number[] = new Array(sequence.length).fill(-1);

  for (let currentIndex = 0; currentIndex < sequence.length; currentIndex++) {
    for (let previousIndex = 0; previousIndex < currentIndex; previousIndex++) {
      if (
        sequence[previousIndex] < sequence[currentIndex] &&
        lengthEndingAt[previousIndex] + 1 > lengthEndingAt[currentIndex]
      ) {
        lengthEndingAt[currentIndex] = lengthEndingAt[previousIndex] + 1;
        predecessorIndex[currentIndex] = previousIndex;
      }
    }
  }

  let bestEndIndex = 0;
  for (let index = 1; index < sequence.length; index++) {
    if (lengthEndingAt[index] > lengthEndingAt[bestEndIndex]) {
      bestEndIndex = index;
    }
  }

  const resultIndices = new Set<number>();
  for (let index = bestEndIndex; index !== -1; index = predecessorIndex[index]) {
    resultIndices.add(index);
  }

  return resultIndices;
}

/**
 * Domain wrapper: identifiers of candidate-placed choices counted as
 * correctly placed, i.e. the longest run of choices whose relative order
 * matches the correct order.
 *
 * Assumes identifiers are unique within both arrays (guaranteed by QTI).
 * Identifiers not present in `correctOrder` are foreign to the response and
 * are never included in the result.
 */
export function findCorrectlyPlacedIdentifiers(candidateOrder: string[], correctOrder: string[]): Set<string> {
  const rankByIdentifier = new Map<string, number>(correctOrder.map((identifier, position) => [identifier, position]));

  const knownIdentifiers = candidateOrder.filter(identifier => rankByIdentifier.has(identifier));
  const rankSequence = knownIdentifiers.map(identifier => rankByIdentifier.get(identifier));

  const winningIndices = findLongestIncreasingSubsequenceIndices(rankSequence);

  const result = new Set<string>();
  winningIndices.forEach(index => result.add(knownIdentifiers[index]));
  return result;
}
