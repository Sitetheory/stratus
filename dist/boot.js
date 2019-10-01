// Environment
// -----------

(function (root) {
  // To be or not to be...
  const hamlet = root.hamlet = {}
  hamlet.isCookie = function (key) {
    return typeof document.cookie === 'string' && document.cookie.indexOf(key + '=') !== -1
  }
  hamlet.isUndefined = function (key) {
    return undefined === this[key]
  }.bind(root)
  hamlet.delay = function (ms) {
    return new Promise(function (resolve, reject) {
      return setTimeout(resolve, ms)
    })
  }

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
    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
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
    const localConfig = typeof root.config === 'function' ? root.config(boot) : root.config
    if (typeof localConfig === 'object' && localConfig) {
      boot.config(localConfig)
    }
  }

  // Chain Require for Backwards Compatibility
  if (typeof root.require !== 'function') {
    const cache = {}
    root.require = function (requirements, callback) {
      /* *
      const require = root.requirejs
      if (typeof require === 'function') {
        return require(requirements, callback)
      }
      /* */
      const System = root.System
      if (typeof System === 'undefined' || !requirements) {
        return
      }
      // Handle Node-like Syntax
      if (typeof requirements === 'string' && typeof callback === 'undefined') {
        // Skip await for Quill
        if (requirements === 'quill' && requirements in cache) {
          return cache[requirements]
        }

        System.import(requirements)
          .then(function (module) {
            cache[requirements] = module
          }).catch(function (error) {
            console.error(error)
          })

        const debug = hamlet.isCookie('env')

        // start polling at an interval until the data is found at the global
        const poll = async function () {
          const delay = await hamlet.delay(100)
          if (debug) {
            console.log(`${requirements} poll:`, delay)
          }
          const data = cache[requirements]
          if (!data) {
            return poll()
          }
          return data
        }

        return poll()
      }
      // Handle require-like syntax
      requirements = Array.isArray(requirements) ? requirements : [requirements]
      const tracker = {
        loaded: 0,
        total: requirements.length,
        modules: {}
      }
      const shim = boot.configuration.shim || {}
      const load = function (requirement) {
        // hamlet.dependencies = hamlet.dependencies || {}
        // hamlet.dependencies[requirement] = hamlet.dependencies[requirement] || []
        // hamlet.dependencies[requirement].push(callback)
        return System.import(requirement.replace(/(\.js)$/, ''))
          .then(function (module) {
            const wrap = shim[requirement] || {}
            tracker.modules[requirement] = wrap.exports ? root[wrap.exports] : module
            cache[requirement] = tracker.modules[requirement]
            if (++tracker.loaded !== tracker.total) {
              return
            }
            if (typeof callback !== 'function') {
              return
            }
            callback.apply(root, requirements.map(function (key) {
              return tracker.modules[key]
            }))
          })
          .catch(function (error) {
            console.error(error)
          })
      }
      requirements.forEach(function (requirement) {
        const wrap = shim[requirement] || {}
        if (wrap.deps) {
          root.require(wrap.deps, function () {
            load(requirement)
          })
          return
        }
        load(requirement)
      })
    }
  }
})(this); // eslint-disable-line semi

// Configuration
// -------------

(function (root) {
  const boot = root.boot
  /*
  The Stratus config.js has the bare minimum configuration needed to run Stratus, but additional Components, Directives, Filters, Controllers, and Services exist in the "extras" folder, which you can enable for your project if any of them are useful. You will define a custom config.js to point to the desired file in Stratus/extras folder. You should also setup Bowser (bowers.json) file to load any desired third party components, e.g. Froala.

  Note: some components or services may require dependencies, that must be defined. If these are Stratus "extras" they should be enabled here in the config.js file only if you need them.
   */

  boot.config({

    // Connection Settings
    waitSeconds: 30,

    // Cache Busting
    urlArgs: 'v=' + boot.cacheTime,

    // Version Location (Disabled During Beta Testing)
    baseUrl: ((boot.dev || boot.local) ? boot.host + '/' : boot.cdn) + boot.relative,
    bundlePath: (boot.bundle || '') + 'stratus/',

    /* Dependencies */
    // NOTE: most of these dependencies are for "extras" that may be enabled in a project config.js. THESE SHOULD BE ENABLED IN YOUR PROJECT'S config.js
    shim: {},

    // Package Directories
    packages: [],

    // Relative Paths
    paths: {

      /* Stratus Core Library */
      stratus: boot.bundle + 'stratus/dist/stratus' + boot.suffix,

      // CONTROLLERS:
      // ------------
      // 'stratus.controllers.*': boot.bundle + 'stratus/controllers/*' + boot.suffix,
      'stratus.controllers.generic': boot.bundle + 'stratus/controllers/generic' + boot.suffix,

      // SERVICES:
      // ---------
      'stratus.services.*': boot.bundle + 'stratus/services/*' + boot.suffix,
      'stratus.services.model': boot.bundle + 'stratus/services/model' + boot.suffix,
      'stratus.services.collection': boot.bundle + 'stratus/services/collection' + boot.suffix,
      'stratus.services.registry': boot.bundle + 'stratus/services/registry' + boot.suffix,
      'stratus.services.details': boot.bundle + 'stratus/services/details' + boot.suffix,

      // COMPONENTS:
      // -----------
      // 'stratus.components.*': boot.bundle + 'stratus/components/*' + boot.suffix,
      'stratus.components.base': boot.bundle + 'stratus/components/base' + boot.suffix,

      // DIRECTIVES:
      // -----------
      // 'stratus.directives.*': boot.bundle + 'stratus/directives/*' + boot.suffix,
      'stratus.directives.base': boot.bundle + 'stratus/directives/base' + boot.suffix,

      // THIRD PARTY: NODE MODULES

      /* Lodash is used in place of Underscore in most modern components */
      lodash: boot.bundle + 'stratus/node_modules/lodash/lodash' + boot.suffix,

      /* THIRD PARTY: Bowser */
      bowser: boot.bundle + 'stratus/node_modules/bowser/bundled',
      'bowser-legacy': boot.bundle + 'stratus/node_modules/bowser-legacy/bowser' + boot.suffix,

      /* THIRD PARTY: Interpreters */
      // coffee: boot.bundle + 'stratus/node_modules/coffeescript/docs/v2/browser-compiler/coffeescript',
      // less: boot.bundle + 'stratus/node_modules/less/dist/less' + boot.suffix,

      /* THIRD PARTY: jQuery */
      // TODO: convert all instances of jQuery to use Stratus selector if possible.
      // jQuery is currently used in a lot of components and directives that probably don't need it, since they are just
      // using the selector so they could just the Stratus Selector: Stratus('div')
      'jquery-native': boot.bundle + 'stratus/node_modules/jquery/dist/jquery' + boot.suffix,

      /* STRATUS ELEMENTS: enabled in your project as you need them  */

      /* STRATUS CONTROLLERS */

      /* STRATUS CONTROLLERS: Angular */
      // 'stratus.controllers.dialogue': boot.bundle + 'stratus/extras/controllers/dialogue' + boot.suffix,
      // 'stratus.controllers.panel': boot.bundle + 'stratus/extras/controllers/panel' + boot.suffix,

      /* STRATUS DIRECTIVES: */
      // 'stratus.directives.href': boot.bundle + 'stratus/extras/directives/href' + boot.suffix,
      // 'stratus.directives.singleClick': boot.bundle + 'stratus/extras/directives/singleClick' + boot.suffix,
      // 'stratus.directives.onScreen': boot.bundle + 'stratus/extras/directives/onScreen' + boot.suffix,
      // 'stratus.directives.src': boot.bundle + 'stratus/extras/directives/src' + boot.suffix,
      // 'stratus.directives.trigger': boot.bundle + 'stratus/extras/directives/trigger' + boot.suffix,
      // 'stratus.directives.validate': boot.bundle + 'stratus/extras/directives/validate' + boot.suffix,
      // 'stratus.directives.compileTemplate': boot.bundle + 'stratus/extras/directives/compileTemplate' + boot.suffix,
      // 'stratus.directives.stringToNumber': boot.bundle + 'stratus/extras/directives/stringToNumber' + boot.suffix,
      // 'stratus.directives.timestampToDate': boot.bundle + 'stratus/extras/directives/timestampToDate' + boot.suffix,
      // 'stratus.directives.drag': boot.bundle + '/stratus/extras/directives/drag' + boot.suffix,
      // 'stratus.directives.drop': boot.bundle + '/stratus/extras/directives/drop' + boot.suffix,

      /* STRATUS NORMALIZERS: */
      // NOTE: this sandboxes jquery into require so it's not in the window
      jquery: boot.bundle + 'stratus/extras/normalizers/jquery.sandbox' + boot.suffix

      /* STRATUS FILTERS */
      // 'stratus.filters.age': boot.bundle + 'stratus/extras/filters/age' + boot.suffix,
      // 'stratus.filters.map': boot.bundle + 'stratus/extras/filters/map' + boot.suffix,
      // 'stratus.filters.reduce': boot.bundle + 'stratus/extras/filters/reduce' + boot.suffix,
      // 'stratus.filters.truncate': boot.bundle + 'stratus/extras/filters/truncate' + boot.suffix,

      /* STRATUS FILTERS: Gravatar and Libraries */
      // 'stratus.filters.gravatar': boot.bundle + 'stratus/extras/filters/gravatar' + boot.suffix,
      // md5: boot.bundle + 'stratus/node_modules/js-md5/build/md5.min',

      /* STRATUS FILTERS: Moment and libraries */
      // 'stratus.filters.moment': boot.bundle + 'stratus/extras/filters/moment' + boot.suffix,
      // moment: boot.bundle + 'stratus/node_modules/moment/' + boot.directory + 'moment' + boot.suffix,
      // 'moment-timezone': boot.bundle + 'stratus/node_modules/moment-timezone/builds/moment-timezone-with-data' + boot.suffix,
      // 'moment-range': boot.bundle + 'stratus/node_modules/moment-range/dist/moment-range' + boot.suffix,

      /*
      // STRATUS EXTRAS: Extra features that are used from the Stratus core "extras" library
      //  */

      /* STRATUS EXTRAS - COMPONENTS: Calendar and Libraries */
      // 'stratus.components.calendar': boot.bundle + 'stratus/extras/components/calendar/calendar' + boot.suffix,
      // '@fullcalendar/core': boot.bundle + 'stratus/node_modules/@fullcalendar/core/main' + boot.suffix,
      // '@fullcalendar/daygrid': boot.bundle + 'stratus/node_modules/@fullcalendar/daygrid/main' + boot.suffix,
      // '@fullcalendar/timegrid': boot.bundle + 'stratus/node_modules/@fullcalendar/timegrid/main' + boot.suffix,
      // '@fullcalendar/list': boot.bundle + 'stratus/node_modules/@fullcalendar/list/main' + boot.suffix,
      // 'fullcalendar/customView': boot.bundle + 'stratus/extras/components/calendar/customView' + boot.suffix,
      // ical: boot.bundle + 'stratus/node_modules/ical.js/build/ical' + boot.suffix,
      // 'stratus.services.iCal': boot.bundle + 'stratus/extras/services/iCal' + boot.suffix,

      /* STRATUS EXTRAS - COMPONENTS: Carousel and libraries */
      // 'stratus.components.carousel': boot.bundle + 'stratus/extras/components/carousel' + boot.suffix,
      // swiper: boot.bundle + 'stratus/node_modules/swiper/dist/js/swiper' + boot.suffix,

      /* STRATUS COMPONENTS: Social Media */
      // Not Currently Used: this is a way to enable facebook components for a specific facebook page (component not 100% finished for general use)
      // 'stratus.components.facebook': boot.bundle + 'stratus/extras/components/facebook' + boot.suffix,

      /* STRATUS LIBRARY: Angular */
      // '@angular/*': boot.bundle + 'stratus/node_modules/@angular/*/bundles/*.umd' + boot.suffix,
      // '@angular/animations': boot.bundle + 'stratus/node_modules/@angular/animations/bundles/animations.umd' + boot.suffix,
      // '@angular/animations/*': boot.bundle + 'stratus/node_modules/@angular/animations/bundles/animations-*.umd' + boot.suffix,
      // '@angular/cdk': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk.umd' + boot.suffix,
      // '@angular/cdk/*': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-*.umd' + boot.suffix,
      // '@angular/common': boot.bundle + 'stratus/node_modules/@angular/common/bundles/common.umd' + boot.suffix,
      // '@angular/common/*': boot.bundle + 'stratus/node_modules/@angular/common/bundles/common-*.umd' + boot.suffix,
      // '@angular/compiler': boot.bundle + 'stratus/node_modules/@angular/compiler/bundles/compiler.umd' + boot.suffix,
      // '@angular/core': boot.bundle + 'stratus/node_modules/@angular/core/bundles/core.umd' + boot.suffix,
      // '@angular/flex-layout': boot.bundle + 'stratus/node_modules/@angular/flex-layout/bundles/flex-layout.umd' + boot.suffix,
      // '@angular/forms': boot.bundle + 'stratus/node_modules/@angular/forms/bundles/forms.umd' + boot.suffix,
      // '@angular/material': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material.umd' + boot.suffix,
      // '@angular/material/*': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-*.umd' + boot.suffix,
      // '@angular/material-moment-adapter': boot.bundle + 'stratus/node_modules/@angular/material-moment-adapter/bundles/material-moment-adapter.umd' + boot.suffix,
      // '@angular/platform-browser': boot.bundle + 'stratus/node_modules/@angular/platform-browser/bundles/platform-browser.umd' + boot.suffix,
      // '@angular/platform-browser/*': boot.bundle + 'stratus/node_modules/@angular/platform-browser/bundles/platform-browser-*.umd' + boot.suffix,
      // '@angular/platform-browser-dynamic': boot.bundle + 'stratus/node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd' + boot.suffix,

      // STRATUS SRC: All
      // '@stratusjs/angular/*': 'node_modules/@stratusjs/angular/src/*' + boot.suffix,
      // '@stratusjs/boot/*': 'node_modules/@stratusjs/boot/src/*' + boot.suffix,
      // '@stratusjs/core/*': 'node_modules/@stratusjs/core/src/*' + boot.suffix,
      // '@stratusjs/idx/*': 'node_modules/@stratusjs/idx/src/*' + boot.suffix,
      // '@stratusjs/react/*': 'node_modules/@stratusjs/react/src/*' + boot.suffix,

      // Angular Dependencies
      // 'core-js/*': 'node_modules/core-js/*',
      // 'core-js/es7/reflect': 'node_modules/core-js/proposals/reflect-metadata',
      // hammerjs: 'node_modules/hammerjs/hammer' + boot.suffix,
      // rxjs: 'node_modules/rxjs/bundles/rxjs.umd' + boot.suffix,
      // 'rxjs/operators': 'extras/normalizers/rxjs.operators' + boot.suffix,
      // 'rxjs-compat': 'node_modules/rxjs-compat/index',
      // 'web-animations-js': 'node_modules/web-animations-js/web-animations.min',
      // 'zone.js/dist/zone': 'node_modules/zone.js/dist/zone' + boot.suffix,

      // Quill Editor Support
      // quill: 'node_modules/quill/dist/quill',
      // 'ngx-quill': 'node_modules/ngx-quill/bundles/ngx-quill.umd'

      // Angular

      /* STRATUS EXTRAS: Angular.js: required for almost all extras and lots of others */
      // angular: boot.bundle + 'stratus/node_modules/angular/angular' + boot.suffix,
      // 'angular-animate': boot.bundle + 'stratus/node_modules/angular-animate/angular-animate' + boot.suffix,
      // 'angular-aria': boot.bundle + 'stratus/node_modules/angular-aria/angular-aria' + boot.suffix,
      // 'angular-material': boot.bundle + 'stratus/node_modules/angular-material/angular-material' + boot.suffix,
      // 'angular-messages': boot.bundle + 'stratus/node_modules/angular-messages/angular-messages' + boot.suffix,
      // 'angular-resource': boot.bundle + 'stratus/node_modules/angular-resource/angular-resource' + boot.suffix,
      // 'angular-sanitize': boot.bundle + 'stratus/node_modules/angular-sanitize/angular-sanitize' + boot.suffix,

      /* STRATUS EXTRAS: Angular.js Modules */

      // 'angular-chart': boot.bundle + 'stratus/node_modules/angular-chart.js/dist/angular-chart' + boot.suffix,
      // 'angular-drag-and-drop-lists': boot.bundle + 'stratus/node_modules/angular-drag-and-drop-lists/angular-drag-and-drop-lists' + boot.suffix,
      // 'angular-icons': boot.bundle + 'stratus/node_modules/angular-material-icons/angular-material-icons' + boot.suffix,
      // 'angular-file-upload': boot.bundle + 'stratus/node_modules/ng-file-upload/dist/ng-file-upload' + boot.suffix,
      // 'angular-paging': boot.bundle + 'stratus/node_modules/angular-paging/dist/paging' + boot.suffix,
      // 'angular-scrollSpy': boot.bundle + 'stratus/node_modules/angular-scroll-spy/angular-scroll-spy',
      // 'angular-ui-tree': boot.bundle + 'stratus/node_modules/angular-ui-tree/dist/angular-ui-tree' + boot.suffix,

      /* STRATUS EXTRAS: Chart */
      // chart: boot.bundle + 'stratus/node_modules/chart.js/dist/Chart',

      /* STRATUS EXTRAS: Masonry */
      // 'masonry-native': boot.bundle + 'stratus/node_modules/masonry-layout/dist/masonry.pkgd' + boot.suffix,
      // masonry: boot.bundle + 'stratus/extras/directives/masonry' + boot.suffix,

    }
  })
})(this); // eslint-disable-line semi

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
    System.import('stratus')
      .then(function () {
        console.log('Stratus initialized through Steal.js')
      })
  } else if (typeof require !== 'undefined') {
    require(['stratus'])
  }
})(this)
