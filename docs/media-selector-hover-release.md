# Angular media selector hover patch 0.13.10

Release source workspace: `/Users/chadwickmeyer/Sites/stratus-carousel-release`,
branch `fix/idx-exclusive-option`. CMS companion workspace:
`/Users/chadwickmeyer/Sites/Sitetheory-release-audit-latest-20260924`.

The modern selector and adjacent AngularJS library share `.media-selector`.
Unscoped hidden popup defaults disabled pointer input on library popup actions.
Scope these defaults to `.selected-media-item` while retaining the selected
item's own hover behavior. Source fix: `0fec0021`.

Only `@stratusjs/angular` is released as 0.13.10. IDX0.28.10 is already published.
Full `npm test` (build, bundle order, carousel, IDX, editor-defer and lint) passed.
Normal and minified CSS extracted from the packed artifact pass the CMS
`tests/Frontend/media-library-hover.cjs` hybrid popup regression.

Prepared artifact:
`/tmp/stratus-angular-0.13.10-release/stratusjs-angular-0.13.10.tgz`
SHA1: `edc7c3fb6a901b715ab768fff7ae7a986db2d2ed`.
Required bundle/style artifacts and packaged version were verified.

Publish the exact validated archive (interactive npm authentication required):

```sh
npm publish /tmp/stratus-angular-0.13.10-release/stratusjs-angular-0.13.10.tgz --access public
```

After registry propagation, verify the downloaded tarball checksum, update CMS
1.7/latest manifests and registry lockfile, rerun dependency/hover regressions,
and obtain merged CMS release revisions. Pin Server web's core/v/1/7 to the
merged 1.7 commit; use the standard 1.7-only rebuild on dev then web001–005,
one production backend drained at a time. Do not substitute a CSS-only hotfix
for the release's package/bundle rebuild. Package publication and rollout remain
pending; no production services were changed during package preparation.
