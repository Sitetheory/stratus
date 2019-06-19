// rxjs/operators redirecting
// ----------------------
/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'exports',
      'rxjs'
    ], factory)
  } else {
    factory(root.Stratus)
  }
}(this, function (exports, rxjs) {
  exports = rxjs.operators
  return rxjs.operators
}))
