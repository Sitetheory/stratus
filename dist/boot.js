// Environment
// -----------

/* global cacheTime, config */

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
    for (let key in source) {
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
    let localConfig = typeof config === 'function' ? config(boot) : config
    if (typeof localConfig === 'object' && localConfig) {
      boot.config(localConfig)
    }
  }
})(this)

// Configuration
// -------------

/* global boot */

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

  // Dependencies
  shim: {

    /* Angular */
    angular: {
      exports: 'angular'
    },
    'angular-aria': {
      deps: ['angular']
    },
    'angular-animate': {
      deps: ['angular']
    },
    'angular-messages': {
      deps: ['angular']
    },
    'angular-material': {
      deps: [
        'angular-aria',
        'angular-animate',
        'angular-messages'
      ]
    },
    'angular-resource': {
      deps: ['angular']
    },
    'angular-sanitize': {
      deps: ['angular']
    },

    /* Angular Modules */
    'angular-file-upload': {
      deps: ['angular']
    },
    'angular-icons': {
      deps: ['angular']
    },
    'angular-scrollSpy': {
      deps: ['angular']
    },
    'angular-ui-tree': {
      deps: ['angular']
    },

    // Charts
    'chart.js': {
      deps: ['angular', 'chart']
    },

    /* Froala */
    'froala-align': {
      deps: ['froala']
    },
    'froala-char-counter': {
      deps: ['froala']
    },
    'froala-code-beautifier': {
      deps: ['froala']
    },
    'froala-code-view': {
      deps: ['froala']
    },
    'froala-colors': {
      deps: ['froala']
    },
    'froala-draggable': {
      deps: ['froala']
    },
    'froala-emoticons': {
      deps: ['froala']
    },
    'froala-entities': {
      deps: ['froala']
    },
    'froala-file': {
      deps: ['froala']
    },
    'froala-font-family': {
      deps: ['froala']
    },
    'froala-font-size': {
      deps: ['froala']
    },
    'froala-forms': {
      deps: ['froala']
    },
    'froala-fullscreen': {
      deps: ['froala']
    },
    'froala-help': {
      deps: ['froala']
    },
    'froala-image': {
      deps: ['froala']
    },
    'froala-image-manager': {
      deps: ['froala', 'froala-image']
    },
    'froala-inline-style': {
      deps: ['froala']
    },
    'froala-line-breaker': {
      deps: ['froala']
    },
    'froala-link': {
      deps: ['froala']
    },
    'froala-lists': {
      deps: ['froala']
    },
    'froala-paragraph-format': {
      deps: ['froala']
    },
    'froala-paragraph-style': {
      deps: ['froala']
    },
    'froala-quick-insert': {
      deps: ['froala']
    },
    'froala-quote': {
      deps: ['froala']
    },
    'froala-save': {
      deps: ['froala']
    },
    'froala-special-characters': {
      deps: ['froala']
    },
    'froala-table': {
      deps: ['froala']
    },
    'froala-url': {
      deps: ['froala']
    },
    'froala-video': {
      deps: ['froala']
    },
    'froala-word-paste': {
      deps: ['froala']
    },
    'angular-froala': {
      deps: ['angular', 'froala']
    },
    'angular-drag-and-drop-lists': {
      deps: ['angular']
    },

    /* Calendar */
    fullcalendar: {
      deps: [
        'jquery',
        'moment'
      ]
    }
  },

  // Package Directories
  packages: [
    /**
     {
         name: 'stratus',
         location: boot.bundle + 'stratus',
         main: 'stratus'
     },
     **/
    // Enabled For Editor
    {
      name: 'codemirror',
      location: boot.bundle + 'stratus/bower_components/codemirror',
      main: 'lib/codemirror'
    }
  ],

  // Relative Paths
  paths: {

    /* Require.js Plugins */
    // This is used to load raw TEXT in templates (e.g. via require.js) -- in most cases we use Angular
    text: boot.bundle + 'stratus/bower_components/text/text',

    /* Stratus Core Library */
    stratus: boot.bundle + 'stratus/dist/stratus' + boot.suffix,

    // CONTROLLERS:
    // ------------
    'stratus.controllers.generic': boot.bundle + 'stratus/controllers/generic' + boot.suffix,

    // SERVICES:
    // ---------
    'stratus.services.model': boot.bundle + 'stratus/services/model' + boot.suffix,
    'stratus.services.collection': boot.bundle + 'stratus/services/collection' + boot.suffix,
    'stratus.services.registry': boot.bundle + 'stratus/services/registry' + boot.suffix,
    'stratus.services.details': boot.bundle + 'stratus/services/details' + boot.suffix,

    // COMPONENTS:
    // -----------
    'stratus.components.base': boot.bundle + 'stratus/components/base' + boot.suffix,

    // DIRECTIVES:
    // -----------
    'stratus.directives.base': boot.bundle + 'stratus/directives/base' + boot.suffix,
    // Used for extras/directives/drag.js, drop.js
    'stratus.directives.drag': boot.bundle + '/stratus/extras/directives/drag' + boot.suffix,
    'stratus.directives.drop': boot.bundle + '/stratus/extras/directives/drop' + boot.suffix,
    // Used for extras/directives/carousel.js
    'stratus.directives.src': boot.bundle + 'stratus/extras/directives/src' + boot.suffix,

    'stratus.directives.froala': boot.bundle + 'stratus/extras/directives/froala' + boot.suffix,
    'stratus.directives.redactor': boot.bundle + 'stratus/extras/directives/redactor' + boot.suffix,

    // THIRD PARTY: BOWER COMPONENTS
    // -----------------------------
    // promise: boot.bundle + 'stratus/bower_components/promise-polyfill/promise' + boot.suffix,
    // Used by extras/filters/gravatar.js
    md5: boot.bundle + 'stratus/bower_components/js-md5/build/md5.min',
    underscore: boot.bundle + 'stratus/bower_components/underscore/underscore' + boot.dashSuffix,

    /* Bowser */
    // TODO: Determine if this needs to be in config.js
    bowser: boot.bundle + 'stratus/bower_components/bowser/src/bowser',

    /* Interpreters */
    coffee: boot.bundle + 'stratus/bower_components/coffeescript/docs/v2/browser-compiler/coffeescript',
    less: boot.bundle + 'stratus/bower_components/less/dist/less' + boot.suffix,

    // REQUIRED DEPENDENCIES FOR EXTRAS:
    // TODO: determine if we should keep these defined permanently or require that a user define these in their custom config.js

    // TODO: convert all instances of jQuery to use Stratus selector if possible.
    // jQuery is currently used in a lot of components and directives that probably don't need it, since they are just
    // using the selector so they could just the Stratus Selector: Stratus('div')
    // NOTE: this sandboxes jquery into require so it's not in the window
    'jquery-native': boot.bundle + 'stratus/bower_components/jquery/dist/jquery' + boot.suffix,
    jquery: boot.bundle + 'stratus/extras/normalizers/jquery.sandbox' + boot.suffix,

    /* Common Libraries */
    // Required for extras/filters/moment.js
    moment: boot.bundle + 'stratus/bower_components/moment/' + boot.directory + 'moment' + boot.suffix,

    // Required for extras/components/calendar.js
    fullcalendar: boot.bundle + 'stratus/bower_components/fullcalendar/dist/fullcalendar' + boot.suffix,
    'stratus.services.iCal': boot.bundle + 'stratus/extras/services/iCal' + boot.suffix,
    'stratus.components.calendar.timezones': boot.bundle + 'stratus/components/calendar.timezones' + boot.suffix,
    'moment-timezone': boot.bundle + 'stratus/bower_components/moment-timezone/builds/moment-timezone-with-data' + boot.suffix,
    'moment-range': boot.bundle + 'stratus/bower_components/moment-range/dist/moment-range' + boot.suffix,

    // Required for extras/components/carousel.js
    swiper: boot.bundle + 'stratus/bower_components/swiper/dist/js/swiper' + boot.suffix,
    // Required for extras/directives/skrollr.js
    'skrollr-native': boot.bundle + 'stratus/bower_components/skrollr/' + (boot.dev ? 'src' : 'dist') + '/skrollr' + boot.suffix,
    'skrollr': boot.bundle + 'stratus/extras/normalizers/skrollr.init' + boot.suffix,

    /* Angular: required for almost all extras and lots of others */
    angular: boot.bundle + 'stratus/bower_components/angular/angular' + boot.suffix,
    'angular-animate': boot.bundle + 'stratus/bower_components/angular-animate/angular-animate' + boot.suffix,
    'angular-aria': boot.bundle + 'stratus/bower_components/angular-aria/angular-aria' + boot.suffix,
    'angular-material': boot.bundle + 'stratus/bower_components/angular-material/angular-material' + boot.suffix,
    'angular-messages': boot.bundle + 'stratus/bower_components/angular-messages/angular-messages' + boot.suffix,
    'angular-resource': boot.bundle + 'stratus/bower_components/angular-resource/angular-resource' + boot.suffix,
    'angular-sanitize': boot.bundle + 'stratus/bower_components/angular-sanitize/angular-sanitize' + boot.suffix,

    /* Angular Modules */
    'angular-chart': boot.bundle + 'stratus/bower_components/angular-chart.js/dist/angular-chart' + boot.suffix,
    'angular-drag-and-drop-lists': boot.bundle + 'stratus/bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists' + boot.suffix,
    'angular-icons': boot.bundle + 'stratus/bower_components/angular-material-icons/angular-material-icons' + boot.suffix,
    'angular-file-upload': boot.bundle + 'stratus/bower_components/ng-file-upload/ng-file-upload' + boot.suffix,
    'angular-paging': boot.bundle + 'stratus/bower_components/angular-paging/dist/paging' + boot.suffix,
    'angular-sortable': boot.bundle + 'stratus/bower_components/ng-sortable/angular-legacy-sortable' + boot.suffix,
    'angular-scrollSpy': boot.bundle + 'stratus/bower_components/angular-scroll-spy/angular-scroll-spy',
    'angular-ui-tree': boot.bundle + 'stratus/bower_components/angular-ui-tree/dist/angular-ui-tree' + boot.suffix,

    /* Froala Libraries */
    froala: boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/froala_editor.min',
    'froala-align': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/align.min',
    'froala-char-counter': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/char_counter.min',
    'froala-code-beautifier': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/code_beautifier.min',
    'froala-code-view': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/code_view.min',
    'froala-colors': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/colors.min',
    'froala-draggable': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/draggable.min',
    'froala-emoticons': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/emoticons.min',
    'froala-entities': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/entities.min',
    'froala-file': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/file.min',
    'froala-font-family': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/font_family.min',
    'froala-font-size': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/font_size.min',
    'froala-forms': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/forms.min',
    'froala-fullscreen': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/fullscreen.min',
    'froala-help': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/help.min',
    'froala-image': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/image.min',
    'froala-image-manager': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/image_manager.min',
    'froala-inline-style': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/inline_style.min',
    'froala-line-breaker': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/line_breaker.min',
    'froala-link': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/link.min',
    'froala-lists': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/lists.min',
    'froala-paragraph-format': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/paragraph_format.min',
    'froala-paragraph-style': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/paragraph_style.min',
    'froala-quick-insert': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/quick_insert.min',
    'froala-quote': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/quote.min',
    'froala-save': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/save.min',
    'froala-special-characters': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/special_characters.min',
    'froala-table': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/table.min',
    'froala-url': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/url.min',
    'froala-video': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/video.min',
    'froala-word-paste': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/word_paste.min',
    'angular-froala': boot.bundle + 'stratus/bower_components/angular-froala/src/angular-froala',

    /* Common Libraries */
    chart: boot.bundle + 'stratus/bower_components/chart.js/dist/Chart'

  }
})

// Initializer
// -----------

/* global boot, requirejs, require */

// TODO: We need to clone the boot configuration because Require.js will change
// the reference directly

// Configure Require.js
requirejs.config(boot.configuration)

// Begin Warm-Up
require(['stratus'])
