// Angular-Sanitize Definition
// ------------------

/* global define, System */

// Ensure angular gets injected first
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['angular'], factory)
  } else {
    factory()
  }
}(this, async function () {
  // FIXME: This never actually sets the correct timing for what's referencing the import...
  await System.import('angular-sanitize-native')
  console.log('[angularjs-sanitize] timing set via normalizer')
}))
