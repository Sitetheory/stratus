// Require.js
// ----------

// We use this function factory to ensure the Stratus Layer can work outside of a
// Require.js environment.  This function needs to exist on every module defined
// within the Stratus environment to ensure its acceptance regardless of the
// contextual environment in which it is running.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'text',
      'underscore',
      'bowser',
      'promise',
      'backbone', // TODO: Remove once phased out appropriately
      'jquery' // TODO: Remove once phased out appropriately
    ], function (text, _, bowser) {
      return (root.Stratus = factory(text, _, bowser));
    });
  } else {
    root.Stratus = factory(root.text, root._, root.bowser);
  }
}(this, function (text, _, bowser) {
