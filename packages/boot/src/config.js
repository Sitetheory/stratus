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
    deploymentPath: boot.deployment || '',

    /* Dependencies */
    // NOTE: most of these dependencies are for "extras" that may be enabled in a project config.js. THESE SHOULD BE ENABLED IN YOUR PROJECT'S config.js
    shim: {},

    // Package Directories
    packages: [],

    // Relative Paths
    paths: {

      /* Stratus Core Library */
      stratus: boot.deployment + 'stratus.js/dist/stratus' + boot.suffix,

      // CONTROLLERS:
      // ------------
      // 'stratus.controllers.*': boot.deployment + '@stratusjs/controllers/*' + boot.suffix,
      'stratus.controllers.generic': boot.deployment + '@stratusjs/angularjs/src/controllers/generic' + boot.suffix,

      // SERVICES:
      // ---------
      // 'stratus.services.*': boot.deployment + '@stratusjs/angularjs/src/services/*' + boot.suffix,
      'stratus.services.model': boot.deployment + '@stratusjs/angularjs/src/services/model' + boot.suffix,
      'stratus.services.collection': boot.deployment + '@stratusjs/angularjs/src/services/collection' + boot.suffix,
      'stratus.services.registry': boot.deployment + '@stratusjs/angularjs/src/services/registry' + boot.suffix,
      'stratus.services.details': boot.deployment + '@stratusjs/angularjs-extras/src/services/details' + boot.suffix,

      // COMPONENTS:
      // -----------
      // 'stratus.components.*': boot.deployment + '@stratusjs/angularjs/src/components/*' + boot.suffix,
      'stratus.components.base': boot.deployment + '@stratusjs/angularjs/src/components/base' + boot.suffix,

      // DIRECTIVES:
      // -----------
      // 'stratus.directives.*': boot.deployment + '@stratusjs/angularjs/src/directives/*' + boot.suffix,
      'stratus.directives.base': boot.deployment + '@stratusjs/angularjs/src/directives/base' + boot.suffix,

      // THIRD PARTY: NODE MODULES

      /* Lodash is used in place of Underscore in most modern components */
      lodash: boot.deployment + 'lodash/lodash' + boot.suffix,

      /* THIRD PARTY: Bowser */
      bowser: boot.deployment + 'bowser/bundled',
      'bowser-legacy': boot.deployment + 'bowser-legacy/bowser' + boot.suffix,

      /* THIRD PARTY: Interpreters */
      // coffee: boot.deployment + 'coffeescript/docs/v2/browser-compiler/coffeescript',
      // less: boot.deployment + 'less/dist/less' + boot.suffix,

      /* THIRD PARTY: jQuery */
      // TODO: convert all instances of jQuery to use Stratus selector if possible.
      // jQuery is currently used in a lot of components and directives that probably don't need it, since they are just
      // using the selector so they could just the Stratus Selector: Stratus('div')
      'jquery-native': boot.deployment + 'jquery/dist/jquery' + boot.suffix,

      /* STRATUS ELEMENTS: enabled in your project as you need them  */

      /* STRATUS CONTROLLERS */
      /* STRATUS CONTROLLERS */

      /* STRATUS CONTROLLERS: Angular */
      // 'stratus.controllers.dialogue': boot.deployment + '@stratusjs/angularjs-extras/src/controllers/dialogue' + boot.suffix,
      // 'stratus.controllers.panel': boot.deployment + '@stratusjs/angularjs-extras/src/controllers/panel' + boot.suffix,

      /* STRATUS DIRECTIVES: */
      // 'stratus.directives.href': boot.deployment + '@stratusjs/angularjs-extras/src/directives/href' + boot.suffix,
      // 'stratus.directives.singleClick': boot.deployment + '@stratusjs/angularjs-extras/src/directives/singleClick' + boot.suffix,
      // 'stratus.directives.onScreen': boot.deployment + '@stratusjs/angularjs-extras/src/directives/onScreen' + boot.suffix,
      // 'stratus.directives.src': boot.deployment + '@stratusjs/angularjs-extras/src/directives/src' + boot.suffix,
      // 'stratus.directives.trigger': boot.deployment + '@stratusjs/angularjs-extras/src/directives/trigger' + boot.suffix,
      // 'stratus.directives.validate': boot.deployment + '@stratusjs/angularjs-extras/src/directives/validate' + boot.suffix,
      // 'stratus.directives.compileTemplate': boot.deployment + '@stratusjs/angularjs-extras/src/directives/compileTemplate' + boot.suffix,
      // 'stratus.directives.stringToNumber': boot.deployment + '@stratusjs/angularjs-extras/src/directives/stringToNumber' + boot.suffix,
      // 'stratus.directives.timestampToDate': boot.deployment + '@stratusjs/angularjs-extras/src/directives/timestampToDate' + boot.suffix,
      // 'stratus.directives.drag': boot.bundle + '/stratus/extras/directives/drag' + boot.suffix,
      // 'stratus.directives.drop': boot.bundle + '/stratus/extras/directives/drop' + boot.suffix,

      /* STRATUS NORMALIZERS: */
      // NOTE: this sandboxes jquery into require so it's not in the window
      jquery: boot.deployment + '@stratusjs/angularjs-extras/src/normalizers/jquery.sandbox' + boot.suffix

      /* STRATUS FILTERS */
      // 'stratus.filters.age': boot.deployment + '@stratusjs/angularjs-extras/src/filters/age' + boot.suffix,
      // 'stratus.filters.map': boot.deployment + '@stratusjs/angularjs-extras/src/filters/map' + boot.suffix,
      // 'stratus.filters.reduce': boot.deployment + '@stratusjs/angularjs-extras/src/filters/reduce' + boot.suffix,
      // 'stratus.filters.truncate': boot.deployment + '@stratusjs/angularjs-extras/src/filters/truncate' + boot.suffix,

      /* STRATUS FILTERS: Gravatar and Libraries */
      // 'stratus.filters.gravatar': boot.deployment + '@stratusjs/angularjs-extras/src/filters/gravatar' + boot.suffix,
      // md5: boot.deployment + 'js-md5/build/md5.min',

      /* STRATUS FILTERS: Moment and libraries */
      // 'stratus.filters.moment': boot.deployment + '@stratusjs/angularjs-extras/src/filters/moment' + boot.suffix,
      // moment: boot.deployment + 'moment/' + boot.directory + 'moment' + boot.suffix,
      // 'moment-timezone': boot.deployment + 'moment-timezone/builds/moment-timezone-with-data' + boot.suffix,
      // 'moment-range': boot.deployment + 'moment-range/dist/moment-range' + boot.suffix,

      /*
      // STRATUS EXTRAS: Extra features that are used from the Stratus core "extras" library
      //  */

      /* STRATUS EXTRAS - COMPONENTS: Calendar and Libraries */
      // 'stratus.components.calendar': boot.deployment + '@stratusjs/angularjs-extras/src/components/calendar/calendar' + boot.suffix,
      // '@fullcalendar/core': boot.deployment + '@fullcalendar/core/main' + boot.suffix,
      // '@fullcalendar/daygrid': boot.deployment + '@fullcalendar/daygrid/main' + boot.suffix,
      // '@fullcalendar/timegrid': boot.deployment + '@fullcalendar/timegrid/main' + boot.suffix,
      // '@fullcalendar/list': boot.deployment + '@fullcalendar/list/main' + boot.suffix,
      // 'fullcalendar/customView': boot.deployment + '@stratusjs/angularjs-extras/src/components/calendar/customView' + boot.suffix,
      // ical: boot.deployment + 'ical.js/build/ical' + boot.suffix,
      // 'stratus.services.iCal': boot.deployment + '@stratusjs/angularjs-extras/src/services/iCal' + boot.suffix,

      /* STRATUS EXTRAS - COMPONENTS: Carousel and libraries */
      // 'stratus.components.carousel': boot.deployment + '@stratusjs/angularjs-extras/src/components/carousel' + boot.suffix,
      // swiper: boot.deployment + 'swiper/dist/js/swiper' + boot.suffix,

      /* STRATUS COMPONENTS: Social Media */
      // Not Currently Used: this is a way to enable facebook components for a specific facebook page (component not 100% finished for general use)
      // 'stratus.components.facebook': boot.deployment + '@stratusjs/angularjs-extras/src/components/facebook' + boot.suffix,

      /* STRATUS LIBRARY: Angular */
      // '@angular/*': boot.deployment + '@angular/*/bundles/*.umd' + boot.suffix,
      // '@angular/animations': boot.deployment + '@angular/animations/bundles/animations.umd' + boot.suffix,
      // '@angular/animations/*': boot.deployment + '@angular/animations/bundles/animations-*.umd' + boot.suffix,
      // '@angular/cdk': boot.deployment + '@angular/cdk/bundles/cdk.umd' + boot.suffix,
      // '@angular/cdk/*': boot.deployment + '@angular/cdk/bundles/cdk-*.umd' + boot.suffix,
      // '@angular/common': boot.deployment + '@angular/common/bundles/common.umd' + boot.suffix,
      // '@angular/common/*': boot.deployment + '@angular/common/bundles/common-*.umd' + boot.suffix,
      // '@angular/compiler': boot.deployment + '@angular/compiler/bundles/compiler.umd' + boot.suffix,
      // '@angular/core': boot.deployment + '@angular/core/bundles/core.umd' + boot.suffix,
      // '@angular/flex-layout': boot.deployment + '@angular/flex-layout/bundles/flex-layout.umd' + boot.suffix,
      // '@angular/forms': boot.deployment + '@angular/forms/bundles/forms.umd' + boot.suffix,
      // '@angular/material': boot.deployment + '@angular/material/bundles/material.umd' + boot.suffix,
      // '@angular/material/*': boot.deployment + '@angular/material/bundles/material-*.umd' + boot.suffix,
      // '@angular/material-moment-adapter': boot.deployment + '@angular/material-moment-adapter/bundles/material-moment-adapter.umd' + boot.suffix,
      // '@angular/platform-browser': boot.deployment + '@angular/platform-browser/bundles/platform-browser.umd' + boot.suffix,
      // '@angular/platform-browser/*': boot.deployment + '@angular/platform-browser/bundles/platform-browser-*.umd' + boot.suffix,
      // '@angular/platform-browser-dynamic': boot.deployment + '@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd' + boot.suffix,

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
      // angular: boot.deployment + 'angular/angular' + boot.suffix,
      // 'angular-animate': boot.deployment + 'angular-animate/angular-animate' + boot.suffix,
      // 'angular-aria': boot.deployment + 'angular-aria/angular-aria' + boot.suffix,
      // 'angular-material': boot.deployment + 'angular-material/angular-material' + boot.suffix,
      // 'angular-messages': boot.deployment + 'angular-messages/angular-messages' + boot.suffix,
      // 'angular-resource': boot.deployment + 'angular-resource/angular-resource' + boot.suffix,
      // 'angular-sanitize': boot.deployment + 'angular-sanitize/angular-sanitize' + boot.suffix,

      /* STRATUS EXTRAS: Angular.js Modules */

      // 'angular-chart': boot.deployment + 'angular-chart.js/dist/angular-chart' + boot.suffix,
      // 'angular-drag-and-drop-lists': boot.deployment + 'angular-drag-and-drop-lists/angular-drag-and-drop-lists' + boot.suffix,
      // 'angular-icons': boot.deployment + 'angular-material-icons/angular-material-icons' + boot.suffix,
      // 'angular-file-upload': boot.deployment + 'ng-file-upload/dist/ng-file-upload' + boot.suffix,
      // 'angular-paging': boot.deployment + 'angular-paging/dist/paging' + boot.suffix,
      // 'angular-scrollSpy': boot.deployment + 'angular-scroll-spy/angular-scroll-spy',
      // 'angular-ui-tree': boot.deployment + 'angular-ui-tree/dist/angular-ui-tree' + boot.suffix,

      /* STRATUS EXTRAS: Chart */
      // chart: boot.deployment + 'chart.js/dist/Chart',

      /* STRATUS EXTRAS: Masonry */
      // 'masonry-native': boot.deployment + 'masonry-layout/dist/masonry.pkgd' + boot.suffix,
      // masonry: boot.deployment + '@stratusjs/angularjs-extras/src/directives/masonry' + boot.suffix,

    }
  })
})(this); // eslint-disable-line semi
