<!-- markdownlint-configure-file
{
  "MD043": {
    "headings": ["# Editor data retry lifecycle patch"]
  }
}
-->

# Editor data retry lifecycle patch

Workspace: `/Users/chadwickmeyer/Sites/stratus-carousel-release`, reused after
its carousel branch was fully merged. Branch: `fix/editor-defer-lifecycle`.

The live-edit editor in the deployed 1.8 runtime repeatedly logged
`[defer] debounced subscriber returned`. Its 250 ms data wait recursively
scheduled timers without a limit, without deduplication, and without teardown.
This shared Stratus implementation also ships with Sitetheory 1.7/latest.
The reported editor's specific missing binding has not yet been reproduced.

The patch retains one timer, stops polling after 30 seconds, emits one timeout
diagnostic, and permits a later model-change event to hydrate normally. Failed
registry binding stops polling immediately. Destruction cancels the timer and
data subscription and removes only this editor's model-change listener.
The existing 1.5 second hydration fallback now requires a completed model and a
live component, so missing data is not treated as successfully loaded content.
No autosave debounce timing or persistence behavior is changed.

Regression coverage uses actual editor methods with a deterministic clock:
overlapping calls, never-loaded data, one timeout diagnostic, recovery after
timeout, loaded empty/nonempty fields, unchanged content, subscriber arrival,
closed subscribers, failed binding, component destruction and listener isolation.
`npm run test:editor-defer` is included in `npm test`.

Release target: `@stratusjs/angular@0.13.9`. Build and pack the exact package, then
publish before updating Sitetheory's root and browser-facing manifests/lockfile
for 1.7 and latest. Local npm authentication initially returned HTTP 401; renewal
requested. Dev-chad 1.8 is owned by another active task: preserve its other code
and test the package patch there before any production rollout. No server files
have been changed by this patch task yet.

Validation completed: `tsc --noEmit`, full `npm test` (build, existing regressions,
new editor lifecycle checks, lint), and `git diff --check` pass.
Package artifact: `/tmp/stratus-editor-release/stratusjs-angular-0.13.9.tgz`.
CMS workspaces have not been changed: `/Users/chadwickmeyer/Sites/Sitetheory-1.7`
is on `1.7` with pre-existing local edits and behind upstream; preserve that work.
The existing clean release-audit CMS workspace remains available for preparing
reviewable dependency PRs without interfering with those edits.
