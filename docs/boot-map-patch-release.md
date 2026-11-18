# Boot 1.2.2 and Map 0.6.7 Publication

Owner: Stratus package synchronization workspace. Scope: publish existing merged
source changes missing from npm, without new application behavior. Boot 1.2.1
still ships the earlier loader configuration; Map 0.6.6 still ships the obsolete
component `uid` declaration. Increment both patch versions and local lock metadata.

## Review, Build and Publication

1. Merge this metadata PR into `master` after local validation and normal review.
2. Build from that reviewed source with `npm test` (full build, regression suites,
   lint). Pack Boot and Map, preserving normal/minified output and source.
3. Publish the exact verified tarballs interactively with npm authentication:

```sh
npm publish /Users/chadwickmeyer/dev/reports/stratusjs-boot-1.2.2.tgz --access public --registry=https://registry.npmjs.org/
npm publish /Users/chadwickmeyer/dev/reports/stratusjs-map-0.6.7.tgz --access public --registry=https://registry.npmjs.org/
```

An accepted upload may remain unavailable during npm scanning. Do not republish
or increment versions merely because an immediate lookup returns 404. Verify
version, registry integrity and downloaded bytes against the packed artifact
before changing CMS lockfiles. If processing remains unresolved, inspect the npm
publisher account/status and contact npm support; do not bypass review/scanning.

## CMS Handoff

Coordinate with Runtime 0.15.6 and Angular 0.13.16. The CMS workspace owns exact
pins in root and browser-facing manifests, release-appropriate lockfiles,
build/compression, normalizer-path checks and authentication/editor/map acceptance.
Target supported 1.6–1.9 independently, oldest first; do not merge newer releases
backward. Boot requires the published AngularJS Extras normalizers, so verify
both target files in the actual installed dependency graph.

No schema, data migration, credentials, service or worker changes. No deployment
or site deletion is authorized by this document. After separately approved
release deployment, test normal login/vendor OAuth/same-domain sessions, editor
save/reopen and map rendering; stop on regression or missing loader assets.
Rollback uses the previous approved CMS/package artifact set, retaining the
server-side rejection of legacy SSO. Release receipts belong in each CMS central
numbered release checklist. Keep exact publication tarballs in ~/dev/reports
until registry integrity and CMS integration are verified; then remove rebuildable
artifacts. Shared canonical workspaces are not modified.
