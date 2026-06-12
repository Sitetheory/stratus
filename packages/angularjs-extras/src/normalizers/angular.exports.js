// Angular Definition
// ------------------

/* global define */

// Angular is already primed by the host page. Export the existing global so
// SystemJS imports do not fetch angular-native a second time unless needed.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    if (window.angular) {
      define([], factory)
    } else {
      define(['angular-native'], factory)
    }
  } else {
    factory()
  }
}(this, function () {
  return window.angular
}))
