# PropertyFilter category selection and layout

Workspace: `/Users/chadwickmeyer/Sites/stratus-feature-property-filter-categories`
Branch: `feature/property-filter-categories`

The shared IDX search controller now keeps the visible category separate from
`query.where.ListingType`. Opening Residential or Commercial leaves the saved
array untouched. Each category shows its selected-class count, stays marked when
selected classes are hidden, and remains editable when its last class is removed.
Buy/Rent remains a binary mode change using defaults for the visible category.
Defaults are copied so later class selections cannot modify them.

The admin editor and live-editor PropertyFilter panel both use
`admin/search.filter.component.html`. The default, classic, and compact public
search templates use the same controller and category behavior. No Sitetheory
Twig or microIDX backend change is required: microIDX already joins multiple
listing classes with OR.

Shared styles provide gray class buttons in a faint inset area, left-aligned
Buy/For Rent controls, and equal Agent/Office columns separated by 30px. Inputs
fill the available space beside chips and wrap when needed. Status checkboxes
have consistent text and spacing.

## Validation

- `npm run test:idx-property-filter`: compiles the actual controller methods and
  templates with AngularJS; checks mixed selections, counts, selection colors,
  empty groups, persisted scalar values, rental mode, and immutable defaults.
- `tsc --noEmit`, `npm run bundle:rollup`, `npm run compileTypeScript`,
  `npm run design`, and `npm run compress`.
- Local Angular Material rendering checked at desktop and 420px panel widths.
- Dev integration page: https://admin.chad.sitetheory.io/Property-Filter/Edit?id=525219

## Dev upload

`property-filter-categories-upload.json` now lists the exact 23 runtime files for
core 0.0. The upload staging directory is `/tmp/stratus-property-filter-upload`;
it uses a copy of Sitetheory's existing `bin/dev-upload` script. Source edits stay
in the dedicated Stratus and Sitetheory feature workspaces; main checkouts are unchanged.

Status: built and uploaded to `dev.chad.sitetheory.io:/var/www/core/v/0/0`
on 2026-09-29. Admin, public, and live-editor selection-retention checks pass. Verified the
admin theme renders selected classes as `#444`, unselected classes as `#ddd`,
and both Agent/Office placeholders as 13px. Equal columns retain their 30px gap.
Public/live-editor checks used the existing `/Hillsborough` PropertyFilter on
`client.chad.sitetheory.io`; the supplied admin record is on site 430, while the
configured client test host currently serves site 641. Admin/public test selections
were restored. No Save or Publish button was clicked.
No PR, merge, or production deployment has been performed.

## Original live-editor save issue (resolved below)

Opening Page Settings or Content on the dev Hillsborough page triggers a server
error before changing any filter: Doctrine reports an array-to-string conversion
when updating `content_property_filter.sort`. The existing Sitetheory
`liveEditorTemplate.propertyFilter.ts` initializes a missing `meta.sort` to `{}`;
its hidden text field syncs that value to `options.query.order`. This path is
unchanged by this feature. It prevents verifying a successful live-editor save.
The UI and category retention were verified without changing the live-editor query.
Follow-up: normalize the missing sort value to the scalar format expected by the
PropertyFilter entity and verify the live editor's initialization/save lifecycle.

## Follow-up: public contrast and API verification (2026-09-29)

- Restored an explicit `#666` label color for unselected public category tabs.
  The site's `#app .md-button` theme makes text white, while the custom tab's
  background is transparent. Selected categories use `#111` and a persistent
  underline; the visible category keeps a faint background. Scoped to the public
  custom category toggle so the admin's theme remains intact.
- Rebuilt and uploaded the same 16-file IDX manifest to dev core 0.0.
- Captured actual browser POSTs to microIDX `/api/Properties/search` with
  `ListingType.inq = [House, Land, Commercial, CommercialLand]`. The API returned
  20 records successfully with location/status restrictions unchanged. The first
  page contained Residential and Land records; this is not proof that the current
  location has commercial inventory.
- Exercised the actual microIDX `processFilterByListingType` function with a
  bounded fixture: array and `inq` formats produce one OR across all selected
  residential/commercial definitions, with the property-type index constraint
  including every selected definition and other filters preserved. Backend read
  only: `/Users/chadwickmeyer/Sites/microIDX`, branch `agent/remove-prod-ssh-readme`.
- Confirmed drawer save cause: its `ng-init` writes missing `meta.sort` as `{}`;
  the canonical content model's autosave watcher schedules the PUT. The entity's
  sort column is nullable text and its setter assigns the decoded PHP array
  without validation, causing the PDO array-to-string conversion.
- The user subsequently directed implementation of the API guard and no-save-on-open
  behavior. Sitetheory work now lives in
  `/Users/chadwickmeyer/Sites/Sitetheory-feature-property-filter-categories`, branch
  `feature/property-filter-categories`; its main checkout remains unchanged.

## Follow-up: no initialization writes and API validation (2026-09-29)

Implemented and verified on dev core 0.0:

- Removed persisted-field `ng-init` defaults from both PropertyFilter live-editor
  field blocks. Opening preserves existing, missing, null, and empty-string values.
- Added opt-in `data-variable-sync-on-init="false"` to the drawer's IDX component.
  It reads initial hidden input values without echoing a change event, and avoids
  later equivalent-value echoes. Other callers retain existing initial-sync behavior.
- Actual later edits still synchronize. Explicit empty scalar/list/object edits
  become null; JSON-backed hidden inputs encode `null` so their parser preserves
  its type. Sort uses an ng-change handler for explicit empty-to-null conversion.
  No global autosave behavior was changed.
- Added Symfony Type validation to PropertyFilter.sort: nullable text accepts
  strings and null, rejects arrays/objects/booleans/numbers before database flush.
  Invalid input is rejected, never silently converted into a destructive clear.

Validation:

- Stratus `test:idx-property-filter` and new `test:idx-variable-sync` pass. The
  latter compiles real AngularJS inputs and the production sync/JSON directive code;
  checks absent/null/populated values, no hydration events, edits, null clears,
  and legacy callers.
- Sitetheory `tests/Frontend/PropertyFilterInitializationTest.cjs` compiles both
  production template blocks; missing metadata and defaults remain untouched,
  and explicit sort clearing becomes null.
- `php tests/Regression/property-filter-sort.php` and PHP syntax validation pass.
- Stratus rollup, TypeScript, design, and compression builds pass.
- Sitetheory's root dependency directory lacks gulp/TypeScript. Its two changed
  template modules were compiled with the installed Stratus TypeScript compiler
  using Sitetheory's tsconfig SystemJS settings, then minified with Terser.
  These live-editor modules are excluded from the core rollup bundle. No full
  Sitetheory build is claimed. Frontend test uses NODE_PATH pointing to the same
  installed toolchain and supports both old/new jsdom APIs.
- Uploaded the 23-file manifest: previous 16 IDX assets, six compiled live-editor
  module files/maps, and PropertyFilter.php. No production upload or cache clear.
- Fresh Hillsborough preview drawer initialization: 16 observed requests, zero
  PUTs, no truncated network capture, Save disabled after settling. Reopening
  and switching category tabs also generated zero PUTs.
- Authenticated malformed PUT on core 0.0 returns `meta.success=false`,
  `meta.validation.sort`, and `VALIDATION` status (HTTP 200 per existing API
  convention), not API_INTERNAL_ERROR. Saved metadata, version ID, and edit
  timestamps match before/after. An initial probe was redirected to unchanged
  core 1.7 and reproduced the original error; corrected cookie-session handling
  verified the guard specifically on 0.0.

Changes are being committed and submitted for upstream review. No upstream merge
or production deployment has been performed.

## Follow-up: shared API field-shape guard (2026-09-29)

The user requested protection beyond PropertyFilter.sort. Replaced its temporary
Assert Type annotation with `EntityApiController::validatePayloadFieldType`, called
on writable payload fields before processValue(), field hydrate events, truncation,
or setters. The shared persister checks both declared ORM column and API types.
Arrays/objects/resources in scalar text/string/guid, numeric, boolean, date/time,
and binary fields produce field-path validation errors and mark the convoy invalid,
preventing flush. Legitimate DateTime values and binary streams are exempt where
appropriate; JSON/serialized/custom types and associations retain existing handling.

This specifically closes container-to-scalar failures across API entities. It does
not replace field constraints or change established scalar conversions, such as
formatted price strings. Null remains explicit and subject to existing field
nullability/default handling. Empty containers are rejected rather than silently
converted to null; zero, false, and empty strings are not classified with empty().

- Added `tests/Regression/api-scalar-payload-types.php`; supersedes the temporary
  sort-only regression test. Tests all scalar type families, empty/nonempty
  containers, JSON and associations, API/storage type overrides, DateTime/streams,
  null/zero/false, field-path errors, and retained scalar formatting behavior.
- PHP syntax, regression, and diff-whitespace checks pass.
- Uploaded only EntityApiController.php plus PropertyFilter.php (to remove the
  previous annotation). Cumulative task upload manifest now contains 24 files.
- The client host was subsequently pointed at site 689, so Hillsborough 54424
  was outside its context. Remote tests used the originally supplied admin test
  record 525219 on site 430, explicitly verified core 0.0.
- Malformed `version.meta.sort: {}` and `version.title: ["invalid"]` both return
  `meta.success=false` and field-path VALIDATION errors, without API_INTERNAL_ERROR.
  Saved title, metadata, version ID, and edit timestamps are unchanged afterward.
- UI and no-initialization-save fixes were not changed in this follow-up.

## Upstream submission (2026-09-29)

User approved committing and pushing for upstream review. Sitetheory work was
committed on the feature branch, then applied to local `1.7` after a fast-forward
pull from upstream/1.7 in the same dedicated workspace. This avoids including
unrelated latest-branch commits. Stratus remains on
`feature/property-filter-categories`, based on current upstream/master (Stratus
has no 1.7 branch). Companion PRs must be released together: the Sitetheory drawer
opts into the new Stratus no-initialization-write binding.

## IDX patch release 0.28.9

User requested the package release preparation and will perform npm publication.
The IDX package manifest and Stratus local-file lock entry are bumped from 0.28.8
to 0.28.9, followed by rollup, TypeScript, stylesheet/template, and compression
builds. Sitetheory 1.7 now requires ^0.28.9. Its lockfile pins the registry tarball
URL and checksum of the prepared npm archive. Publish that exact archive before
installing the Sitetheory dependency update; it is not yet available on npm.
Both existing upstream PRs are updated.
