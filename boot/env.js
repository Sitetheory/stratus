// Environment
// -----------

/* global cacheTime, config */

// Global Tools
var hamlet = {}
hamlet.isCookie = function (key) {
  return typeof document.cookie === 'string' && document.cookie.indexOf(key + '=') !== -1
}
hamlet.isUndefined = function (key) {
  return undefined === this[key]
}.bind(this)

// Initial Setup
if (hamlet.isUndefined('boot')) {
  var boot = {}
}

// Backward Compatibility
if (!hamlet.isUndefined('cacheTime')) {
  boot.cacheTime = cacheTime
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
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      destination[key] = (typeof destination[key] === 'object') ? boot.merge(
        destination[key], source[key]) : source[key]
    }
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
  var args = [
    boot.configuration,
    !configuration.paths ? { paths: configuration } : configuration
  ]
  if (typeof boot.merge === 'function') {
    boot.merge.apply(this, options.inverse ? args.reverse() : args)
  }
  return requirejs.config ? requirejs.config(boot.configuration) : boot.configuration
  /* */
  return boot.merge(boot.configuration, !configuration.paths ? {paths: configuration} : configuration)
}

// Initialization
if (typeof config !== 'undefined') {
  var localConfig = typeof config === 'function' ? config(boot) : config
  if (typeof localConfig === 'object' && localConfig) {
    boot.config(localConfig)
  }
}
