// Require.js
// ----------

/* global define */

// We use this function factory to ensure the Stratus Layer can work outside of a
// Require.js environment.  This function needs to exist on every module defined
// within the Stratus environment to ensure its acceptance regardless of the
// contextual environment in which it is running.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'exports',
      'lodash',
      'jquery', // TODO: Remove once phased out appropriately
      'bowser'
    ], function (exports, _, jQuery, bowser) {
      return (root.Stratus = factory(exports, _, jQuery, bowser))
    })
  } else {
    root.Stratus = factory(root.exports, root._, root.jQuery, root.bowser)
  }
}(this, function (exports, _, jQuery, bowser) {
