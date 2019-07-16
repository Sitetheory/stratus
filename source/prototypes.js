/* global Stratus, _, EventTarget */

// Stratus Event System
// --------------------

Stratus.Prototypes.EventManager = class EventManager {
  constructor (throttle) {
    this.name = 'EventManager'
    this.listeners = {}
    this.throttleTrigger = _.throttle(this.trigger, throttle || 100)
  }

  /**
   * @param name
   * @param callback
   * @param context
   * @returns {Stratus.Prototypes.EventManager}
   */
  off (name, callback, context) {
    console.log('off:', arguments)
    return this
  }

  /**
   * @param name
   * @param callback
   * @param context
   * @returns {Stratus.Prototypes.EventManager}
   */
  on (name, callback, context) {
    const event = (name instanceof Stratus.Prototypes.Event) ? name : new Stratus.Prototypes.Event({
      enabled: true,
      hook: name,
      method: callback,
      scope: context || null
    })
    name = event.hook
    if (!(name in this.listeners)) {
      this.listeners[name] = []
    }
    this.listeners[name].push(event)
    return this
  }

  /**
   * @param name
   * @param callback
   * @param context
   * @returns {Stratus.Prototypes.EventManager}
   */
  once (name, callback, context) {
    this.on(name, function (event, ...args) {
      event.enabled = false
      let childArgs = _.clone(args)
      childArgs.unshift(event)
      callback.apply(event.scope || this, childArgs)
    }, context)
    return this
  }

  /**
   * @param name
   * @param args
   * @returns {Stratus.Prototypes.EventManager}
   */
  trigger (name, ...args) {
    if (!(name in this.listeners)) {
      return this
    }
    this.listeners[name].forEach(function (event) {
      if (!event.enabled) {
        return
      }
      let childArgs = _.clone(args)
      childArgs.unshift(event)
      event.method.apply(event.scope || this, childArgs)
    })
    return this
  }
}

// Global Instantiation
Stratus.Events = new Stratus.Prototypes.EventManager()

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

// Event Prototype
// --------------

// This constructor builds events for various methods.
/**
 * @param options
 * @returns {Stratus.Prototypes.Event}
 * @constructor
 */
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
  }
}

// Model Prototype
// ---------------

// This function is meant to be extended models that want to use internal data
// in a native Backbone way.
Stratus.Prototypes.Model = class Model extends Stratus.Prototypes.EventManager {
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

    // Diff Detection
    this.changed = false
    this.watching = false
    this.patch = {}

    // Evaluate object or array
    if (data) {
      // TODO: Evaluate object or array into a string of sets
      /* *
      data = _.defaults(_.extend({}, defaults, data), defaults)
      this.set(data, options)
      /* */
      _.extend(this.data, data)
    }

    // Scope Binding
    this.toObject = this.toObject.bind(this)
    this.toJSON = this.toJSON.bind(this)
    this.each = this.each.bind(this)
    this.get = this.get.bind(this)
    this.has = this.has.bind(this)
    this.size = this.size.bind(this)
    this.set = this.set.bind(this)
    this.setAttribute = this.setAttribute.bind(this)
    this.temp = this.temp.bind(this)
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
    this.iterate = this.iterate.bind(this)
    this.clear = this.clear.bind(this)
    this.clearTemp = this.clearTemp.bind(this)
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
    // Note:
    // This needs to tree build into dot notation strings
    // then delete the keys for the values or remove an
    // element from an array.

    // console.log('remove:', attr, value === undefined ? 'straight' : 'element')
    if (value === undefined) {
      // FIXME: This needs to remove the dot notation references
      // delete this.data[attr];
    } else {
      // TODO: use dot notation for nested removal or _.without for array
      // values (these should be separate functions)
      this.data[attr] = _.without(this.data[attr], value)
    }
    // console.log('removed:', this.data[attr])
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
Stratus.Prototypes.Sentinel = class Sentinel {
  constructor () {
    this.view = false
    this.create = false
    this.edit = false
    this.delete = false
    this.publish = false
    this.design = false
    this.dev = false
    this.master = false

    // Scope Binding
    this.zero = this.zero.bind(this)
    this.permissions = this.permissions.bind(this)
    this.summary = this.summary.bind(this)
  }
  zero () {
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
  permissions (value) {
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
  summary () {
    let output = []
    _.each(this, function (value, key) {
      if (typeof value === 'boolean' && value) {
        output.push(_.ucfirst(key))
      }
    })
    return output
  }
}

// TODO: rethink whether this should be in the core
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
Stratus.Prototypes.Toast = class Toast {
  constructor (message, title, priority, settings) {
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
}
