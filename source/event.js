/* global Stratus */

// Stratus Event System
// --------------------

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
Stratus.Events = new EventManager()

// Aliases for backwards compatibility.
Stratus.Events.bind = Stratus.Events.on
Stratus.Events.unbind = Stratus.Events.off
