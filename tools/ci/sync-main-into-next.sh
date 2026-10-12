#!/usr/bin/env bash
# Merge origin/main into next with a merge commit and push it.
#
# Exit 0   next contains main afterwards: it was already up to date, or the merge was pushed.
# Exit 10  the merge conflicts. Nothing was pushed and the working tree is clean again.
#
# It is a merge commit on purpose, never a squash or a rebase: that keeps main's commits in
# next's ancestry, so the next sync only has to bring in what is new.
#
# Run it from a checkout of next with `origin` set (the workflow does). It retries when next moves
# between the fetch and the push.
set -euo pipefail

attempts=3

for attempt in $(seq 1 "$attempts"); do
  git fetch --quiet origin main next
  git checkout --quiet -B next origin/next

  if git merge-base --is-ancestor origin/main HEAD; then
    echo "next already contains main. Nothing to do."
    exit 0
  fi

  if ! git merge --no-ff --no-edit -m "Merge main into next" origin/main; then
    git merge --abort
    echo "Merging main into next conflicts."
    exit 10
  fi

  if git push --quiet origin HEAD:next; then
    echo "Merged main ($(git rev-parse --short origin/main)) into next and pushed $(git rev-parse --short HEAD)."
    exit 0
  fi

  echo "Push rejected (attempt $attempt of $attempts): next moved. Trying again."
done

echo "Could not push after $attempts attempts."
exit 1
