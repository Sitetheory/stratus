/* global Stratus, _ */

// Native Selector
// ---------------

// NOTE: This is a replacement for basic jQuery selectors. This function intends to allow native jQuery-Type chaining and plugins.
/**
 * @param selector
 * @param context
 * @returns {window.NodeList|window.Node}
 * @constructor
 */
Stratus.Select = function (selector, context) {
  if (!context) {
    context = document
  }
  let selection = selector
  if (typeof selector === 'string') {
    let target
    if (_.startsWith(selector, '.') || _.contains(selector, '[')) {
      target = 'querySelectorAll'
    } else if (_.contains(['html', 'head', 'body'], selector) || _.startsWith(selector, '#')) {
      target = 'querySelector'
    } else {
      target = 'querySelectorAll'
    }
    selection = context[target](selector)
  }
  if (selection && typeof selection === 'object') {
    if (_.isAngular(selection) || _.isjQuery(selection)) {
      selection = selection.length ? _.first(selection) : {}
    }
    selection = _.extend({}, Stratus.Selector, {
      context: this,
      length: _.size(selection),
      selection: selection,
      selector: selector
    })
  }
  return selection
}
// TODO: Remove the following hack
/* eslint no-global-assign: "off" */
Stratus = _.extend(function (selector, context) {
  // The function is a basic shortcut to the Stratus.Select
  // function for native jQuery-like chaining and plugins.
  return Stratus.Select(selector, context)
}, Stratus)

// Selector Plugins
// ----------------

/**
 * @param attr
 * @param value
 * @returns {*}
 */
Stratus.Selector.attr = function (attr, value) {
  let that = this
  if (that.selection instanceof window.NodeList) {
    console.warn('Unable to find "' + attr + '" for list:', that.selection)
    return null
  }
  if (!attr) {
    return this
  }
  if (typeof value === 'undefined') {
    value = that.selection.getAttribute(attr)
    return _.hydrate(value)
  } else {
    that.selection.setAttribute(attr, _.dehydrate(value))
  }
  return that
}

/**
 * @param callable
 * @returns {*}
 */
Stratus.Selector.each = function (callable) {
  let that = this
  if (typeof callable !== 'function') {
    callable = function (element) {
      console.warn('each running on element:', element)
    }
  }
  if (that.selection instanceof window.NodeList) {
    _.each(that.selection, callable)
  }
  return that
}

/**
 * @param selector
 * @returns {*}
 */
Stratus.Selector.find = function (selector) {
  let that = this
  if (that.selection instanceof window.NodeList) {
    console.warn('Unable to find "' + selector + '" for list:', that.selection)
  } else if (selector) {
    return Stratus(selector, that.selection)
  }
  return null
}

/**
 * @param callable
 * @returns {*}
 */
Stratus.Selector.map = function (callable) {
  let that = this
  if (typeof callable !== 'function') {
    callable = function (element) {
      console.warn('map running on element:', element)
    }
  }
  if (that.selection instanceof window.NodeList) {
    return _.map(that.selection, callable)
  }
  return that
}

/**
 * TODO: Merge with prepend
 *
 * @param child
 * @returns {*}
 */
Stratus.Selector.append = function (child) {
  let that = this
  if (that.selection instanceof window.NodeList) {
    console.warn('Unable to append child:', child, 'to list:', that.selection)
  } else if (child) {
    that.selection.insertBefore(child, that.selection.lastChild)
  }
  return that
}

/**
 * TODO: Merge with append
 *
 * @param child
 * @returns {*}
 */
Stratus.Selector.prepend = function (child) {
  let that = this
  if (that.selection instanceof window.NodeList) {
    console.warn('Unable to prepend child:', child, 'to list:', that.selection)
  } else if (child) {
    that.selection.insertBefore(child, that.selection.firstChild)
  }
  return that
}

// Design Plugins
/**
 * @param className
 * @returns {*}
 * @constructor
 */
Stratus.Selector.addClass = function (className) {
  let that = this
  if (that.selection instanceof window.NodeList) {
    console.warn('Unable to add class "' + className + '" to list:', that.selection)
  } else {
    _.each(className.split(' '), function (name) {
      if (that.selection.classList) {
        that.selection.classList.add(name)
      } else {
        that.selection.className += ' ' + name
      }
    })
  }
  return that
}

/**
 * @param className
 * @returns {*}
 * @constructor
 */
Stratus.Selector.removeClass = function (className) {
  let that = this
  if (that.selection instanceof window.NodeList) {
    console.warn('Unable to remove class "' + className + '" from list:', that.selection)
  } else if (that.selection.classList) {
    _.each(className.split(' '), function (name) {
      that.selection.classList.remove(name)
    })
  } else {
    that.selection.className = that.selection.className.replace(
      new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)',
        'gi'), ' ')
  }
  return that
}

/**
 * @returns {CSSStyleDeclaration|*}
 */
Stratus.Selector.style = function () {
  let that = this
  if (that.selection instanceof window.NodeList) {
    console.warn('Unable to find style for list:', that.selection)
  } else if (that.selection instanceof window.Node) {
    return window.getComputedStyle(that.selection)
  }
  return null
}

// Positioning Plugins
/**
 * @returns {number|*}
 */
Stratus.Selector.height = function () {
  let that = this
  if (that.selection instanceof window.NodeList) {
    console.warn('Unable to find height for list:', that.selection)
    return null
  }
  return that.selection.offsetHeight || 0
}

/**
 * @returns {number|*}
 */
Stratus.Selector.width = function () {
  let that = this
  if (that.selection instanceof window.NodeList) {
    console.warn('Unable to find width for list:', that.selection)
    return null
  }
  // console.log('width:', that.selection.scrollWidth, that.selection.clientWidth, that.selection.offsetWidth)
  return that.selection.offsetWidth || 0
}

/**
 * @returns {{top: number, left: number}|*}
 */
Stratus.Selector.offset = function () {
  let that = this
  if (that.selection instanceof window.NodeList) {
    console.warn('Unable to find offset for list:', that.selection)
  } else if (that.selection.getBoundingClientRect) {
    let rect = that.selection.getBoundingClientRect()
    return {
      top: rect.top + document.body.scrollTop,
      left: rect.left + document.body.scrollLeft
    }
  }
  return {
    top: null,
    left: null
  }
}

/**
 * @returns {*}
 */
Stratus.Selector.parent = function () {
  let that = this
  if (that.selection instanceof window.NodeList) {
    console.warn('Unable to find offset for list:', that.selection)
    return null
  }
  return Stratus(that.selection.parentNode)
}
