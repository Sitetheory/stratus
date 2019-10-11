// Angular Definition
// ------------------

/* global define */

// Ensure angular gets exported appropriately
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['angular-native'], factory)
  } else {
    factory()
  }
}(this, function () {
  return window.angular
}))
