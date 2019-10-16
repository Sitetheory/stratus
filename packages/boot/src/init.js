// Initializer
// -----------

(function (root) {
  // Ensure Boot is available
  if (typeof root.boot === 'undefined') {
    console.error('boot does not exist!')
    return
  }

  // Localize Dependencies
  const boot = root.boot
  const requirejs = root.requirejs
  const System = root.System
  const steal = root.steal

  // Configure Require.js
  if (typeof requirejs !== 'undefined') {
    // TODO: We need to clone the boot configuration because Require.js will change the reference directly
    requirejs.config(boot.configuration)
  }

  // Configure steal.js
  if (typeof steal !== 'undefined' && typeof steal.config === 'function') {
    // Require.js Config Conversion
    const config = boot.configuration
    config.baseURL = typeof config.baseUrl === 'string' ? config.baseUrl : '/'
    config.cacheKey = 'v'
    config.cacheVersion = boot.cacheTime
    // config.configMain = '@empty'
    if (typeof config.paths === 'object' && config.paths) {
      for (const path in config.paths) {
        if (!Object.prototype.hasOwnProperty.call(config.paths, path)) {
          continue
        }
        config.paths[path] = config.paths[path] + '.js'
      }
    }
    // Inject into Steal.js
    steal.config(config)
  }

  // Configure System.js
  if (typeof System !== 'undefined' && typeof System.config === 'function') {
    System.config(boot.configuration)
  }

  // Begin Warm-Up
  if (typeof System !== 'undefined' && typeof System.import === 'function') {
    System.import('@stratusjs/runtime/stratus')
      .then(function () {
        console.log('Stratus initialized through Steal.js')
      })
  } else if (typeof require !== 'undefined') {
    require(['@stratusjs/runtime/stratus'])
  }
})(this)
