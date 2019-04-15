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

    // TODO: remove once we know we don't use backbone
    /* Backbone */
    'backbone.relational': {
      deps: ['backbone']
    },

    /* Angular */
    angular: {
      exports: 'angular'
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
  ],

  // Relative Paths
  paths: {

    /* Require.js Plugins */
    // TODO: determine what text is?
    text: boot.bundle + 'stratus/bower_components/text/text',

    /* Stratus Core Library */
    stratus: boot.bundle + 'stratus/dist/stratus' + boot.suffix,

    /* Stratus Core Routers */
    'stratus.routers.generic': boot.bundle + 'stratus/routers/generic' + boot.suffix,
    'stratus.routers.version': boot.bundle + 'stratus/routers/version' + boot.suffix,

    // TODO: remove once we know we don't need it in stratus.js where it is currently referenced
    /* Stratus Core Collections */
    'stratus.collections.generic': boot.bundle + 'stratus/legacy-deprecated/collections/generic' + boot.suffix,

    /*
    CONTROLLERS:
    ------------
    */
    'stratus.controllers.generic': boot.bundle + 'stratus/controllers/generic' + boot.suffix,

    /*
    SERVICES:
    ---------
    */
    'stratus.services.appConfig': boot.bundle + 'stratus/services/appConfig' + boot.suffix,
    'stratus.services.model': boot.bundle + 'stratus/services/model' + boot.suffix,
    'stratus.services.collection': boot.bundle + 'stratus/services/collection' + boot.suffix,
    'stratus.services.registry': boot.bundle + 'stratus/services/registry' + boot.suffix,
    'stratus.services.details': boot.bundle + 'stratus/services/details' + boot.suffix,
    // TODO: deprecate this once we've moved all features from utility to specific service
    'stratus.services.utility': boot.bundle + 'stratus/services/utility' + boot.suffix,

    /*
    COMPONENTS:
    -----------
    */
    'stratus.components.base': boot.bundle + 'stratus/components/base' + boot.suffix,

    // TODO: determine if these should be in Sitetheory instead, right now they are used in base.js (but maybe should not be)
    'stratus.components.search': boot.bundle + 'stratus/components/search' + boot.suffix,
    'stratus.components.pagination': boot.bundle + 'stratus/components/pagination' + boot.suffix,
    'stratus.components.sort': boot.bundle + 'stratus/components/sort' + boot.suffix,

    /*
    DIRECTIVES:
    -----------
    */
    'stratus.directives.base': boot.bundle + 'stratus/directives/base' + boot.suffix,
    // Used for extras/directives/drag.js, drop.js
    'stratus.directives.drag': boot.bundle + '/stratus/extras/directives/drag' + boot.suffix,
    'stratus.directives.drop': boot.bundle + '/stratus/extras/directives/drop' + boot.suffix,
    // Used for extras/directives/carousel.js
    'stratus.directives.src': 'sitetheorystratus/stratus/extras/directives/src' + boot.suffix,

    'stratus.directives.froala': 'sitetheorystratus/stratus/extras/directives/froala' + boot.suffix,
    'stratus.directives.redactor': 'sitetheorystratus/stratus/extras/directives/redactor' + boot.suffix,

    /*
    THIRD PARTY: BOWER COMPONENTS
    -----------------------------
    */
    promise: boot.bundle + 'stratus/bower_components/promise-polyfill/promise' + boot.suffix,

    // Used by extras/filters/gravatar.js
    md5: boot.bundle + 'stratus/bower_components/js-md5/build/md5.min',

    /* Backbone */
    underscore: boot.bundle + 'stratus/bower_components/underscore/underscore' + boot.dashSuffix,

    /* Bowser */
    // TODO: Determine if this needs to be in config.js
    bowser: boot.bundle + 'stratus/bower_components/bowser/src/bowser',

    /* Interpreters */
    coffee: boot.bundle + 'stratus/bower_components/coffeescript/docs/v2/browser-compiler/coffeescript',
    less: boot.bundle + 'stratus/bower_components/less/dist/less' + boot.suffix,

    // TODO: determine if we need backbone still, if not remove!
    backbone: boot.bundle + 'stratus/legacy-deprecated/external/backbone' + boot.suffix,
    'backbone.relational': boot.bundle + 'stratus/legacy-deprecated/normalizers/backbone.relational.injector',
    'backbone.relational.core': boot.bundle + 'stratus/bower_components/backbone-relational/backbone-relational',

    /*
    REQUIRED DEPENDENCIES FOR EXTRAS:
    TODO: determine if we should keep these defined permanently or require that a user define these in their custom config.js
     */

    // Required for: a LOT of extras/components and directives still...
    jquery: boot.bundle + 'stratus/bower_components/jquery/dist/jquery' + boot.suffix,
    // TODO: there appears to be no use case of this, we should determine if it's needed and then delete
    'jquery-sandbox': boot.bundle + 'stratus/extras/normalizers/jquery.sandbox' + boot.suffix,

    // TODO: Doesn't Appear to be used outside of deprecated deprecated upload.js (we use ng-drop zone)
    //dropzone: 'sitetheorystratus/stratus/bower_components/dropzone/dist/' + boot.directory + 'dropzone-amd-module' + boot.suffix,

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

    /* Angular: required for almost all extras and lots of others */
    angular: boot.bundle + 'stratus/bower_components/angular/angular' + boot.suffix,
    // TODO: there is no bower.json definition for angular-animate
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
    'angular-froala': boot.bundle + 'stratus/bower_components/angular-froala/src/angular-froala'

  }
})
