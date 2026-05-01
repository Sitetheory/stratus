// Angular-Material Definition
// ------------------

/* global define, System */

function hasAngularModule (name) {
  try {
    return !!(window.angular && window.angular.module(name))
  } catch (err) {
    return false
  }
}

// Angular Material is usually primed by the host page. Only fetch the native
// files when this normalizer is used without that direct script bootstrap.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['angular'], factory)
  } else {
    factory()
  }
}(this, async function () {
  if (!hasAngularModule('ngMaterial')) {
    await Promise.all([
      hasAngularModule('ngAria') ? null : System.import('angular-aria'),
      hasAngularModule('ngAnimate') ? null : System.import('angular-animate'),
      hasAngularModule('ngMessages') ? null : System.import('angular-messages')
    ])
    await System.import('angular-material-native')
  }
  return window.angular
}))
