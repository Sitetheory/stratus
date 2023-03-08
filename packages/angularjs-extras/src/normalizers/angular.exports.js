// Angular Definition
// ------------------

/* global define */

// Ensure angular gets exported appropriately
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['angular-native'], factory)  // FIXME defining 'angular-native' here can attempt to load angularjs a second time. Need to import instead
  } else {
    factory()
  }
}(this, function () {
  return window.angular
}))
