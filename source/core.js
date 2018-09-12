/* global Stratus, _, Backbone, $, bootbox */

// Instance Clean
// --------------

// This function is meant to delete instances by their unique id for Garbage
// Collection.
/**
 * @param instances
 * @returns {boolean}
 * @constructor
 */
Stratus.Instances.Clean = function (instances) {
  if (typeof instances === 'undefined') {
    console.error(
      'Stratus.Instances.Clean() requires a string or array containing Unique ID(s).')
  } else if (typeof instances === 'string') {
    instances = [instances]
  }

  if (typeof instances === 'object' && Array.isArray(instances)) {
    _.each(instances, function (value) {
      if (_.has(Stratus.Instances, value)) {
        if (typeof Stratus.Instances[value].remove === 'function') {
          Stratus.Instances[value].remove()
        }
        delete Stratus.Instances[value]
      }
    })
  } else {
    return false
  }
}

// Chronos System
// --------------

// This model handles all time related jobs.
Stratus.Chronos = _.extend(new Stratus.Prototypes.Model(), {
  /**
   * @param options
   */
  initialize: function (options) {
    if (!Stratus.Environment.get('production')) {
      console.info('Chronos Invoked!')
    }
    this.on('change', this.synchronize, this)
  },
  synchronize: function () {
    _.each(this.changed, function (job, key) {
      if (typeof key === 'string' && key.indexOf('.') !== -1) {
        key = _.first(key.split('.'))
        job = this.get(key)
      }
      if (!job.code && job.enabled) {
        job.code = setInterval(function (job) {
          job.method.call(job.scope)
        }, job.time * 1000, job)
      } else if (job.code && !job.enabled) {
        clearInterval(job.code)
        job.code = 0
      }
    }, this)
  },
  /**
   * @param time
   * @param method
   * @param scope
   * @returns {string}
   */
  add: function (time, method, scope) {
    var uid = null
    var job = new Stratus.Prototypes.Job(time, method, scope)
    if (job.time !== null && typeof job.method === 'function') {
      uid = _.uniqueId('job_')
      this.set(uid, job)
      Stratus.Instances[uid] = job
    }
    return uid
  },
  /**
   * @param uid
   * @returns {boolean|*}
   */
  enable: function (uid) {
    var success = this.has(uid)
    if (success) {
      this.set(uid + '.enabled', true)
    }
    return success
  },
  /**
   * @param uid
   * @returns {boolean|*}
   */
  disable: function (uid) {
    var success = this.has(uid)
    if (success) {
      this.set(uid + '.enabled', false)
    }
    return success
  },
  /**
   * @param uid
   * @param value
   * @returns {boolean|*}
   */
  toggle: function (uid, value) {
    var success = this.has(uid)
    if (success) {
      this.set(uid + '.enabled',
        (typeof value === 'boolean') ? value : !this.get(uid + '.enabled'))
    }
    return success
  }
})
Stratus.Chronos.reinitialize()

// Post Message Handling
// ---------------------

// This function executes when the window receives a Post Message
// Convoy from another source as a (i.e. Window, iFrame, etc.)
/**
 * @param fn
 * @constructor
 */
Stratus.PostMessage.Convoy = function (fn) {
  window.addEventListener('message', function (event) {
    if (event.origin !== 'https://auth.sitetheory.io') {
      return false
    }
    fn(_.isJSON(event.data) ? JSON.parse(event.data) : {})
  }, false)
}

// When a message arrives from another source, handle the Convoy
// appropriately.
Stratus.PostMessage.Convoy(function (convoy) {
  // Single Sign On
  var ssoEnabled = _.cookie('sso')
  ssoEnabled = ssoEnabled === null ? true : (_.isJSON(ssoEnabled) ? JSON.parse(ssoEnabled) : false)
  if (ssoEnabled && convoy && convoy.meta && convoy.meta.session && convoy.meta.session !== _.cookie('SITETHEORY')) {
    _.cookie({
      name: 'SITETHEORY',
      value: convoy.meta.session,
      expires: '1w'
    })
    if (!Stratus.Client.safari) {
      window.location.reload(true)
    }
  }
})

// Local Storage Handling
// ----------------------

// This function executes when the window receives a keyed Local
// Storage event, which can occur on any open tab within the
// browser's session.
/**
 * @param key
 * @param fn
 * @constructor
 */
Stratus.LocalStorage.Listen = function (key, fn) {
  window.addEventListener('storage', function (event) {
    if (event.key !== key) {
      return
    }
    fn(event)
    // fn(_.isJSON(event.data) ? JSON.parse(event.data) : {})
  }, false)
}

// When an event arrives from any source, we will handle it
// appropriately.
Stratus.LocalStorage.Listen('stratus-core', function (data) {
  console.log('LocalStorage:', data)
})
// localStorage.setItem('stratus-core', 'foo')

// DOM Listeners
// -------------

// This function executes when the DOM is Ready, which means
// the DOM is fully parsed, but still loading sub-resources
// (CSS, Images, Frames, etc).
/**
 * @param fn
 */
Stratus.DOM.ready = function (fn) {
  (document.readyState !== 'loading') ? fn() : document.addEventListener('DOMContentLoaded', fn)
}

// This function executes when the DOM is Complete, which means
// the DOM is fully parsed and all resources are rendered.
/**
 * @param fn
 */
Stratus.DOM.complete = function (fn) {
  (document.readyState === 'complete') ? fn() : window.addEventListener('load',
    fn)
}

// This function executes before the DOM has completely Unloaded,
// which means the window/tab has been closed or the user has
// navigated from the current page.
/**
 * @param fn
 */
Stratus.DOM.unload = function (fn) {
  window.addEventListener('beforeunload', fn)
}

// Key Maps
// --------

// These constants intend to map keys for most browsers.
Stratus.Key.Enter = 13
Stratus.Key.Escape = 27

// Stratus Layer Events
// --------------------

// When these events are triggered, all functions attached to the event name
// will execute in order of initial creation.  This becomes supremely useful
// when adding to the Initialization and Exit Routines as AMD Modules, views
// and custom script(s) progressively add Objects within the Stratus Layer.

Stratus.Events.on('initialize', function () {
  if (!Stratus.Environment.get('production')) {
    console.groupEnd()
    console.group('Stratus Initialize')
  }
  Stratus.Internals.LoadEnvironment()
  Stratus.Internals.Compatibility()
  Stratus.RegisterGroup = new Stratus.Prototypes.Model()

  /* FIXME: This breaks outside of Sitetheory *
  // Start Generic Router
  require(['stratus.routers.generic'], function () {
    Stratus.Routers.set('generic', new Stratus.Routers.Generic())
    Stratus.Instances[_.uniqueId('router.generic_')] = Stratus.Routers.get('generic')
  })
  /**/

  // Handle Location
  Stratus.Internals.TrackLocation()

  // Load Angular
  Stratus.Loaders.Angular()

  // Load Views
  Stratus.Internals.Loader().then(function (views) {
    if (!Stratus.Environment.get('production')) {
      console.info('Views:', views)
    }
    window.views = views
    Stratus.Events.on('finalize', function (views) {
      if (typeof Backbone !== 'undefined' && !Backbone.History.started) {
        Backbone.history.start()
      }
      Stratus.Events.trigger('finalized', views)
    })
    Stratus.Events.trigger('finalize', views)
  }, function (error) {
    console.error('Stratus Loader:', error)
  })
})
Stratus.Events.on('finalize', function () {
  if (!Stratus.Environment.get('production')) {
    console.groupEnd()
    console.group('Stratus Finalize')
  }

  // Load Internals after Widgets and Plugins
  if (typeof Backbone === 'object') {
    if (Stratus.Internals.Anchor.initialize) {
      Stratus.Internals.Anchor = Stratus.Internals.Anchor()
    }
    var anchor = new Stratus.Internals.Anchor()
    if (!Stratus.Environment.get('production')) {
      console.log('Anchor:', anchor)
    }
  }

  // Call Any Registered Group Methods that plugins might use, e.g. OnScroll
  if (Stratus.RegisterGroup.size()) {
    Stratus.RegisterGroup.each(function (objs, key) {
      // for each different type of registered plugin, pass all the registered
      // elements
      if (_.has(Stratus.Internals, key)) {
        Stratus.Internals[key](objs)
      }
    })
  }
})
Stratus.Events.on('terminate', function () {
  if (!Stratus.Environment.get('production')) {
    console.groupEnd()
    console.group('Stratus Terminate')
  }
})

// This event supports both Native and Bootbox styling to generate
// an alert box with an optional message and handler callback.
Stratus.Events.on('alert', function (message, handler) {
  if (!(message instanceof Stratus.Prototypes.Bootbox)) {
    message = new Stratus.Prototypes.Bootbox(message, handler)
  }
  /* if (typeof jQuery !== 'undefined' && typeof $().modal === 'function' && typeof bootbox !== 'undefined') { */
  if (typeof bootbox !== 'undefined') {
    bootbox.alert(message.message, message.handler)
  } else {
    window.alert(message.message)
    message.handler()
  }
})

// This event supports both Native and Bootbox styling to generate
// a confirmation box with an optional message and handler callback.
Stratus.Events.on('confirm', function (message, handler) {
  if (!(message instanceof Stratus.Prototypes.Bootbox)) {
    message = new Stratus.Prototypes.Bootbox(message, handler)
  }
  /* if (typeof jQuery !== 'undefined' && typeof $().modal === 'function' && typeof bootbox !== 'undefined') { */
  if (typeof bootbox !== 'undefined') {
    bootbox.confirm(message.message, message.handler)
  } else {
    handler(window.confirm(message.message))
  }
})

// This event allows a Notification to reach the browser.
Stratus.Events.on('notification', function (message, title) {
  var options = {}
  if (message && typeof message === 'object') {
    _.extend(options, message)
    options.message = options.message || 'Message'
  } else {
    options.message = message || 'Message'
  }
  options.title = options.title || title || 'Stratus'
  options.icon = options.icon || 'https://avatars0.githubusercontent.com/u/15791995?v=3&s=200'
  var notification
  if (!('Notification' in window)) {
    console.info('This browser does not support desktop notifications.  You should switch to a modern browser.')
  } else if (window.Notification.permission === 'granted') {
    notification = new window.Notification(options.title, {
      body: options.message,
      icon: options.icon
    })
    if (!Stratus.Environment.get('production')) {
      console.log(notification)
    }
  } else if (window.Notification.permission !== 'denied') {
    window.Notification.requestPermission(function (permission) {
      if (permission === 'granted') {
        notification = new window.Notification(options.title, {
          body: options.message,
          icon: options.icon
        })
        if (!Stratus.Environment.get('production')) {
          console.log(notification)
        }
      }
    })
  }
})

// This event only supports Toaster styling to generate a message
// with either a Bootbox or Native Alert as a fallback, respectively.
Stratus.Events.on('toast', function (message, title, priority, settings) {
  if (!(message instanceof Stratus.Prototypes.Toast)) {
    message = new Stratus.Prototypes.Toast(message, title, priority, settings)
  }
  if (!Stratus.Environment.get('production')) {
    console.log('Toast:', message)
  }
  if (typeof $ !== 'undefined' && $.toaster) {
    $.toaster(message)
  } else {
    Stratus.Events.trigger('alert', message.message)
  }
})

// DOM Ready Routines
// ------------------
// On DOM Ready, add browser compatible CSS classes and digest DOM data-entity
// attributes.
Stratus.DOM.ready(function () {
  Stratus('body').removeClass('loaded unloaded').addClass('loading')
  Stratus.Events.trigger('initialize')
})

// DOM Complete Routines
// ---------------------

// Stratus Events are more accurate than the DOM, so nothing is added to this
// stub.
Stratus.DOM.complete(function () {
  Stratus('body').removeClass('loading unloaded').addClass('loaded')
})

// DOM Unload Routines
// -------------------

// On DOM Unload, all inherent Stratus functions will cleanly
// break any open connections or currently operating routines,
// while providing the user with a confirmation box, if necessary,
// before close routines are triggered.
Stratus.DOM.unload(function (event) {
  Stratus('body').removeClass('loading loaded').addClass('unloaded')
  Stratus.Events.trigger('terminate', event)
  /* *
  if (event.cancelable === true) {
      // TODO: Check if any unsaved changes exist on any Stratus Models then request confirmation of navigation
      event.preventDefault();
      var confirmationMessage = 'You have pending changes, if you leave now, they may not be saved.';
      (event || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
  }
  /* */
})
