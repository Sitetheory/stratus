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

      /* Angular Modules */
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

      // // Charts
      // 'chart.js': {
      //   deps: ['angular', 'chart']
      // },

      /* Froala */
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

      /* Calendar */
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
    packages: [
      /* *
      {
        name: 'stratus',
        location: boot.bundle + 'stratus',
        main: 'stratus'
      },
      /* */

      /* *
      {
        name: 'rxjs',
        location: boot.bundle + 'stratus/node_modules/rxjs',
        main: 'bundles/rxjs.umd'  + boot.suffix,
      },
      /* */

      /* *
      {
        name: 'rxjs/operators',
        location: boot.bundle + 'stratus/node_modules/rxjs/operators'
      }
      /* */

      /* *
      {
        name: '@angular/material',
        location: boot.bundle + 'stratus/node_modules/@angular/material/bundles',
        main: 'material.umd' + boot.suffix
      }
      /* */

      // Enabled For Editor: e.g. Froala or Redactor
      /* *
      {
        name: 'codemirror',
        location: boot.bundle + 'stratus/node_modules/codemirror',
        main: 'lib/codemirror'
      }
      /* */
    ],

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
      'stratus.services.*': boot.bundle + 'stratus/services/*' + boot.suffix,
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

      /* Lodash is used in place of Underscore in most modern components */
      lodash: boot.bundle + 'stratus/node_modules/lodash/lodash' + boot.suffix,

      /* THIRD PARTY: Bowser */
      bowser: boot.bundle + 'stratus/node_modules/bowser/bowser' + boot.suffix,

      /* THIRD PARTY: Interpreters */
      // coffee: boot.bundle + 'stratus/node_modules/coffeescript/docs/v2/browser-compiler/coffeescript',
      // less: boot.bundle + 'stratus/node_modules/less/dist/less' + boot.suffix,

      /* THIRD PARTY: jQuery */
      // TODO: convert all instances of jQuery to use Stratus selector if possible.
      // jQuery is currently used in a lot of components and directives that probably don't need it, since they are just
      // using the selector so they could just the Stratus Selector: Stratus('div')
      // NOTE: this sandboxes jquery into require so it's not in the window
      'jquery-native': boot.bundle + 'stratus/node_modules/jquery/dist/jquery' + boot.suffix,
      jquery: boot.bundle + 'stratus/extras/normalizers/jquery.sandbox' + boot.suffix,

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

      /* STRATUS DIRECTIVES: Froala Directive and Libraries */
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

      /* STRATUS DIRECTIVES: Redactor Directive and Libraries */
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

      /* STRATUS NORMALIZERS: */
      /* STRAUTS NORMALIZERS: Skroller Normalizer and Libraries */
      // skrollr: boot.bundle + 'stratus/extras/normalizers/skrollr.init' + boot.suffix,
      // 'skrollr-native': boot.bundle + 'stratus/node_modules/skrollr-typed/' + (boot.dev ? 'src' : 'dist') + '/skrollr' + boot.suffix,

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
      '@angular/animations': boot.bundle + 'stratus/node_modules/@angular/animations/bundles/animations.umd' + boot.suffix,
      '@angular/animations/*': boot.bundle + 'stratus/node_modules/@angular/animations/bundles/animations-*.umd' + boot.suffix,
      // '@angular/animations/browser': boot.bundle + 'stratus/node_modules/@angular/animations/bundles/animations-browser.umd' + boot.suffix,
      '@angular/cdk': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk.umd' + boot.suffix,
      '@angular/cdk/*': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-*.umd' + boot.suffix,
      // '@angular/cdk/a11y': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-a11y.umd' + boot.suffix,
      // '@angular/cdk/accordion': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-accordion.umd' + boot.suffix,
      // '@angular/cdk/bidi': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-bidi.umd' + boot.suffix,
      // '@angular/cdk/coercion': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-coercion.umd' + boot.suffix,
      // '@angular/cdk/collections': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-collections.umd' + boot.suffix,
      // '@angular/cdk/drag-drop': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-drag-drop.umd' + boot.suffix,
      // '@angular/cdk/keycodes': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-keycodes.umd' + boot.suffix,
      // '@angular/cdk/layout': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-layout.umd' + boot.suffix,
      // '@angular/cdk/observers': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-observers.umd' + boot.suffix,
      // '@angular/cdk/overlay': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-overlay.umd' + boot.suffix,
      // '@angular/cdk/platform': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-platform.umd' + boot.suffix,
      // '@angular/cdk/portal': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-portal.umd' + boot.suffix,
      // '@angular/cdk/scrolling': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-scrolling.umd' + boot.suffix,
      // '@angular/cdk/stepper': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-stepper.umd' + boot.suffix,
      // '@angular/cdk/table': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-table.umd' + boot.suffix,
      // '@angular/cdk/text-field': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-text-field.umd' + boot.suffix,
      // '@angular/cdk/tree': boot.bundle + 'stratus/node_modules/@angular/cdk/bundles/cdk-tree.umd' + boot.suffix,
      '@angular/common': boot.bundle + 'stratus/node_modules/@angular/common/bundles/common.umd' + boot.suffix,
      '@angular/common/*': boot.bundle + 'stratus/node_modules/@angular/common/bundles/common-*.umd' + boot.suffix,
      // '@angular/common/http': boot.bundle + 'stratus/node_modules/@angular/common/bundles/common-http.umd' + boot.suffix,
      '@angular/compiler': boot.bundle + 'stratus/node_modules/@angular/compiler/bundles/compiler.umd' + boot.suffix,
      '@angular/core': boot.bundle + 'stratus/node_modules/@angular/core/bundles/core.umd' + boot.suffix,
      '@angular/flex-layout': boot.bundle + 'stratus/node_modules/@angular/flex-layout/bundles/flex-layout.umd' + boot.suffix,
      '@angular/forms': boot.bundle + 'stratus/node_modules/@angular/forms/bundles/forms.umd' + boot.suffix,
      '@angular/material': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material.umd' + boot.suffix,
      '@angular/material/*': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-*.umd' + boot.suffix,
      // '@angular/material/autocomplete': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-autocomplete.umd' + boot.suffix,
      // '@angular/material/badge': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-badge.umd' + boot.suffix,
      // '@angular/material/bottom-sheet': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-bottom-sheet.umd' + boot.suffix,
      // '@angular/material/button': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-button.umd' + boot.suffix,
      // '@angular/material/button-toggle': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-button-toggle.umd' + boot.suffix,
      // '@angular/material/card': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-card.umd' + boot.suffix,
      // '@angular/material/checkbox': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-checkbox.umd' + boot.suffix,
      // '@angular/material/chips': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-chips.umd' + boot.suffix,
      // '@angular/material/core': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-core.umd' + boot.suffix,
      // '@angular/material/datepicker': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-datepicker.umd' + boot.suffix,
      // '@angular/material/dialog': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-dialog.umd' + boot.suffix,
      // '@angular/material/divider': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-divider.umd' + boot.suffix,
      // '@angular/material/expansion': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-expansion.umd' + boot.suffix,
      // '@angular/material/form-field': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-form-field.umd' + boot.suffix,
      // '@angular/material/grid-list': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-grid-list.umd' + boot.suffix,
      // '@angular/material/icon': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-icon.umd' + boot.suffix,
      // '@angular/material/input': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-input.umd' + boot.suffix,
      // '@angular/material/list': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-list.umd' + boot.suffix,
      // '@angular/material/menu': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-menu.umd' + boot.suffix,
      // '@angular/material/paginator': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-paginator.umd' + boot.suffix,
      // '@angular/material/progress-bar': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-progress-bar.umd' + boot.suffix,
      // '@angular/material/progress-spinner': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-progress-spinner.umd' + boot.suffix,
      // '@angular/material/radio': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-radio.umd' + boot.suffix,
      // '@angular/material/select': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-select.umd' + boot.suffix,
      // '@angular/material/sidenav': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-sidenav.umd' + boot.suffix,
      // '@angular/material/slide-toggle': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-slide-toggle.umd' + boot.suffix,
      // '@angular/material/slider': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-slider.umd' + boot.suffix,
      // '@angular/material/snack-bar': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-snack-bar.umd' + boot.suffix,
      // '@angular/material/sort': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-sort.umd' + boot.suffix,
      // '@angular/material/stepper': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-stepper.umd' + boot.suffix,
      // '@angular/material/table': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-table.umd' + boot.suffix,
      // '@angular/material/tabs': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-tabs.umd' + boot.suffix,
      // '@angular/material/toolbar': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-toolbar.umd' + boot.suffix,
      // '@angular/material/tooltip': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-tooltip.umd' + boot.suffix,
      // '@angular/material/tree': boot.bundle + 'stratus/node_modules/@angular/material/bundles/material-tree.umd' + boot.suffix,
      '@angular/material-moment-adapter': boot.bundle + 'stratus/node_modules/@angular/material-moment-adapter/bundles/material-moment-adapter.umd' + boot.suffix,
      '@angular/platform-browser': boot.bundle + 'stratus/node_modules/@angular/platform-browser/bundles/platform-browser.umd' + boot.suffix,
      '@angular/platform-browser/*': boot.bundle + 'stratus/node_modules/@angular/platform-browser/bundles/platform-browser-*.umd' + boot.suffix,
      '@angular/platform-browser-dynamic': boot.bundle + 'stratus/node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd' + boot.suffix,

      // STRATUS SRC: All
      '@stratus/*': boot.bundle + 'stratus/src/*' + boot.suffix,

      // STRATUS LOADERS: All
      // '@stratus/angular/main': boot.bundle + 'stratus/src/loaders/angular/main' + boot.suffix,
      // '@stratus/angular/material-modules': boot.bundle + 'stratus/src/loaders/angular/material-modules' + boot.suffix,
      // '@stratus/angular/polyfills': boot.bundle + 'stratus/src/loaders/angular/polyfills' + boot.suffix,
      // '@stratus/react/main': boot.bundle + 'stratus/src/loaders/react/main' + boot.suffix,

      // STRATUS COMPONENTS: Basic
      // '@stratus/components/aetherial': boot.bundle + 'stratus/src/components/aetherial' + boot.suffix,

      // Angular Dependencies
      // 'core-js/es6/reflect': boot.bundle + 'stratus/node_modules/core-js/es6/reflect' + boot.suffix,
      // 'core-js/es7/reflect': boot.bundle + 'stratus/node_modules/core-js/es7/reflect' + boot.suffix,
      'core-js/*': boot.bundle + 'stratus/node_modules/core-js/*',
      'core-js/es7/reflect': boot.bundle + 'stratus/node_modules/core-js/proposals/reflect-metadata',
      'hammerjs': boot.bundle + 'stratus/node_modules/hammerjs/hammer' + boot.suffix,
      'rxjs': boot.bundle + 'stratus/node_modules/rxjs/bundles/rxjs.umd' + boot.suffix,
      // 'rxjs': boot.bundle + 'stratus/node_modules/rxjs/index',
      'rxjs/operators': boot.bundle + 'stratus/extras/normalizers/rxjs.operators' + boot.suffix,
      // 'rxjs/operators': boot.bundle + 'stratus/node_modules/rxjs/operators/index',
      'rxjs-compat': boot.bundle + 'stratus/node_modules/rxjs-compat/index',
      'web-animations-js': boot.bundle + 'stratus/node_modules/web-animations-js/web-animations.min',
      'zone.js/dist/zone': boot.bundle + 'stratus/node_modules/zone.js/dist/zone' + boot.suffix,

      /* STRATUS EXTRAS: Angular: required for almost all extras and lots of others */
      // angular: boot.bundle + 'stratus/node_modules/angular/angular' + boot.suffix,
      // 'angular-animate': boot.bundle + 'stratus/node_modules/angular-animate/angular-animate' + boot.suffix,
      // 'angular-aria': boot.bundle + 'stratus/node_modules/angular-aria/angular-aria' + boot.suffix,
      // 'angular-material': boot.bundle + 'stratus/node_modules/angular-material/angular-material' + boot.suffix,
      // 'angular-messages': boot.bundle + 'stratus/node_modules/angular-messages/angular-messages' + boot.suffix,
      // 'angular-resource': boot.bundle + 'stratus/node_modules/angular-resource/angular-resource' + boot.suffix,
      // 'angular-sanitize': boot.bundle + 'stratus/node_modules/angular-sanitize/angular-sanitize' + boot.suffix,

      /* STRATUS EXTRAS: Angular Modules */

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

      /* STRATUS Libraries: CodeMirror */
      codemirror: boot.bundle + 'stratus/node_modules/codemirror/lib/codemirror',
      'codemirror/*': boot.bundle + 'stratus/node_modules/codemirror/*'

    }
  })
})(this)
