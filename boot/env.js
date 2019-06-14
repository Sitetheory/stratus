// Environment
// -----------

(function (root) {
  // To be or not to be...
  const hamlet = root.hamlet = {}
  root.hamlet.isCookie = function (key) {
    return typeof document.cookie === 'string' && document.cookie.indexOf(key + '=') !== -1
  }
  hamlet.isUndefined = function (key) {
    return undefined === this[key]
  }.bind(root)

  // Contextual Boot
  if (hamlet.isUndefined('boot')) {
    root.boot = {}
  }

  // Localize
  const boot = root.boot

  // Backward Compatibility
  if (!hamlet.isUndefined('cacheTime')) {
    boot.cacheTime = root.cacheTime
  }

  // Environment
  boot.dev = hamlet.isCookie('env')
  boot.local = hamlet.isCookie('local')
  boot.cacheTime = boot.cacheTime || '2'

  // Locations
  boot.host = boot.host || ''
  boot.cdn = boot.cdn || '/'
  boot.relative = boot.relative || ''
  boot.bundle = boot.bundle || ''

  // Require.js
  boot.configuration = boot.configuration || {}

  // Min Settings
  boot.suffix = (boot.dev) ? '' : '.min'
  boot.dashSuffix = (boot.dev) ? '' : '-min'
  boot.directory = (boot.dev) ? '' : 'min/'

  // Merge Tool
  boot.merge = function (destination, source) {
    if (destination === null || source === null) {
      return destination
    }
    for (let key in source) {
      if (!source.hasOwnProperty(key)) {
        continue
      }
      if (Array.isArray(destination[key])) {
        if (!Array.isArray(source[key])) {
          console.warn('boot:', key, 'is not an array in all configurations.')
          continue
        }
        destination[key] = destination[key].concat(source[key])
        continue
      }
      if (typeof destination[key] === 'object' && destination[key]) {
        destination[key] = boot.merge(destination[key], source[key])
        continue
      }
      destination[key] = source[key]
    }
    return destination
  }

  // Config Tool
  boot.config = function (configuration, options) {
    if (typeof configuration !== 'object') {
      return false
    }
    /* *
    if (typeof options !== 'object') options = {}
    let args = [
      boot.configuration,
      !configuration.paths ? { paths: configuration } : configuration
    ]
    if (typeof boot.merge === 'function') {
      boot.merge.apply(this, options.inverse ? args.reverse() : args)
    }
    return requirejs.config ? requirejs.config(boot.configuration) : boot.configuration
    /* */
    return boot.merge(boot.configuration, !configuration.paths ? { paths: configuration } : configuration)
  }

  // Initialization
  if (!hamlet.isUndefined('config')) {
    let localConfig = typeof root.config === 'function' ? root.config(boot) : root.config
    if (typeof localConfig === 'object' && localConfig) {
      boot.config(localConfig)
    }
  }

  // Chain Require for Backwards Compatibility
  if (typeof root.require === 'undefined') {
    root.require = function (requirements, callback) {
      const System = root.System
      if (typeof System === 'undefined') {
        return
      }
      const tracker = {
        loaded: 0,
        total: requirements.length,
        modules: {}
      }
      requirements.forEach(function (requirement) {
        System.import(requirement)
          .then(function (module) {
            tracker.modules[requirement] = module
            if (++tracker.loaded !== tracker.total) {
              return
            }
            if (typeof callback !== 'function') {
              return
            }
            callback.apply(root, requirements.map(function(key) {
              return tracker.modules[key];
            }))
          })
      })
    }
  }
})(this)
