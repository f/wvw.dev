---
on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches: [master]
    paths: [stores.json]
permissions:
  contents: read
  pull-requests: read
safe-outputs:
  add-comment:
    target: "*"
    max: 1
---

## Fix stores.json Conflicts in Pull Requests

When a new PR is opened or master changes, check all open PRs that modify `stores.json` for merge conflicts and help contributors fix them.

### Context

This repository is a distributed app store (World Vibe Web). Contributors add their store by appending a single entry to the `stores.json` array. Because multiple PRs modify the same file, conflicts are frequent and always follow the same pattern: each PR adds a new line to the JSON array.

### What to do

1. List all open pull requests that modify `stores.json`
2. For each PR, check if it has merge conflicts
3. For conflicting PRs, analyze the conflict:
   - Read the current `stores.json` on master
   - Read the PR's version of `stores.json`
   - Identify which new entries the PR is trying to add (entries not already in master)
4. Leave a comment on the PR with:
   - What entries they're trying to add
   - The exact fixed `stores.json` content they should use (master entries + their new entries)
   - Instructions to update their branch:
     ```
     git fetch upstream
     git rebase upstream/master
     # resolve conflicts using the stores.json content above
     git push --force
     ```
5. If the PR is already mergeable, skip it

### Important rules

- Only analyze conflicts in `stores.json` — ignore other file conflicts
- The merged `stores.json` must be valid JSON: an array of strings
- Never suggest removing existing entries from master's `stores.json`
- Preserve the order: master entries first, then new entries at the end
- Each entry is either a GitHub repo path (e.g. `"owner/repo"`) or a full URL (e.g. `"https://..."`)
