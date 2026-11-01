# Scroll Root Visibility

- Owner: Compass performance task, October 30, 2026.
- Workspace: /Users/chadwickmeyer/Sites/stratus; release preparation branch
  release/compass-viewport; canonical return branch master.
- Scope: intersect custom scroll roots with the actual browser viewport before
  evaluating visibility. Preserve partial/full checks and intentional offsets.
- Reproduction: every below-fold module retained on-screen after asynchronous
  layout expansion. The legacy directive stopped startup polling after an early
  measurement and did not observe layout shifts. Native IntersectionObserver now
  handles default visibility-only placements; offset/full/event/animation cases
  retain the legacy path. Scroll-root clipping fixes a separate shared edge case;
  site630's configured root is a string, so clipping alone did not fix this page.
- Tests: node scripts/check-viewport-visibility.cjs; npm run compileTypeScript.
- Tests also include node scripts/check-onscreen-observer.cjs (entry/exit/reentry,
  asynchronous layout, no synchronous default measurements, destroy cleanup).
- Dev deployment: runtime/src/stratus.js and stratus.min.js under CMS1.9
  CoreBundle/Resources/public/node_modules/@stratusjs. Pre-upload JS comparison
  shows only this function changes. No package publication or production upload.
- Angular extras bundle pair uses the remote original plus the onScreen changes
  only, preserving other deployed code. Minification MUST use mangle:false like
  compressPreserve in gulpfile.ts: Angular injection depends on parameter names.
  An initial mangled dev build was corrected immediately. Anonymous Lighthouse
  then had no console errors and 100 accessibility/best-practices/SEO. All ten
  below-fold modules now have off-screen after asynchronous rendering.
- Source PR: https://github.com/Sitetheory/stratus/pull/889 merged into master
  as 0f0474eb179476f3d221b04ff229a4b96879adb2.
- Rollback originals: ~/dev/compass-performance-recovery-2026-10-27/viewport-2026-10-30;
  Compass owns retention through acceptance. Restore both files together.
- Source integration complete; package metadata integration and publication
  pending. Prepare runtime0.15.5 and angularjs-extras0.18.10 together. Registry
  latest versions checked before preparation: runtime0.15.4 and extras0.18.9.
  No functional changes beyond merged PR889. Root development version remains
  unchanged; local package lock entries advance with their manifests.
- Release sequence: review/merge metadata, obtain package publication approval,
  build and pack the approved commit, verify package content, then publish runtime
  followed by extras. Verify registry integrity before pinning both packages in
  CMS1.9 root/browser manifests and rebuilding its bundles. Do not replace dev
  bundles from a mixed source tree or alter the Server CMS pin prematurely.
- CMS1.9 central release checklist must require both published package versions
  before coordinated dev acceptance and any separately approved production rollout.
- Release validation: full npm test (build, package regressions and lint) plus
  both visibility scripts pass. Packed runtime0.15.5 and extras0.18.10 include
  all six required ordinary/minified runtime, directive and bundle artifacts,
  byte-identical to the tested build. Temporary archives removed after inspection;
  regenerate from the approved commit for publication. No registry write performed.
- Cleanup pending integration: retain this checkout and restore master afterward;
  preserve the pre-existing .article-editor-test.log, which is not task-owned.
