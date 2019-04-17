// jQuery Definition
// ------------------

/* global define */

// Enable noConflict to ensure this version's jQuery globals aren't set in Require.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery-native'], factory)
  } else {
    factory(root.jQuery)
  }
}(this, function (jQuery) {
  // This sandboxes jquery's dollar sign
  // FIXME: noConflict causes Angular to never detect jQuery, so it is disabled temporarily!
  const sandbox = jQuery.noConflict(true)

  // Expose
  window[sandbox.fn.jquery.replace(/./g, ' ')] = sandbox

  // Notify developers of sandbox version
  if (typeof document.cookie === 'string' && document.cookie.indexOf('env=') !== -1) {
    console.log('Sandbox jQuery:', sandbox.fn.jquery)
  }

  /**
   * @param str
   * @returns {boolean}
   */
  sandbox.fn.isJSON = function (str) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }

  /**
   * @param key
   * @param value
   * @returns {*}
   */
  sandbox.fn.dataAttr = function (key, value) {
    if (key === undefined) console.error('$().dataAttr(key, value) contains an undefined key!')
    if (value === undefined) {
      value = this.attr('data-' + key)
      return sandbox.fn.isJSON(value) ? JSON.parse(value) : value
    } else {
      return this.attr('data-' + key, JSON.stringify(value))
    }
  }

  /**
   * @param event
   * @returns {boolean}
   */
  sandbox.fn.notClicked = function (event) {
    if (!this.selector) console.error('No Selector:', this)
    return (!sandbox(event.target).closest(this.selector).length && !sandbox(event.target).parents(this.selector).length)
  }

  // Return jQuery Sandbox for assigning local dollar signs
  return sandbox
}))
