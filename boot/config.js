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

  /* Dependencies */
  // NOTE: most of these dependencies are for "extras" that may be enabled in a project config.js. THESE SHOULD BE ENABLED IN YOUR PROJECT'S config.js
  shim: {
    /* Angular */
    // angular: {
    //   exports: 'angular'
    // },
    // 'angular-aria': {
    //   deps: ['angular']
    // },
    // 'angular-animate': {
    //   deps: ['angular']
    // },
    // 'angular-messages': {
    //   deps: ['angular']
    // },
    // 'angular-material': {
    //   deps: [
    //     'angular-aria',
    //     'angular-animate',
    //     'angular-messages'
    //   ]
    // },
    // 'angular-resource': {
    //   deps: ['angular']
    // },
    // 'angular-sanitize': {
    //   deps: ['angular']
    // },
    //
    // /* Angular Modules */
    // 'angular-file-upload': {
    //   deps: ['angular']
    // },
    // 'angular-icons': {
    //   deps: ['angular']
    // },
    // 'angular-scrollSpy': {
    //   deps: ['angular']
    // },
    // 'angular-ui-tree': {
    //   deps: ['angular']
    // },
    //
    // // Charts
    // 'chart.js': {
    //   deps: ['angular', 'chart']
    // },
    //
    // /* Froala */
    // 'froala-align': {
    //   deps: ['froala']
    // },
    // 'froala-char-counter': {
    //   deps: ['froala']
    // },
    // 'froala-code-beautifier': {
    //   deps: ['froala']
    // },
    // 'froala-code-view': {
    //   deps: ['froala']
    // },
    // 'froala-colors': {
    //   deps: ['froala']
    // },
    // 'froala-draggable': {
    //   deps: ['froala']
    // },
    // 'froala-emoticons': {
    //   deps: ['froala']
    // },
    // 'froala-entities': {
    //   deps: ['froala']
    // },
    // 'froala-file': {
    //   deps: ['froala']
    // },
    // 'froala-font-family': {
    //   deps: ['froala']
    // },
    // 'froala-font-size': {
    //   deps: ['froala']
    // },
    // 'froala-forms': {
    //   deps: ['froala']
    // },
    // 'froala-fullscreen': {
    //   deps: ['froala']
    // },
    // 'froala-help': {
    //   deps: ['froala']
    // },
    // 'froala-image': {
    //   deps: ['froala']
    // },
    // 'froala-image-manager': {
    //   deps: ['froala', 'froala-image']
    // },
    // 'froala-inline-style': {
    //   deps: ['froala']
    // },
    // 'froala-line-breaker': {
    //   deps: ['froala']
    // },
    // 'froala-link': {
    //   deps: ['froala']
    // },
    // 'froala-lists': {
    //   deps: ['froala']
    // },
    // 'froala-paragraph-format': {
    //   deps: ['froala']
    // },
    // 'froala-paragraph-style': {
    //   deps: ['froala']
    // },
    // 'froala-quick-insert': {
    //   deps: ['froala']
    // },
    // 'froala-quote': {
    //   deps: ['froala']
    // },
    // 'froala-save': {
    //   deps: ['froala']
    // },
    // 'froala-special-characters': {
    //   deps: ['froala']
    // },
    // 'froala-table': {
    //   deps: ['froala']
    // },
    // 'froala-url': {
    //   deps: ['froala']
    // },
    // 'froala-video': {
    //   deps: ['froala']
    // },
    // 'froala-word-paste': {
    //   deps: ['froala']
    // },
    // 'angular-froala': {
    //   deps: ['angular', 'froala']
    // },
    // 'angular-drag-and-drop-lists': {
    //   deps: ['angular']
    // },
    //
    // /* Calendar */
    // fullcalendar: {
    //   deps: [
    //     'jquery',
    //     'moment'
    //   ]
    // },
    // '@fullcalendar/daygrid': {
    //   deps: [
    //     '@fullcalendar/core'
    //   ]
    // },
    // '@fullcalendar/timegrid': {
    //   deps: [
    //     '@fullcalendar/core'
    //   ]
    // },
    // '@fullcalendar/list': {
    //   deps: [
    //     '@fullcalendar/core'
    //   ]
    // },
    // 'fullcalendar/customView': {
    //   deps: [
    //     '@fullcalendar/core'
    //   ]
    // }
  },

  // Package Directories
  // packages: [
  //   /**
  //    {
  //        name: 'stratus',
  //        location: boot.bundle + 'stratus',
  //        main: 'stratus'
  //    },
  //    **/
  //   // Enabled For Editor: e.g. Froala or Redactor
  //   {
  //     name: 'codemirror',
  //     location: boot.bundle + 'stratus/node_modules/codemirror',
  //     main: 'lib/codemirror'
  //   }
  // ],

  // Relative Paths
  paths: {

    /* Require.js Plugins */
    // This is used to load raw TEXT in templates (e.g. via require.js) -- in most cases we use Angular
    text: boot.bundle + 'stratus/node_modules/requirejs-text/text',

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

    // THIRD PARTY: NODE MODULES

    /* Underscore is used in most components */
    underscore: boot.bundle + 'stratus/node_modules/underscore/underscore' + boot.dashSuffix,

    /* THIRD PARTY: Bowser */
    bowser: boot.bundle + 'stratus/node_modules/bowser/bowser' + boot.suffix,

    /* THIRD PARTY: Interpreters */
    coffee: boot.bundle + 'stratus/node_modules/coffeescript/docs/v2/browser-compiler/coffeescript',
    less: boot.bundle + 'stratus/node_modules/less/dist/less' + boot.suffix,

    /* THIRD PARTY: jQuery */
    // TODO: convert all instances of jQuery to use Stratus selector if possible.
    // jQuery is currently used in a lot of components and directives that probably don't need it, since they are just
    // using the selector so they could just the Stratus Selector: Stratus('div')
    // NOTE: this sandboxes jquery into require so it's not in the window
    'jquery-native': boot.bundle + 'stratus/node_modules/jquery/dist/jquery' + boot.suffix,
    jquery: boot.bundle + 'stratus/extras/normalizers/jquery.sandbox' + boot.suffix

    // /* STRATUS ELEMENTS: enabled in your project as you need them  */

    // /* STRATUS CONTROLLERS */
    //
    // /* STRATUS CONTROLLERS: Angular */
    // 'stratus.controllers.dialogue': boot.bundle + 'stratus/extras/controllers/dialogue' + boot.suffix,
    // 'stratus.controllers.panel': boot.bundle + 'stratus/extras/controllers/panel' + boot.suffix,
    //
    // /* STRATUS DIRECTIVES: */
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
    //
    // /* STRATUS DIRECTIVES: Froala Directive and Libraries */
    // 'stratus.directives.froala': boot.bundle + 'stratus/extras/directives/froala' + boot.suffix,
    // froala: boot.bundle + 'stratus/node_modules/froala-editor/js/froala_editor.min',
    // 'froala-align': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/align.min',
    // 'froala-char-counter': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/char_counter.min',
    // 'froala-code-beautifier': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/code_beautifier.min',
    // 'froala-code-view': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/code_view.min',
    // 'froala-colors': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/colors.min',
    // 'froala-draggable': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/draggable.min',
    // 'froala-emoticons': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/emoticons.min',
    // 'froala-entities': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/entities.min',
    // 'froala-file': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/file.min',
    // 'froala-font-family': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/font_family.min',
    // 'froala-font-size': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/font_size.min',
    // 'froala-forms': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/forms.min',
    // 'froala-fullscreen': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/fullscreen.min',
    // 'froala-help': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/help.min',
    // 'froala-image': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/image.min',
    // 'froala-image-manager': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/image_manager.min',
    // 'froala-inline-style': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/inline_style.min',
    // 'froala-line-breaker': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/line_breaker.min',
    // 'froala-link': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/link.min',
    // 'froala-lists': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/lists.min',
    // 'froala-paragraph-format': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/paragraph_format.min',
    // 'froala-paragraph-style': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/paragraph_style.min',
    // 'froala-quick-insert': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/quick_insert.min',
    // 'froala-quote': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/quote.min',
    // 'froala-save': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/save.min',
    // 'froala-special-characters': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/special_characters.min',
    // 'froala-table': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/table.min',
    // 'froala-url': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/url.min',
    // 'froala-video': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/video.min',
    // 'froala-word-paste': boot.bundle + 'stratus/node_modules/froala-editor/js/plugins/word_paste.min',
    // 'angular-froala': boot.bundle + 'stratus/node_modules/angular-froala/src/angular-froala',
    //
    // /* STRATUS DIRECTIVES: Redactor Directive and Libraries */
    // // NOTE: this isn't functioning at the moment. It needs to be rebuilt and enabled from the Stratus extras.
    // 'stratus.directives.redactor': boot.bundle + 'stratus/extras/directives/redactor' + boot.suffix,
    // // TODO: these should be moved to the stratus/extras (instead of sitetheory, e.g. see froala)
    // redactor: 'sitetheorycore/dist/redactor/redactor' + boot.suffix,
    // 'redactor-clips': 'sitetheorycore/dist/redactor/redactor.clips' + boot.suffix,
    // 'redactor-definedlinks': 'sitetheorycore/dist/redactor/redactor.definedlinks' + boot.suffix,
    // 'redactor-filemanager': 'sitetheorycore/dist/redactor/redactor.filemanager' + boot.suffix,
    // 'redactor-fullscreen': 'sitetheorycore/dist/redactor/redactor.fullscreen' + boot.suffix,
    // 'redactor-imagemanager': 'sitetheorycore/dist/redactor/redactor.imagemanager' + boot.suffix,
    // 'redactor-table': 'sitetheorycore/dist/redactor/redactor.table' + boot.suffix,
    // 'redactor-textexpander': 'sitetheorycore/dist/redactor/redactor.textexpander' + boot.suffix,
    // 'redactor-video': 'sitetheorycore/dist/redactor/redactor.video' + boot.suffix,
    //
    // /* STRATUS NORMALIZERS: */
    // /* STRAUTS NORMALIZERS: Skroller Normalizer and Libraries */
    // skrollr: boot.bundle + 'stratus/extras/normalizers/skrollr.init' + boot.suffix,
    // 'skrollr-native': boot.bundle + 'stratus/node_modules/skrollr-typed/' + (boot.dev ? 'src' : 'dist') + '/skrollr' + boot.suffix,
    //
    // /* STRATUS FILTERS */
    // 'stratus.filters.age': boot.bundle + 'stratus/extras/filters/age' + boot.suffix,
    // 'stratus.filters.map': boot.bundle + 'stratus/extras/filters/map' + boot.suffix,
    // 'stratus.filters.reduce': boot.bundle + 'stratus/extras/filters/reduce' + boot.suffix,
    // 'stratus.filters.truncate': boot.bundle + 'stratus/extras/filters/truncate' + boot.suffix,

    /* STRATUS FILTERS: Gravatar and Libraries */
    // 'stratus.filters.gravatar': boot.bundle + 'stratus/extras/filters/gravatar' + boot.suffix,
    // md5: boot.bundle + 'stratus/node_modules/js-md5/build/md5.min',

    //
    // /* STRATUS FILTERS: Moment and libraries */
    // 'stratus.filters.moment': boot.bundle + 'stratus/extras/filters/moment' + boot.suffix,
    // moment: boot.bundle + 'stratus/node_modules/moment/' + boot.directory + 'moment' + boot.suffix,
    // 'moment-timezone': boot.bundle + 'stratus/node_modules/moment-timezone/builds/moment-timezone-with-data' + boot.suffix,
    // 'moment-range': boot.bundle + 'stratus/node_modules/moment-range/dist/moment-range' + boot.suffix,
    //
    // /*
    // STRATUS EXTRAS: Extra features that are used from the Stratus core "extras" library
    //  */
    //
    // /* STRATUS EXTRAS - COMPONENTS: Calendar and Libraries */
    // 'stratus.components.calendar': boot.bundle + 'stratus/extras/components/calendar' + boot.suffix,
    // '@fullcalendar/core': boot.bundle + 'stratus/node_modules/@fullcalendar/core/main' + boot.suffix,
    // '@fullcalendar/daygrid': boot.bundle + 'stratus/node_modules/@fullcalendar/daygrid/main' + boot.suffix,
    // '@fullcalendar/timegrid': boot.bundle + 'stratus/node_modules/@fullcalendar/timegrid/main' + boot.suffix,
    // '@fullcalendar/list': boot.bundle + 'stratus/node_modules/@fullcalendar/list/main' + boot.suffix,
    // 'fullcalendar/customView': boot.bundle + 'stratus/extras/components/calendar.customView' + boot.suffix,
    // ical: boot.bundle + 'stratus/node_modules/ical.js/build/ical' + boot.suffix,
    // 'stratus.services.iCal': boot.bundle + 'stratus/extras/services/iCal' + boot.suffix,
    // 'stratus.components.calendar.timezones': boot.bundle + 'stratus/extras/components/calendar.timezones' + boot.suffix,
    //
    // /* STRATUS EXTRAS - COMPONENTS: Carousel and libraries */
    // 'stratus.components.carousel': boot.bundle + 'stratus/extras/components/carousel' + boot.suffix,
    // swiper: boot.bundle + 'stratus/node_modules/swiper/dist/js/swiper' + boot.suffix,
    //
    // /* STRATUS COMPONENTS: Social Media */
    // // Not Currently Used: this is a way to enable facebook components for a specific facebook page (component not 100% finished for general use)
    // // 'stratus.components.facebook': boot.bundle + 'stratus/extras/components/facebook' + boot.suffix,
    //
    // /* STRATUS EXTRAS: Angular: required for almost all extras and lots of others */
    // angular: boot.bundle + 'stratus/node_modules/angular/angular' + boot.suffix,
    // 'angular-animate': boot.bundle + 'stratus/node_modules/angular-animate/angular-animate' + boot.suffix,
    // 'angular-aria': boot.bundle + 'stratus/node_modules/angular-aria/angular-aria' + boot.suffix,
    // 'angular-material': boot.bundle + 'stratus/node_modules/angular-material/angular-material' + boot.suffix,
    // 'angular-messages': boot.bundle + 'stratus/node_modules/angular-messages/angular-messages' + boot.suffix,
    // 'angular-resource': boot.bundle + 'stratus/node_modules/angular-resource/angular-resource' + boot.suffix,
    // 'angular-sanitize': boot.bundle + 'stratus/node_modules/angular-sanitize/angular-sanitize' + boot.suffix,
    //
    // /* STRATUS EXTRAS: Angular Modules */
    // 'angular-chart': boot.bundle + 'stratus/node_modules/angular-chart.js/dist/angular-chart' + boot.suffix,
    // 'angular-drag-and-drop-lists': boot.bundle + 'stratus/node_modules/angular-drag-and-drop-lists/angular-drag-and-drop-lists' + boot.suffix,
    // 'angular-icons': boot.bundle + 'stratus/node_modules/angular-material-icons/angular-material-icons' + boot.suffix,
    // 'angular-file-upload': boot.bundle + 'stratus/node_modules/ng-file-upload/dist/ng-file-upload' + boot.suffix,
    // 'angular-paging': boot.bundle + 'stratus/node_modules/angular-paging/dist/paging' + boot.suffix,
    // 'angular-sortable': boot.bundle + 'stratus/node_modules/ng-sortable/angular-legacy-sortable' + boot.suffix,
    // 'angular-scrollSpy': boot.bundle + 'stratus/node_modules/angular-scroll-spy/angular-scroll-spy',
    // 'angular-ui-tree': boot.bundle + 'stratus/node_modules/angular-ui-tree/dist/angular-ui-tree' + boot.suffix,
    //
    // /* STRATUS EXTRAS: Chart */
    // chart: boot.bundle + 'stratus/node_modules/chart.js/dist/Chart',
    //
    // /* STRATUS EXTRAS: Masonry */
    // 'masonry-native': boot.bundle + 'stratus/node_modules/masonry-layout/dist/masonry.pkgd' + boot.suffix,
    // masonry: boot.bundle + 'stratus/extras/directives/masonry' + boot.suffix,

  }
})
