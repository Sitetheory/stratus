# Native editor images for Sitetheory 1.9

Owner: image-loading task, companion to Sitetheory/Sitetheory#3762.
Workspace: /Users/chadwickmeyer/Sites/stratus, reused idle canonical checkout.
Branch: feature/native-editor-images; canonical return branch: master.
Origin: chadwickmeyer/stratus; upstream target: Sitetheory/Stratus master.
Recovery/build logs: /Users/chadwickmeyer/dev/task-archives/sitetheory-image-loading-audit.

## Contract

The host opts in via window.sitetheoryNativeImagePlaceholder === true, set by
Sitetheory 1.9's loaded native adapter. Other hosts retain legacy insertion and
normalization. Newly selected library images carry real src, bounded srcset,
sizes, lazy loading, async decoding, intrinsic dimensions and the appearance
marker. The fallback is the original file, matching the host adapter's one-retry
contract. GIF/SVG and provider/external URLs remain single-source. Derivatives
require an internal prefix, no service, a supported raster extension and known
original dimensions. No metadata is inferred from arbitrary URLs.

Froala explicitly allows loading and decoding. Native HTML retains its sources
through normalizeIn/normalizeOut, even if reopened on a host without the flag.
A source marker detects URL replacement and removes stale candidates. Runtime
loading/error state is discarded before storage. Existing stored legacy images
remain on their compatibility path; this is not a database migration. Media
embed code continues to take precedence and is outside this image-only writer.

## Validation and rollout

- npm run test:editor-native-images exercises the actual insertion and editor
  normalization methods with JSDOM: repeated save/reopen serialization, source
  replacement, legacy hosts/content, external/blob/data URLs, GIF/SVG, multiple
  images and removal. It is part of npm test.
- TypeScript noEmit and full npm test pass (build, other regressions, lint).
- Actual Froala 3.2.7 in Chromium preserves native attributes after cleanup and
  two destroy/reopen cycles. Private browser fixture is in the recovery folder.
- This verifies serialization, not a persisted CMS API round trip. Saved field
  testing and Safari/Firefox remain rollout gates.
- Dev only: build artifacts may be uploaded to the established Sitetheory 1.9
  runtime after backing up the installed Angular bundle. No npm publication,
  production upload, release-version change or bulk data mutation is included.
- Before reproducible release: merge/review this PR, publish a new Angular
  package version through the release process, then update Sitetheory 1.9's root
  and browser-facing dependency manifests/lockfiles. Dev files alone are not a
  completed package rollout.

scope_status: editor writer increment complete; broader CMS persistence/cross-browser gates remain.
integration_status: pending upstream PR review/merge; origin feature/native-editor-images.
deployment_status: dev 1.9 bundle pilot verified; no production or package publication.
cleanup_status: pending ongoing task and integration; retain feature checkout,
then restore canonical master after integration and archive task records.

Live dev validation used the deployed SystemJS editor and media-dialog exports on
Article-Magazine: a generated image retains srcset through two normalization
round trips and loads the xs derivative in a 68px slot; zero page errors. No
saved site content was modified. Only angular.bundle.js and angular.bundle.min.js
were uploaded. Backup: editor-dev-before.tgz in the recovery directory.
