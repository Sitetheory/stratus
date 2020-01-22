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
      '@stratusjs/runtime/stratus',
    ], function (exports, module_stratus) {
      return (root.Stratus = factory(exports, module_stratus))
    })
  } else {
    root.Stratus = factory(root.exports)
  }
}(this, function (exports, module_stratus) {
  // Handle Module
  // ------------

  // This pulls the Stratus object from Stratus for Backwards Compatibility with AMD Define
  const {Stratus} = module_stratus

  // Handle Scope
  // ------------

  // Return the Stratus Object so it can be attached in the correct context as either a Global Variable or Object Reference
  exports = Stratus
  return Stratus
}))
