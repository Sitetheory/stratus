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
      'text',
      'underscore',
      'jquery', // TODO: Remove once phased out appropriately
      'bowser',
      'promise'
    ], function (text, _, bowser) {
      return (root.Stratus = factory(text, _, jQuery, bowser))
    })
  } else {
    root.Stratus = factory(root.text, root._, root.jQuery, root.bowser)
  }
}(this, function (text, _, jQuery, bowser) {
