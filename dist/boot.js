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

    // TODO: remove once we know we don't use backbone
    /* Backbone */
    'backbone.relational': {
      deps: ['backbone']
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
    /* THIRD PARTY: enable if you want, e.g. used with Froala or Redactor editor code view */
    /*
    {
      name: 'codemirror',
      location: boot.bundle + 'stratus/bower_components/codemirror',
      main: 'lib/codemirror'
    }
    */
  ],

  // Relative Paths
  paths: {

    /* Require.js Plugins */
    text: boot.bundle + 'stratus/bower_components/text/text',

    /* Stratus Core Library */
    stratus: boot.bundle + 'stratus/dist/stratus' + boot.suffix,

    /* Stratus Core Routers */
    'stratus.routers.generic': boot.bundle + 'stratus/routers/generic' + boot.suffix,
    'stratus.routers.version': boot.bundle + 'stratus/routers/version' + boot.suffix,

    /* CONTROLLERS: */
    'stratus.controllers.generic': boot.bundle + 'stratus/controllers/generic' + boot.suffix,

    /* SERVICES: */
    'stratus.services.appConfig': boot.bundle + 'stratus/services/appConfig' + boot.suffix,
    'stratus.services.model': boot.bundle + 'stratus/services/model' + boot.suffix,
    'stratus.services.collection': boot.bundle + 'stratus/services/collection' + boot.suffix,
    'stratus.services.registry': boot.bundle + 'stratus/services/registry' + boot.suffix,
    'stratus.services.details': boot.bundle + 'stratus/services/details' + boot.suffix,
    // TODO: deprecate this once we've moved all features from utility to specific service
    'stratus.services.utility': boot.bundle + 'stratus/services/utility' + boot.suffix,

    /* COMPONENTS:  */
    'stratus.components.base': boot.bundle + 'stratus/components/base' + boot.suffix,

    /* DIRECTIVES: */
    'stratus.directives.base': boot.bundle + 'stratus/directives/base' + boot.suffix,

    /*
    EXTRAS: enable these as your specific project needs them.
    ---------------------------------------------------------
    */

    // TODO: define shim dependency if iCal is required for calendar component.
    // 'stratus.services.iCal': boot.bundle + 'stratus/extras/services/iCal' + boot.suffix,

    /* CONTROLLERS: Angular */
    // 'stratus.controllers.dialogue': boot.bundle + 'stratus/extras/controllers/dialogue' + boot.suffix,
    // 'stratus.controllers.panel': boot.bundle + 'stratus/extras/controllers/panel' + boot.suffix,

    /* EXTRA DIRECTIVES: */
    // 'stratus.directives.drag': boot.bundle + 'stratus/extras/directives/drag' + boot.suffix,
    // 'stratus.directives.drop': boot.bundle + 'stratus/extras/directives/drop' + boot.suffix,
    // 'stratus.directives.href': boot.bundle + 'stratus/extras/directives/href' + boot.suffix,
    // 'stratus.directives.singleClick': boot.bundle + 'stratus/extras/directives/singleClick' + boot.suffix,
    // 'stratus.directives.onScreen': boot.bundle + 'stratus/extras/directives/onScreen' + boot.suffix,
    // 'stratus.directives.src': boot.bundle + 'stratus/extras/directives/src' + boot.suffix,
    // 'stratus.directives.trigger': boot.bundle + 'stratus/extras/directives/trigger' + boot.suffix,
    // 'stratus.directives.validate': boot.bundle + 'stratus/extras/directives/validate' + boot.suffix,
    // 'stratus.directives.validateUrl': boot.bundle + 'stratus/extras/directives/validateUrl' + boot.suffix,
    // 'stratus.directives.compileTemplate': boot.bundle + 'stratus/extras/directives/compileTemplate' + boot.suffix,
    // 'stratus.directives.stringToNumber': boot.bundle + 'stratus/extras/directives/stringToNumber' + boot.suffix,
    // 'stratus.directives.timestampToDate': boot.bundle + 'stratus/extras/directives/timestampToDate' + boot.suffix,
    // 'stratus.directives.froala': boot.bundle + 'stratus/extras/directives/froala' + boot.suffix,
    // 'stratus.directives.redactor': boot.bundle + 'stratus/extras/directives/redactor' + boot.suffix,

    /* FILTERS: */
    /* EXTRA FILTERS: */
    // 'stratus.filters.age': boot.bundle + 'stratus/extras/filters/age' + boot.suffix,
    // 'stratus.filters.gravatar': boot.bundle + 'stratus/extras/filters/gravatar' + boot.suffix,
    // 'stratus.filters.map': boot.bundle + 'stratus/extras/filters/map' + boot.suffix,
    // 'stratus.filters.moment': boot.bundle + 'stratus/extras/filters/moment' + boot.suffix,
    // 'stratus.filters.reduce': boot.bundle + 'stratus/extras/filters/reduce' + boot.suffix,
    // 'stratus.filters.truncate': boot.bundle + 'stratus/extras/filters/truncate' + boot.suffix,

    // TODO: determine if we need jquery in the Stratus core still, remove once we do not!
    'jquery-sandbox': boot.bundle + 'stratus/extras/normalizers/jquery.sandbox' + boot.suffix,

    // TODO: Move all these to an "extras" folder and make each project that uses stratus enable or disable them as they need them.

    // TODO: remove once we know we don't need it in stratus.js where it is currently referenced
    /* Stratus Core Collections */
    'stratus.collections.generic': boot.bundle + 'stratus/legacy-deprecated/collections/generic' + boot.suffix,
    backbone: boot.bundle + 'stratus/legacy-deprecated/external/backbone' + boot.suffix,
    'backbone.relational': boot.bundle + 'stratus/legacy-deprecated/normalizers/backbone.relational.injector',
    'backbone.relational.core': boot.bundle + 'stratus/bower_components/backbone-relational/backbone-relational',

    //'stratus.components.calendar': boot.bundle + 'stratus/extras/components/calendar' + boot.suffix,
    //'stratus.components.carousel': boot.bundle + 'stratus/extras/components/carousel' + boot.suffix,
    /* COMPONENTS: Social Media */
    //'stratus.components.facebook': boot.bundle + 'stratus/extras/components/facebook' + boot.suffix,
    //'stratus.components.tweet': boot.bundle + 'stratus/extras/components/tweet' + boot.suffix,

    /* THIRD PARTY: BOWER COMPONENTS */

    /* Backbone */
    underscore: boot.bundle + 'stratus/bower_components/underscore/underscore' + boot.dashSuffix,

    /* Interpreters */
    coffee: boot.bundle + 'stratus/bower_components/coffeescript/docs/v2/browser-compiler/coffeescript',
    less: boot.bundle + 'stratus/bower_components/less/dist/less' + boot.suffix,

    // TODO: determine if we need jquery in the Stratus core still, remove once we do not!
    /* jQuery */
    jquery: boot.bundle + 'stratus/bower_components/jquery/dist/jquery' + boot.suffix

    /* Froala Libraries */
    // froala: boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/froala_editor.min',
    // 'froala-align': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/align.min',
    // 'froala-char-counter': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/char_counter.min',
    // 'froala-code-beautifier': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/code_beautifier.min',
    // 'froala-code-view': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/code_view.min',
    // 'froala-colors': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/colors.min',
    // 'froala-draggable': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/draggable.min',
    // 'froala-emoticons': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/emoticons.min',
    // 'froala-entities': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/entities.min',
    // 'froala-file': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/file.min',
    // 'froala-font-family': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/font_family.min',
    // 'froala-font-size': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/font_size.min',
    // 'froala-forms': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/forms.min',
    // 'froala-fullscreen': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/fullscreen.min',
    // 'froala-help': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/help.min',
    // 'froala-image': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/image.min',
    // 'froala-image-manager': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/image_manager.min',
    // 'froala-inline-style': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/inline_style.min',
    // 'froala-line-breaker': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/line_breaker.min',
    // 'froala-link': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/link.min',
    // 'froala-lists': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/lists.min',
    // 'froala-paragraph-format': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/paragraph_format.min',
    // 'froala-paragraph-style': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/paragraph_style.min',
    // 'froala-quick-insert': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/quick_insert.min',
    // 'froala-quote': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/quote.min',
    // 'froala-save': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/save.min',
    // 'froala-special-characters': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/special_characters.min',
    // 'froala-table': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/table.min',
    // 'froala-url': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/url.min',
    // 'froala-video': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/video.min',
    // 'froala-word-paste': boot.bundle + 'stratus/bower_components/froala-wysiwyg-editor/js/plugins/word_paste.min',
    // 'angular-froala': boot.bundle + 'stratus/bower_components/angular-froala/src/angular-froala',

    /* Common Libraries */
    // bowser: boot.bundle + 'stratus/bower_components/bowser/src/bowser',
    // chart: boot.bundle + 'stratus/bower_components/chart.js/dist/Chart',
    // dropzone: boot.bundle + 'stratus/bower_components/dropzone/dist/' + boot.directory + 'dropzone-amd-module' + boot.suffix,
    // fullcalendar: boot.bundle + 'stratus/bower_components/fullcalendar/dist/fullcalendar' + boot.suffix,
    // md5: boot.bundle + 'stratus/bower_components/js-md5/build/md5.min',
    // masonry: boot.bundle + 'stratus/bower_components/masonry-layout/dist/masonry.pkgd' + boot.suffix,
    // moment: boot.bundle + 'stratus/bower_components/moment/' + boot.directory + 'moment' + boot.suffix,
    // 'moment-timezone': boot.bundle + 'stratus/bower_components/moment-timezone/builds/moment-timezone-with-data' + boot.suffix,
    // 'moment-range': boot.bundle + 'stratus/bower_components/moment-range/dist/moment-range' + boot.suffix,
    // promise: boot.bundle + 'stratus/bower_components/promise-polyfill/promise' + boot.suffix,
    // swiper: boot.bundle + 'stratus/bower_components/swiper/dist/js/swiper' + boot.suffix,
    // zxcvbn: boot.bundle + 'stratus/bower_components/zxcvbn/dist/zxcvbn',

    /* Angular */
    // angular: boot.bundle + 'stratus/bower_components/angular/angular' + boot.suffix,
    // 'angular-animate': boot.bundle + 'stratus/bower_components/angular-animate/angular-animate' + boot.suffix,
    // 'angular-aria': boot.bundle + 'stratus/bower_components/angular-aria/angular-aria' + boot.suffix,
    // 'angular-material': boot.bundle + 'stratus/bower_components/angular-material/angular-material' + boot.suffix,
    // 'angular-messages': boot.bundle + 'stratus/bower_components/angular-messages/angular-messages' + boot.suffix,
    // 'angular-resource': boot.bundle + 'stratus/bower_components/angular-resource/angular-resource' + boot.suffix,
    // 'angular-sanitize': boot.bundle + 'stratus/bower_components/angular-sanitize/angular-sanitize' + boot.suffix,
    //
    // /* Angular Modules */
    // 'angular-chart': boot.bundle + 'stratus/bower_components/angular-chart.js/dist/angular-chart' + boot.suffix,
    // 'angular-drag-and-drop-lists': boot.bundle + 'stratus/bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists' + boot.suffix,
    // 'angular-icons': boot.bundle + 'stratus/bower_components/angular-material-icons/angular-material-icons' + boot.suffix,
    // 'angular-file-upload': boot.bundle + 'stratus/bower_components/ng-file-upload/ng-file-upload' + boot.suffix,
    // 'angular-paging': boot.bundle + 'stratus/bower_components/angular-paging/dist/paging' + boot.suffix,
    // 'angular-sortable': boot.bundle + 'stratus/bower_components/ng-sortable/angular-legacy-sortable' + boot.suffix,
    // 'angular-scrollSpy': boot.bundle + 'stratus/bower_components/angular-scroll-spy/angular-scroll-spy',
    // 'angular-ui-tree': boot.bundle + 'stratus/bower_components/angular-ui-tree/dist/angular-ui-tree' + boot.suffix,

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
