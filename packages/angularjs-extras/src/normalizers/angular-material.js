// Angular-Material Definition
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
  require(['angular-aria', 'angular-animate', 'angular-messages'], function () {
    require(['angular-material-native'])
  })
}))
