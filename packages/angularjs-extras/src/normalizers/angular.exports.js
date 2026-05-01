// Angular Definition
// ------------------

/* global define */

// Angular is already primed by the host page. Export the existing global so
// SystemJS imports do not fetch angular-native a second time.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory)
  } else {
    factory()
  }
}(this, function () {
  return window.angular
}))
