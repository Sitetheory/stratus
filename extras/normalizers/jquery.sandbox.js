// jQuery Definition
// ------------------

/* global define, jQuery */

// Enable noConflict to ensure this version's jQuery globals aren't set in Require.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery-native'], factory)
  } else {
    factory()
  }
}(this, function () {
  // This sandboxes jquery's dollar sign
  // FIXME: noConflict causes Angular to never detect jQuery, so it is disabled temporarily!
  const sandbox = jQuery.noConflict(true)

  // Expose
  window[`jQ${sandbox.fn.jquery.replace(/\./g, '')}`] = sandbox

  // Notify developers of sandbox version
  if (typeof document.cookie === 'string' && document.cookie.indexOf('env=') !== -1) {
    console.log('Sandbox jQuery:', sandbox.fn.jquery)
    console.log('Global jQuery:', `jQ${sandbox.fn.jquery.replace(/\./g, '')}`)
  }

  /**
   * @param event
   * @returns {boolean}
   */
  sandbox.fn.notClicked = function (event) {
    if (!this.selector) {
      console.error('No Selector:', this)
    }
    return !sandbox(event.target).closest(this.selector).length && !sandbox(event.target).parents(this.selector).length
  }

  // Return jQuery Sandbox for assigning local variables
  return sandbox
}))
