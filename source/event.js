/* global Stratus, _ */

// Stratus Event System
// --------------------

console.warn('I\'m rebuilding the Event system, so this may break some stuff!')

class EventManager {
  constructor () {
    this.name = 'EventManager'
    this.listeners = {}
  }

  off (name, callback, context) {
    console.log('off:', arguments)
    return this
  }

  on (name, callback, context) {
    let event = (name instanceof Stratus.Prototypes.Event) ? name : new Stratus.Prototypes.Event({
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

  trigger (name, data) {
    if (name in this.listeners) {
      this.listeners[name].forEach(function (event) {
        event.method.call(event.scope || this, data)
      })
    }
    return this
  }
}

Stratus.EventManager = EventManager
// Stratus.Events = new EventManager()

// This is largely based on the work of Backbone.Events
// to provide the logic in case we don't have Backbone
// loaded at this time.

// Regular expression used to split event strings.
let eventSplitter = /\s+/

// Iterates over the standard `event, callback` (as well as the fancy multiple
// space-separated events `"change blur", callback` and jQuery-style event
// maps `{event: callback}`).
let eventsApi = function (iteratee, events, name, callback, opts) {
  let i = 0
  let names
  if (name && typeof name === 'object') {
    // Handle event maps.
    if (callback !== void 0 && 'context' in opts &&
      opts.context === void 0) {
      opts.context = callback
    }
    for (names = _.keys(name); i < names.length; i++) {
      events = eventsApi(iteratee, events, names[i], name[names[i]], opts)
    }
  } else if (name && eventSplitter.test(name)) {
    // Handle space-separated event names by delegating them individually.
    for (names = name.split(eventSplitter); i < names.length; i++) {
      events = iteratee(events, names[i], callback, opts)
    }
  } else {
    // Finally, standard events.
    events = iteratee(events, name, callback, opts)
  }
  return events
}

// Bind an event to a `callback` function. Passing `"all"` will bind
// the callback to all events fired.
Stratus.Events.on = function (name, callback, context) {
  // console.warn('Deprecated usage of event', name, '->', callback)
  return internalOn(this, name, callback, context)
}

// Guard the `listening` argument from the public API.
let internalOn = function (obj, name, callback, context, listening) {
  obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
    context: context,
    ctx: obj,
    listening: listening
  })

  if (listening) {
    let listeners = obj._listeners || (obj._listeners = {})
    listeners[listening.id] = listening
  }

  return obj
}

// Inversion-of-control versions of `on`. Tell *this* object to listen to
// an event in another object... keeping track of what it's listening to
// for easier unbinding later.
Stratus.Events.listenTo = function (obj, name, callback) {
  if (!obj) {
    return this
  }
  let id = obj._listenId || (obj._listenId = _.uniqueId('l'))
  let listeningTo = this._listeningTo || (this._listeningTo = {})
  let listening = listeningTo[id]

  // This object is not listening to any other events on `obj` yet.
  // Setup the necessary references to track the listening callbacks.
  if (!listening) {
    let thisId = this._listenId || (this._listenId = _.uniqueId('l'))
    listening = listeningTo[id] = {
      obj: obj,
      objId: id,
      id: thisId,
      listeningTo: listeningTo,
      count: 0
    }
  }

  // Bind callbacks on obj, and keep track of them on listening.
  internalOn(obj, name, callback, this, listening)
  return this
}

// The reducing API that adds a callback to the `events` object.
let onApi = function (events, name, callback, options) {
  if (callback) {
    let handlers = events[name] || (events[name] = [])
    let context = options.context
    let ctx = options.ctx
    let listening = options.listening
    if (listening) {
      listening.count++
    }

    handlers.push({
      callback: callback,
      context: context,
      ctx: context || ctx,
      listening: listening
    })
  }
  return events
}

// Remove one or many callbacks. If `context` is null, removes all
// callbacks with that function. If `callback` is null, removes all
// callbacks for the event. If `name` is null, removes all bound
// callbacks for all events.
Stratus.Events.off = function (name, callback, context) {
  if (!this._events) {
    return this
  }
  this._events = eventsApi(offApi, this._events, name, callback, {
    context: context,
    listeners: this._listeners
  })
  return this
}

// Tell this object to stop listening to either specific events ... or
// to every object it's currently listening to.
Stratus.Events.stopListening = function (obj, name, callback) {
  let listeningTo = this._listeningTo
  if (!listeningTo) {
    return this
  }

  let ids = obj ? [obj._listenId] : _.keys(listeningTo)

  let i
  for (i = 0; i < ids.length; i++) {
    let listening = listeningTo[ids[i]]

    // If listening doesn't exist, this object is not currently
    // listening to obj. Break out early.
    if (!listening) {
      break
    }

    listening.obj.off(name, callback, this)
  }

  return this
}

// The reducing API that removes a callback from the `events` object.
let offApi = function (events, name, callback, options) {
  if (!events) {
    return
  }

  let i = 0
  let listening
  let context = options.context
  let listeners = options.listeners

  // Delete all events listeners and "drop" events.
  if (!name && !callback && !context) {
    let ids = _.keys(listeners)
    for (; i < ids.length; i++) {
      listening = listeners[ids[i]]
      delete listeners[listening.id]
      delete listening.listeningTo[listening.objId]
    }
    return
  }

  let names = name ? [name] : _.keys(events)
  for (; i < names.length; i++) {
    name = names[i]
    let handlers = events[name]

    // Bail out if there are no events stored.
    if (!handlers) {
      break
    }

    // Replace events if there are any remaining.  Otherwise, clean up.
    let remaining = []
    for (let j = 0; j < handlers.length; j++) {
      let handler = handlers[j]
      if (
        (callback && callback !== handler.callback && callback !== handler.callback._callback) ||
        (context && context !== handler.context)
      ) {
        remaining.push(handler)
      } else {
        listening = handler.listening
        if (listening && --listening.count === 0) {
          delete listeners[listening.id]
          delete listening.listeningTo[listening.objId]
        }
      }
    }

    // Update tail event if the list has any events.  Otherwise, clean up.
    if (remaining.length) {
      events[name] = remaining
    } else {
      delete events[name]
    }
  }
  return events
}

// Bind an event to only be triggered a single time. After the first time
// the callback is invoked, its listener will be removed. If multiple events
// are passed in using the space-separated syntax, the handler will fire
// once for each event, not once for a combination of all events.
Stratus.Events.once = function (name, callback, context) {
  // Map the event into a `{event: once}` object.
  let events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this))
  if (typeof name === 'string' && context == null) {
    callback = void 0
  }
  return this.on(events, callback, context)
}

// Inversion-of-control versions of `once`.
Stratus.Events.listenToOnce = function (obj, name, callback) {
  // Map the event into a `{event: once}` object.
  let events = eventsApi(onceMap, {}, name, callback,
    _.bind(this.stopListening, this, obj))
  return this.listenTo(obj, events)
}

// Reduces the event callbacks into a map of `{event: onceWrapper}`.
// `offer` unbinds the `onceWrapper` after it has been called.
let onceMap = function (map, name, callback, offer) {
  if (callback) {
    let once = map[name] = _.once(function () {
      offer(name, once)
      callback.apply(this, arguments)
    })
    once._callback = callback
  }
  return map
}

// Trigger one or many events, firing all bound callbacks. Callbacks are
// passed the same arguments as `trigger` is, apart from the event name
// (unless you're listening on `"all"`, which will cause your callback to
// receive the true name of the event as the first argument).
Stratus.Events.trigger = function (name) {
  if (!this._events) {
    return this
  }

  let length = Math.max(0, arguments.length - 1)
  let args = Array(length)
  let i
  for (i = 0; i < length; i++) {
    args[i] = arguments[i + 1]
  }

  eventsApi(triggerApi, this._events, name, void 0, args)
  return this
}

// Handles triggering the appropriate event callbacks.
let triggerApi = function (objEvents, name, callback, args) {
  if (objEvents) {
    let events = objEvents[name]
    let allEvents = objEvents.all
    if (events && allEvents) {
      allEvents = allEvents.slice()
    }
    if (events) {
      triggerEvents(events, args)
    }
    if (allEvents) {
      triggerEvents(allEvents, [name].concat(args))
    }
  }
  return objEvents
}

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy (most internal
// Backbone events have 3 arguments).
let triggerEvents = function (events, args) {
  let ev
  let i = -1
  let l = events.length
  let a1 = args[0]
  let a2 = args[1]
  let a3 = args[2]
  switch (args.length) {
    case 0:
      while (++i < l) {
        (ev = events[i]).callback.call(ev.ctx)
      }
      return
    case 1:
      while (++i < l) {
        (ev = events[i]).callback.call(ev.ctx, a1)
      }
      return
    case 2:
      while (++i < l) {
        (ev = events[i]).callback.call(ev.ctx, a1, a2)
      }
      return
    case 3:
      while (++i < l) {
        (ev = events[i]).callback.call(ev.ctx, a1, a2, a3)
      }
      return
    default:
      while (++i < l) {
        (ev = events[i]).callback.apply(ev.ctx, args)
      }
  }
}

// Aliases for backwards compatibility.
Stratus.Events.bind = Stratus.Events.on
Stratus.Events.unbind = Stratus.Events.off
