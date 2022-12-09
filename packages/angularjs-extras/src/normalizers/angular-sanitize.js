// Angular-Sanitize Definition
// ------------------

/* global define */

// Ensure angular gets injected first
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['angular'], factory)
  } else {
    factory()
  }
}(this, function () {
  require(['angular-sanitize-native'])
}))
