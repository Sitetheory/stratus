# Scroll Root Visibility

- Owner: Compass performance task, October 30, 2026.
- Workspace: /Users/chadwickmeyer/Sites/stratus; branch
  fix/compass-viewport-visibility; canonical return branch master.
- Scope: intersect custom scroll roots with the actual browser viewport before
  evaluating visibility. Preserve partial/full checks and intentional offsets.
- Reproduction: dev site630 root-scroll spans y74..7979 in a720px viewport;
  every below-fold module was incorrectly on-screen. This starts animations and
  can admit lazy media prematurely. Do not infer CPU savings without profiling.
- Tests: node scripts/check-viewport-visibility.cjs; npm run compileTypeScript.
- Dev deployment: only runtime/src/stratus.js and stratus.min.js under CMS1.9
  CoreBundle/Resources/public/node_modules/@stratusjs. Pre-upload JS comparison
  shows only this function changes. No package publication or production upload.
- Rollback originals: ~/dev/compass-performance-recovery-2026-10-27/viewport-2026-10-30;
  Compass owns retention through acceptance. Restore both files together.
- Integration and package publication pending. CMS1.9 central release checklist
  must require the integrated runtime build before production release.
- Cleanup pending integration: retain this checkout and restore master afterward;
  preserve the pre-existing .article-editor-test.log, which is not task-owned.
