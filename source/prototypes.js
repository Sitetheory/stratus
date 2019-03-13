/* global Stratus, _, EventTarget, EventManager */

// Error Prototype
// ---------------

/**
 * @param error
 * @param chain
 * @constructor
 */
Stratus.Prototypes.Error = class StratusError {
  constructor (error, chain) {
    this.code = 'Internal'
    this.message = 'No discernible data received.'
    this.chain = []

    if (typeof error === 'string') {
      this.message = error
    } else if (error && typeof error === 'object') {
      _.extend(this, error)
    }

    this.chain.push(chain)
  }
}

// Dispatch Prototype
// ----------------

/**
 * @returns {Object}
 * @constructor
 */
Stratus.Prototypes.Dispatch = class Dispatch extends Stratus.EventManager {
  constructor () {
    super()
    console.warn('Stratus Dispatch is deprecated.  Use Stratus.EventManager instead.')
  }
}

// Event Prototype
// --------------

// This constructor builds events for various methods.
/**
 * @param options
 * @returns {Stratus.Prototypes.Event}
 * @constructor
 */
// TODO: Update to ES6
Stratus.Prototypes.Event = class StratusEvent {
  constructor (options) {
    this.enabled = false
    this.hook = null
    this.target = null
    this.scope = null
    this.debounce = null
    this.throttle = null
    this.method = function () {
      console.warn('No method:', this)
    }
    if (options && typeof options === 'object') {
      _.extend(this, options)
    }
    this.listening = false
    this.invalid = false
    if (typeof this.hook !== 'string') {
      console.error('Unsupported hook:', this.hook)
      this.invalid = true
    }
    if (this.target !== undefined && this.target !== null && !(this.target instanceof EventTarget)) {
      console.error('Unsupported target:', this.target)
      this.invalid = true
    }
    if (typeof this.method !== 'function') {
      console.error('Unsupported method:', this.method)
      this.invalid = true
    }
    if (this.invalid) {
      this.enabled = false
    }
    return this
  }
}

// Chronos System
// --------------

// This constructor builds jobs for various methods.
/**
 * @param time
 * @param method
 * @param scope
 * @returns {Stratus.Prototypes.Job}
 * @constructor
 */
Stratus.Prototypes.Job = class Job {
  constructor (time, method, scope) {
    this.enabled = false
    if (time && typeof time === 'object') {
      _.extend(this, time)
    } else {
      this.time = time
      this.method = method
      this.scope = scope
    }
    this.time = _.seconds(this.time)
    this.scope = this.scope || window
    return this
  }
}

// Model Prototype
// ---------------

// This function is meant to be extended models that want to use internal data
// in a native Backbone way.
Stratus.Prototypes.Model = class Model extends EventManager {
  constructor (data, options) {
    super()
    this.name = 'Model'

    /**
     * @type {{}}
     */
    this.data = {}
    /**
     * @type {{}}
     */
    this.temps = {}

    // Evaluate object or array
    if (data) {
      // TODO: Evaluate object or array into a string of sets
      /* *
      data = _.defaults(_.extend({}, defaults, data), defaults)
      this.set(data, options)
      /* */
      _.extend(this.data, data)
    }
  }

  /**
   * @param options
   * @returns {*}
   */
  toObject (options) {
    return _.clone(this.data)
  }

  /**
   * @param options
   * @returns {{meta: (*|string|{type, data}), payload: *}}
   */
  toJSON (options) {
    return _.clone(this.data)
  }

  /**
   * @param callback
   * @param scope
   */
  each (callback, scope) {
    _.each.apply((scope === undefined) ? this : scope,
      _.union([this.data], arguments))
  }

  /**
   * @param attr
   * @returns {*}
   */
  get (attr) {
    return _.reduce(typeof attr === 'string' ? attr.split('.') : [],
      function (attrs, a) {
        return attrs && attrs[a]
      }, this.data)
  }

  /**
   * @param attr
   * @returns {boolean}
   */
  has (attr) {
    return (typeof this.get(attr) !== 'undefined')
  }

  /**
   * @returns {number}
   */
  size () {
    return _.size(this.data)
  }

  /**
   * @param attr
   * @param value
   */
  set (attr, value) {
    if (attr && typeof attr === 'object') {
      let that = this
      _.each(attr, function (value, attr) {
        that.setAttribute(attr, value)
      }, this)
    } else {
      this.setAttribute(attr, value)
    }
  }

  /**
   * @param attr
   * @param value
   */
  setAttribute (attr, value) {
    if (typeof attr === 'string') {
      if (attr.indexOf('.') !== -1) {
        let reference = this.data
        let chain = attr.split('.')
        _.find(_.initial(chain), function (link) {
          if (!_.has(reference, link) || !reference[link]) {
            reference[link] = {}
          }
          if (typeof reference !== 'undefined' && reference &&
            typeof reference === 'object') {
            reference = reference[link]
          } else {
            reference = this.data
            return true
          }
        }, this)
        if (!_.isEqual(reference, this.data)) {
          let link = _.last(chain)
          if (reference && typeof reference === 'object' &&
            (!_.has(reference, link) || !_.isEqual(reference[link], value))) {
            reference[link] = value
            this.trigger('change:' + attr, this)
            this.trigger('change', this)
          }
        }
      } else if (!_.has(this.data, attr) || !_.isEqual(this.data[attr], value)) {
        this.data[attr] = value
        this.trigger('change:' + attr, this)
        this.trigger('change', this)
      }
    }
  }

  /**
   * @param attr
   * @param value
   */
  temp (attr, value) {
    this.set(attr, value)
    if (attr && typeof attr === 'object') {
      _.each(attr, function (value, attr) {
        this.temps[attr] = value
      }, this)
    } else {
      this.temps[attr] = value
    }
  }

  /**
   * @param attr
   * @param value
   * @returns {*}
   */
  add (attr, value) {
    // Ensure a placeholder exists
    if (!this.has(attr)) {
      this.set(attr, [])
    }

    // only add value if it's supplied (sometimes we want to create an empty
    // placeholder first)
    if (typeof value !== 'undefined' && !_.contains(this.data[attr], value)) {
      this.data[attr].push(value)
      return value
    }
  }

  /**
   * @param attr
   * @param value
   * @returns {*}
   */
  remove (attr, value) {
    if (value === undefined) {
      // delete this.data[attr];
    } else {
      // TODO: use dot notation for nested removal or _.without for array
      // values (these should be separate functions)
      this.data[attr] = _.without(this.data[attr], value)
    }
    return this.data[attr]
  }

  /**
   * @param attr
   * @returns {number}
   */
  iterate (attr) {
    if (!this.has(attr)) {
      this.set(attr, 0)
    }
    return ++this.data[attr]
  }

  /**
   * Clear all internal data
   */
  clear () {
    for (let attribute in this.data) {
      if (this.data.hasOwnProperty(attribute)) {
        delete this.data[attribute]
      }
    }
  }

  /**
   * Clear all temporary data
   */
  clearTemp () {
    for (let attribute in this.temps) {
      if (this.temps.hasOwnProperty(attribute)) {
        // delete this.data[attribute];
        // this.remove(attribute);
        delete this.temps[attribute]
      }
    }
  }
}

// Internal Collections
Stratus.Collections = new Stratus.Prototypes.Model()
Stratus.Models = new Stratus.Prototypes.Model()
Stratus.Routers = new Stratus.Prototypes.Model()
Stratus.Environment = new Stratus.Prototypes.Model(Stratus.Environment)

// Sentinel Prototype
// ------------------

// This class intends to handle typical Sentinel operations.
// TODO: Reevaluate this.
/**
 * @returns {Stratus.Sentinel.Prototypes}
 * @constructor
 */
Stratus.Prototypes.Sentinel = function () {
  this.view = false
  this.create = false
  this.edit = false
  this.delete = false
  this.publish = false
  this.design = false
  this.dev = false
  this.master = false
  this.zero = function () {
    _.extend(this, {
      view: false,
      create: false,
      edit: false,
      delete: false,
      publish: false,
      design: false,
      dev: false,
      master: false
    })
  }
  this.permissions = function (value) {
    if (!isNaN(value)) {
      _.each(value.toString(2).split('').reverse(), function (bit, key) {
        if (bit === '1') {
          switch (key) {
            case 0:
              this.view = true
              break
            case 1:
              this.create = true
              break
            case 2:
              this.edit = true
              break
            case 3:
              this.delete = true
              break
            case 4:
              this.publish = true
              break
            case 5:
              this.design = true
              break
            case 6:
              this.dev = true
              break
            case 7:
              this.view = true
              this.create = true
              this.edit = true
              this.delete = true
              this.publish = true
              this.design = true
              this.dev = true
              this.master = true
              break
          }
        }
      }, this)
    } else {
      let decimal = 0
      decimal += (this.view) ? (1 << 0) : (0 << 0)
      decimal += (this.create) ? (1 << 1) : (0 << 1)
      decimal += (this.edit) ? (1 << 2) : (0 << 2)
      decimal += (this.delete) ? (1 << 3) : (0 << 3)
      decimal += (this.publish) ? (1 << 4) : (0 << 4)
      decimal += (this.design) ? (1 << 5) : (0 << 5)
      decimal += (this.dev) ? (1 << 6) : (0 << 6)
      decimal += (this.master) ? (1 << 7) : (0 << 7)
      return decimal
    }
  }
  this.summary = function () {
    let output = []
    _.each(this, function (value, key) {
      if (typeof value === 'boolean' && value) {
        output.push(_.ucfirst(key))
      }
    })
    return output
  }
  return this
}

// This is the prototype for a bootbox event, in which one could be
// supplied for any bootbox message (i.e. confirm or delete), or one
// will automatically be created at runtime using current arguments.
// TODO: Reevaluate this.
/**
 * @param message
 * @param handler
 * @constructor
 */
Stratus.Prototypes.Bootbox = function (message, handler) {
  if (message && typeof message === 'object') {
    _.extend(this, message)
    this.message = this.message || 'Message'
  } else {
    this.message = message || 'Message'
  }
  this.handler = this.handler || handler
  if (typeof this.handler !== 'function') {
    this.handler = function (result) {
      console.info('Client ' + (result === undefined ? 'closed' : (result
        ? 'confirmed'
        : 'cancelled')) + ' dialog.')
    }
  }
}

// This is the prototype for the toaster, in which one could be supplied
// for a toast message, or one will automatically be created at runtime
// using current arguments.
/**
 * @param message
 * @param title
 * @param priority
 * @param settings
 * @constructor
 */
Stratus.Prototypes.Toast = function (message, title, priority, settings) {
  if (message && typeof message === 'object') {
    _.extend(this, message)
    this.message = this.message || 'Message'
  } else {
    this.message = message || 'Message'
  }
  this.title = this.title || title || 'Toast'
  this.priority = this.priority || priority || 'danger'
  this.settings = this.settings || settings
  if (!this.settings || typeof this.settings !== 'object') {
    this.settings = {}
  }
  this.settings.timeout = this.settings.timeout || 10000
}
