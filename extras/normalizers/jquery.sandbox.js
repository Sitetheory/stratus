// jQuery Definition
// ------------------

/* global define */

// Enable noConflict to ensure this version's jQuery globals aren't set in Require.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery-native'], factory)
  } else {
    factory()
  }
}(this, function (jQuery) {
  jQuery = jQuery || this.jQuery || window.jQuery
  if (typeof jQuery === 'undefined') {
    console.error('jQuery is undefined!')
    return
  }

  // This sandboxes jquery's dollar sign
  // NOTE: noConflict causes Angular to never detect jQuery!
  jQuery.noConflict(true)

  // Expose
  window[`jQ${jQuery.fn.jquery.replace(/\./g, '')}`] = jQuery

  // Notify developers of sandbox version
  if (typeof document.cookie === 'string' && document.cookie.indexOf('env=') !== -1) {
    console.log('Sandbox jQuery:', jQuery.fn.jquery)
    console.log('Global jQuery:', `jQ${jQuery.fn.jquery.replace(/\./g, '')}`)
  }

  /**
   * @param event
   * @returns {boolean}
   */
  jQuery.fn.notClicked = function (event) {
    if (!this.selector) {
      console.error('No Selector:', this)
    }
    return !jQuery(event.target).closest(this.selector).length && !jQuery(event.target).parents(this.selector).length
  }

  // Return jQuery Sandbox for assigning local variables
  return jQuery
}))
