// Angular-Sanitize Definition
// ------------------

/* global define, System */

function hasAngularModule (name) {
  try {
    return !!(window.angular && window.angular.module(name))
  } catch (err) {
    return false
  }
}

// Angular Sanitize is usually primed by the host page. Only fetch the native
// file when this normalizer is used without that direct script bootstrap.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['angular'], factory)
  } else {
    factory()
  }
}(this, async function () {
  if (!hasAngularModule('ngSanitize')) {
    await System.import('angular-sanitize-native')
  }
  return window.angular
}))
