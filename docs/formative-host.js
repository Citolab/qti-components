/**
 * A practice test made from a plain test package. The package has no session control; this script is
 * the session control: the candidate checks each answer, may change it and check again, and moves on
 * once the item is checked. The marks come from the corrections build.
 */

const MESSAGES = {
  correct: 'Well done! Your answer is completely right.',
  partial: 'Your answer is not completely right yet. Change it and try to find the right answer.',
  incorrect: 'Your answer is not right. Change it and try again.',
  solution: 'This is the right answer.'
};

/**
 * @param {ParentNode} root the element that holds the test and its controls
 * @param {object} [options]
 * @param {number | null} [options.checksBeforeSolution] checks before the correct response shows and the
 *   item locks, so the candidate can go on; `null` (the default): check as often as you like
 * @param {string} [options.storageKey] where the session is saved
 * @param {() => void} [options.restart] what "Start again" does after the saved session is cleared
 */
export function startFormativeTest(
  root,
  { checksBeforeSolution = null, storageKey = 'formative-test', restart = () => location.reload() } = {}
) {
  const test = root.querySelector('qti-test');
  const navigation = root.querySelector('test-navigation');
  const part = name => root.querySelector(`[data-${name}]`);

  // Resume: the saved state goes in before the test loads, so it opens where the candidate left off.
  const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');
  let state = saved?.state;
  let finished = saved?.finished ?? false;
  const changed = new Set(saved?.changed); // items whose answer changed after their last check
  if (state) test.state = state;

  let itemIds = [];
  let item; // the item on screen

  const save = () => sessionStorage.setItem(storageKey, JSON.stringify({ state, finished, changed: [...changed] }));
  const current = () => state?.session.navItemRefId ?? itemIds[0];
  const value = (id, name) =>
    state?.test.items.find(entry => entry.identifier === id)?.variables.find(v => v.identifier === name)?.value;
  const score = id => Number(value(id, 'SCORE') ?? 0);
  const maxScore = id => Number(value(id, 'MAXSCORE') ?? 1);
  const checks = id => Number(value(id, 'numAttempts') ?? 0);
  const verdict = id => (score(id) >= maxScore(id) ? 'correct' : score(id) > 0 ? 'partial' : 'incorrect');
  const checked = id => checks(id) > 0 && !changed.has(id);
  const solutionShown = id =>
    checksBeforeSolution !== null && checks(id) >= checksBeforeSolution && verdict(id) !== 'correct';

  const render = () => {
    if (!itemIds.length) return; // the test has not loaded yet
    const id = current();
    const index = itemIds.indexOf(id);
    const last = index === itemIds.length - 1;

    part('progress').textContent = finished
      ? `Score: ${itemIds.reduce((sum, i) => sum + score(i), 0)} of ${itemIds.reduce((sum, i) => sum + maxScore(i), 0)}`
      : `Question ${index + 1} of ${itemIds.length}`;

    const feedback = part('feedback');
    feedback.textContent =
      finished || !checked(id) ? '' : solutionShown(id) ? MESSAGES.solution : MESSAGES[verdict(id)];
    feedback.dataset.verdict = feedback.textContent ? (solutionShown(id) ? 'solution' : verdict(id)) : '';

    part('check').hidden = finished || solutionShown(id) || (checked(id) && verdict(id) === 'correct');
    part('previous').disabled = index <= 0;
    part('next').textContent = last && !finished ? 'Finish' : 'Next';
    part('next').disabled = finished ? last : !(checked(id) || solutionShown(id));

    // The marks: the candidate's answer once checked, the correct response once the test is finished or
    // the checks ran out. Then the item is locked.
    if (item) {
      item.showCandidateCorrection(finished || checked(id));
      item.showCorrectResponse(finished || solutionShown(id));
      item.disabled = finished || solutionShown(id);
    }
  };

  test.addEventListener('qc-test-loaded', event => {
    itemIds = [...event.detail.querySelectorAll('qti-assessment-item-ref')].map(ref => ref.identifier);
    render();
  });
  test.addEventListener('qc-test-state-changed', event => {
    state = event.detail;
    save();
    render();
  });
  test.addEventListener('qti-assessment-item-connected', event => {
    item = event.detail;
    render();
  });
  test.addEventListener('qc-item-response-changed', () => {
    if (checks(current()) === 0) return;
    changed.add(current());
    save();
    render();
  });

  part('check').addEventListener('click', () => {
    changed.delete(current());
    // Ends the attempt: the item is scored and its numAttempts goes up, which arrives as a state change.
    navigation.dispatchEvent(new CustomEvent('qc-test-end-attempt', { bubbles: true, composed: true }));
  });
  part('previous').addEventListener('click', () => test.navigateTo('item', itemIds[itemIds.indexOf(current()) - 1]));
  part('next').addEventListener('click', () => {
    const index = itemIds.indexOf(current());
    if (index === itemIds.length - 1) {
      finished = true;
      save();
      render();
    } else {
      test.navigateTo('item', itemIds[index + 1]);
    }
  });
  part('restart').addEventListener('click', () => {
    sessionStorage.removeItem(storageKey);
    restart();
  });
}
