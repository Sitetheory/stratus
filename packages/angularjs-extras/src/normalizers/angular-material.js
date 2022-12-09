// Angular-Material Definition
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
  await Promise.all([
    System.import('angular-aria'),
    System.import('angular-animate'),
    System.import('angular-messages')
  ])
  await System.import('angular-material-native')
  console.log('[angular-material] timing set via normalizer')
}))
