# Scroll Root Visibility

- Owner: Compass performance task, October 30, 2026.
- Workspace: /Users/chadwickmeyer/Sites/stratus; branch
  fix/compass-viewport-visibility; canonical return branch master.
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
- Draft upstream PR: https://github.com/Sitetheory/stratus/pull/889 (master).
- Rollback originals: ~/dev/compass-performance-recovery-2026-10-27/viewport-2026-10-30;
  Compass owns retention through acceptance. Restore both files together.
- Integration and package publication pending. CMS1.9 central release checklist
  must require the integrated runtime build before production release.
- Cleanup pending integration: retain this checkout and restore master afterward;
  preserve the pre-existing .article-editor-test.log, which is not task-owned.
