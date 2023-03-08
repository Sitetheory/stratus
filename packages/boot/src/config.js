// Configuration
// -------------

(function (root) {
  const boot = root.boot
  /*
  The Stratus config.js has the bare minimum configuration needed to run Stratus, but additional Components, Directives, Filters, Controllers, and Services exist in the "extras" folder, which you can enable for your project if any of them are useful. You will define a custom config.js to point to the desired file in Stratus/extras folder. You should also setup Bowser (bowers.json) file to load any desired third party components, e.g. Froala.

  Note: some components or services may require dependencies, that must be defined. If these are Stratus "extras" they should be enabled here in the config.js file only if you need them.
   */
  const stratusjsAngularJsBundlePath =  `${boot.deployment}@stratusjs/angularjs/dist/angularjs.bundle${boot.suffix}`
  const stratusjsAngularJsExtrasBundlePath =  `${boot.deployment}@stratusjs/angularjs-extras/dist/angularjs-extras.bundle${boot.suffix}`
  const stratusjsCalendarBundlePath =  `${boot.deployment}@stratusjs/calendar/dist/calendar.bundle${boot.suffix}`
  const stratusjsIdxBundlePath =  `${boot.deployment}@stratusjs/idx/dist/idx.bundle${boot.suffix}`

  boot.config({

    // Connection Settings
    waitSeconds: 30,

    // Cache Busting
    urlArgs: 'v=' + boot.cacheTime,

    // Version Location (Disabled During Beta Testing)
    baseUrl: ((boot.dev || boot.local) ? boot.host + '/' : boot.cdn) + boot.relative,
    bundlePath: boot.bundle || '',
    deploymentPath: boot.deployment || '',

    /* Dependencies */
    // NOTE: most of these dependencies are for "extras" that may be enabled in a project config.js. THESE SHOULD BE ENABLED IN YOUR PROJECT'S config.js
    shim: {},

    // Package Directories
    packages: {},

    // Relative Paths
    paths: {

      /*
       Stratus Core Library
       @stratusjs/runtime Package Paths
      */
      stratus: `${boot.deployment}@stratusjs/runtime/src/stratus.amd${boot.suffix}`,
      '@stratusjs/runtime/*': `${boot.deployment}@stratusjs/runtime/src/*${boot.suffix}`,
      '@stratusjs/runtime/stratus': `${boot.deployment}@stratusjs/runtime/src/stratus${boot.suffix}`,
      '@stratusjs/runtime/stratus.amd': `${boot.deployment}@stratusjs/runtime/src/stratus.amd${boot.suffix}`,

      /* @stratusjs/angular Package Paths */
      '@stratusjs/angular/boot': `${boot.deployment}@stratusjs/angular/src/boot${boot.suffix}`,
      '@stratusjs/angular/*': `${boot.deployment}@stratusjs/angular/dist/angular.bundle${boot.suffix}`,

      /* @stratusjs/angularjs Package Paths */
      '@stratusjs/angularjs/*': stratusjsAngularJsBundlePath,
      // TODO: This doesn't appear to be relevant anymore, so it may be removable.
      '@stratusjs/angularjs/services/registry': stratusjsAngularJsBundlePath, // TODO remove?
      '@stratusjs/angularjs/services/collection': stratusjsAngularJsBundlePath, // TODO remove?
      '@stratusjs/angularjs/services/model': stratusjsAngularJsBundlePath, // TODO remove?
      'stratus.controllers.generic': stratusjsAngularJsBundlePath,

      /* @stratusjs/angularjs-extras Package Paths */
      angular: `${boot.deployment}@stratusjs/angularjs-extras/src/normalizers/angular.exports${boot.suffix}`, // TODO: Not bundled
      // NOTE: this sandboxes jquery into require so it's not in the window
      jquery: `${boot.deployment}@stratusjs/angularjs-extras/src/normalizers/jquery.sandbox${boot.suffix}`,
      masonry: stratusjsAngularJsExtrasBundlePath,
      'rxjs/operators': `${boot.deployment}@stratusjs/angularjs-extras/src/normalizers/rxjs.operators${boot.suffix}`,
      skrollr: `${boot.deployment}@stratusjs/angularjs-extras/src/normalizers/skrollr.init${boot.suffix}`,
      '@stratusjs/angularjs-extras/*': stratusjsAngularJsExtrasBundlePath,
      'stratus.components.citation': stratusjsAngularJsExtrasBundlePath,
      'stratus.components.jsonEditor': stratusjsAngularJsExtrasBundlePath,
      'stratus.components.twitterFeed': stratusjsAngularJsExtrasBundlePath,
      'stratus.controllers.dialog': `${boot.deployment}@stratusjs/angularjs-extras/src/controllers/dialog${boot.suffix}`, // TODO: Not bundled
      'stratus.controllers.panel': `${boot.deployment}@stratusjs/angularjs-extras/src/controllers/panel${boot.suffix}`, // TODO: Not bundled
      'stratus.directives.bindHtml': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.compileTemplate': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.domEvents': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.drag': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.drop': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.froala': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.fullHeight': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.href': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.jsonToObject': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.maxLength': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.parentClass': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.onScreen': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.singleClick': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.src': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.stringToNumber': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.timestampToDate': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.trigger': stratusjsAngularJsExtrasBundlePath,
      'stratus.directives.validate': stratusjsAngularJsExtrasBundlePath,
      'stratus.filters.age': stratusjsAngularJsExtrasBundlePath,
      'stratus.filters.avatar': stratusjsAngularJsExtrasBundlePath,
      'stratus.filters.gravatar': stratusjsAngularJsExtrasBundlePath,
      'stratus.filters.isArray': stratusjsAngularJsExtrasBundlePath,
      'stratus.filters.map': stratusjsAngularJsExtrasBundlePath,
      'stratus.filters.math': stratusjsAngularJsExtrasBundlePath,
      'stratus.filters.moment': stratusjsAngularJsExtrasBundlePath,
      'stratus.filters.numeral': stratusjsAngularJsExtrasBundlePath,
      'stratus.filters.reduce': stratusjsAngularJsExtrasBundlePath,
      'stratus.filters.truncate': stratusjsAngularJsExtrasBundlePath,
      'stratus.filters.toArray': stratusjsAngularJsExtrasBundlePath,

      /* @stratusjs/backend Package Paths */
      '@stratusjs/backend/*': `${boot.deployment}@stratusjs/backend/src/*${boot.suffix}`, // TODO unused?

      /* @stratusjs/boot Package Paths */
      '@stratusjs/boot/*': `${boot.deployment}@stratusjs/boot/src/*${boot.suffix}`,

      /* @stratusjs/calendar Package Paths */
      '@stratusjs/calendar/*': stratusjsCalendarBundlePath,
      '@fullcalendar/*': stratusjsCalendarBundlePath,
      'stratus.components.calendar': stratusjsCalendarBundlePath,

      /* @stratus/idx Package Paths */
      '@stratusjs/idx/*': stratusjsIdxBundlePath,
      'stratus.components.idx*': stratusjsIdxBundlePath,
      'stratus.components.idxDisclaimer': stratusjsIdxBundlePath,
      'stratus.components.idxMap': stratusjsIdxBundlePath,
      'stratus.components.idxMemberDetails': stratusjsIdxBundlePath,
      'stratus.components.idxMemberList': stratusjsIdxBundlePath,
      'stratus.components.idxMemberSearch': stratusjsIdxBundlePath,
      'stratus.components.idxOfficeList': stratusjsIdxBundlePath,
      'stratus.components.idxOfficeSearch': stratusjsIdxBundlePath,
      'stratus.components.idxPropertyDetails': stratusjsIdxBundlePath,
      'stratus.components.idxPropertyDetailsSubSection': stratusjsIdxBundlePath,
      'stratus.components.idxPropertyList': stratusjsIdxBundlePath,
      'stratus.components.idxPropertySearch': stratusjsIdxBundlePath,

      /* @stratusjs/core Package Paths */
      '@stratusjs/core/*': `${boot.deployment}@stratusjs/core/dist/core.bundle${boot.suffix}`,

      /* @stratusjs/form Package Paths */
      '@stratusjs/form/*': `${boot.deployment}@stratusjs/angular/dist/angular.bundle${boot.suffix}`,

      /* @stratusjs/map Package Paths */
      '@stratusjs/map/*': `${boot.deployment}@stratusjs/angular/dist/angular.bundle${boot.suffix}`,

      /* @stratusjs/react Package Paths */
      '@stratusjs/react/*': `${boot.deployment}@stratusjs/react/src/*${boot.suffix}`,

      /* @stratusjs/stripe Package Paths */
      '@stratusjs/stripe/*': `${boot.deployment}@stratusjs/angular/dist/angular.bundle${boot.suffix}`,

      /* @stratusjs/swiper Package Paths */
      '@stratusjs/swiper/*': `${boot.deployment}@stratusjs/swiper/src/*${boot.suffix}`, // TODO bundle
      'stratus.components.swiperCarousel': `${boot.deployment}@stratusjs/swiper/src/carousel.component${boot.suffix}`, // TODO bundle

      /* Third Party Libraries */

      // AngularJs: required for almost all extras and lots of others
      'angular-native': `${boot.deployment}angular/angular${boot.suffix}`,
      'angular-animate': `${boot.deployment}angular-animate/angular-animate${boot.suffix}`,
      'angular-aria': `${boot.deployment}angular-aria/angular-aria${boot.suffix}`,
      'angular-material': `${boot.deployment}angular-material/angular-material${boot.suffix}`,
      'angular-material-css': `${boot.deployment}angular-material/angular-material${boot.suffix}.css`,
      'angular-messages': `${boot.deployment}angular-messages/angular-messages${boot.suffix}`,
      'angular-resource': `${boot.deployment}angular-resource/angular-resource${boot.suffix}`,
      'angular-sanitize': `${boot.deployment}angular-sanitize/angular-sanitize${boot.suffix}`,

      /* AngularJs Modules */
      'angular-drag-and-drop-lists': `${boot.deployment}angular-drag-and-drop-lists/angular-drag-and-drop-lists${boot.suffix}`,
      'angular-icons': `${boot.deployment}angular-material-icons/angular-material-icons${boot.suffix}`,
      'angular-file-upload': `${boot.deployment}ng-file-upload/dist/ng-file-upload${boot.suffix}`,
      'angular-paging': `${boot.deployment}angular-paging/dist/paging${boot.suffix}`,
      'angular-scrollSpy': `${boot.deployment}angular-scroll-spy/angular-scroll-spy`,
      'angular-ui-tree': `${boot.deployment}angular-ui-tree/dist/angular-ui-tree${boot.suffix}`,

      // Angular+ Dependencies
      'core-js/*': `${boot.deployment}core-js/*`,
      'core-js/es7/reflect': `${boot.deployment}core-js/proposals/reflect-metadata`,
      hammerjs: `${boot.deployment}hammerjs/hammer${boot.suffix}`,
      'reflect-metadata': `${boot.deployment}reflect-metadata/Reflect`,
      rxjs: `${boot.deployment}rxjs/bundles/rxjs.umd${boot.suffix}`,
      'rxjs-compat': `${boot.deployment}rxjs-compat/index`,
      'web-animations-js': `${boot.deployment}web-animations-js/web-animations.min`,
      'zone.js/dist/zone': `${boot.deployment}zone.js/dist/zone${boot.suffix}`,
      numeral: `${boot.deployment}numeral/min/numeral.min`,

      // Angular Decorators
      '@agentepsilon/decko': `${boot.deployment}@agentepsilon/decko/dist/decko`,

      // Angular-Editor
      '@kolkov/angular-editor': `${boot.deployment}@kolkov/angular-editor/bundles/kolkov-angular-editor.umd${boot.suffix}`,

      // Quill Editor Support
      quill: `${boot.deployment}quill/dist/quill`,
      'ngx-quill': `${boot.deployment}ngx-quill/bundles/ngx-quill.umd`,
      'highlight.js/*': `${boot.deployment}highlight.js/*`,

      // Quill Modules
      // 'styles.css': `${coreBundle}js/empty${boot.suffix}`,
      // 'quill-html-edit-button': `${boot.deployment}quill-html-edit-button/dist/quill.htmlEditButton.min`,
      'quill-html-edit-button': `${boot.deployment}quill-html-edit-button/src/quill.htmlEditButton`,
      // 'quill-image-drop-and-paste': `${boot.deployment}quill-image-drop-and-paste/quill-image-drop-and-paste.min`,
      'quill-image-drop-and-paste': `${boot.deployment}quill-image-drop-and-paste/src/QuillImageDropAndPaste`,

      // Ace Support
      'ace-builds': `${boot.deployment}ace-builds/src/ace`,
      'ace-builds/*': `${boot.deployment}ace-builds/*`,

      // Monaco Support
      'ngx-monaco-editor': `${boot.deployment}ngx-monaco-editor/bundles/ngx-monaco-editor.umd`,
      'vs/*': `${boot.deployment}ngx-monaco-editor/assets/monaco/vs/*`,

      // DropZone Support
      dropzone: `${boot.deployment}dropzone/dist/' + boot.directory + 'dropzone-amd-module${boot.suffix}`,

      // NgStack
      '@ngstack/code-editor': `${boot.deployment}@ngstack/code-editor/bundles/ngstack-code-editor.umd${boot.suffix}`,

      // Native Toast Messages
      'toastify-js': `${boot.deployment}toastify-js/src/toastify`,
      'toastify-js/*': `${boot.deployment}toastify-js/src/*`,

      // Twitter pathing
      twitter: 'https://platform.twitter.com/widgets',

      // Lodash is used in place of Underscore in most modern components
      lodash: `${boot.deployment}lodash/lodash${boot.suffix}`,

      // Bowser
      bowser: `${boot.deployment}bowser/bundled`,
      'bowser-legacy': `${boot.deployment}bowser-legacy/bowser${boot.suffix}`,

      // TODO: convert all instances of jQuery to use Stratus selector if possible.
      // jQuery is currently used in a lot of components and directives that probably don't need it, since they are just
      // using the selector so they could just the Stratus Selector: Stratus('div')
      'jquery-native': `${boot.deployment}jquery/dist/jquery${boot.suffix}`,

      'js-md5': `${boot.deployment}js-md5/build/md5.min`,
      md5: `${boot.deployment}js-md5/build/md5.min`,

      // Moment and libraries
      moment: `${boot.deployment}moment/${boot.directory}moment${boot.suffix}`,
      'moment-timezone': `${boot.deployment}moment-timezone/builds/moment-timezone-with-data${boot.suffix}`,
      'moment-timezone/builds/moment-timezone-with-data': `${boot.deployment}moment-timezone/builds/moment-timezone-with-data${boot.suffix}`, // Needed and called directly via fullcalendar
      'moment-range': `${boot.deployment}moment-range/dist/moment-range`,

      // JS Core Libraries
      tslib: `${boot.deployment}tslib/tslib`,
      preact: stratusjsCalendarBundlePath, // Since when was this bundled in calendar? (its what works)
      'preact/compat': stratusjsCalendarBundlePath, // Since when was this bundled in calendar? (its what works)
      'preact/hooks': stratusjsCalendarBundlePath, // Since when was this bundled in calendar? (its what works)
      'skrollr-native': `${boot.deployment}skrollr-typed/${boot.dev ? 'src' : 'dist'}/skrollr${boot.suffix}`,

      // Calendar
      ical: `${boot.deployment}ical.js/build/ical${boot.suffix}`,

      // Masonry TODO: Remove this...  Should not be in use anymore...
      'masonry-native': `${boot.deployment}masonry-layout/dist/masonry.pkgd${boot.suffix}`,

      // Swiper Carousel
      swiper: `${boot.deployment}swiper/swiper-bundle${boot.suffix}`,

      // Froala Directive and Libraries
      froala: `${boot.deployment}froala-editor/js/froala_editor.min`,
      'froala-editor': `${boot.deployment}froala-editor/js/froala_editor.min`,

      // Froala Packages
      'froala-pkgd': `${boot.deployment}froala-editor/js/froala_editor.pkgd.min`,
      'froala-plugins': `${boot.deployment}froala-editor/js/plugins.pkgd.min`,

      // Froala Plugins
      'froala-align': `${boot.deployment}froala-editor/js/plugins/align.min`,
      'froala-char-counter': `${boot.deployment}froala-editor/js/plugins/char_counter.min`,
      'froala-code-beautifier': `${boot.deployment}froala-editor/js/plugins/code_beautifier.min`,
      'froala-code-view': `${boot.deployment}froala-editor/js/plugins/code_view.min`,
      'froala-colors': `${boot.deployment}froala-editor/js/plugins/colors.min`,
      'froala-cryptojs': `${boot.deployment}froala-editor/js/plugins/cryptojs.min`,
      'froala-draggable': `${boot.deployment}froala-editor/js/plugins/draggable.min`,
      'froala-edit-in-popup': `${boot.deployment}froala-editor/js/plugins/edit_in_popup.min`,
      'froala-emoticons': `${boot.deployment}froala-editor/js/plugins/emoticons.min`,
      'froala-entities': `${boot.deployment}froala-editor/js/plugins/entities.min`,
      'froala-file': `${boot.deployment}froala-editor/js/plugins/file.min`,
      'froala-files-manager': `${boot.deployment}froala-editor/js/plugins/files_manager.min`,
      'froala-font-family': `${boot.deployment}froala-editor/js/plugins/font_family.min`,
      'froala-font-size': `${boot.deployment}froala-editor/js/plugins/font_size.min`,
      'froala-forms': `${boot.deployment}froala-editor/js/plugins/forms.min`,
      'froala-fullscreen': `${boot.deployment}froala-editor/js/plugins/fullscreen.min`,
      'froala-help': `${boot.deployment}froala-editor/js/plugins/help.min`,
      'froala-image': `${boot.deployment}froala-editor/js/plugins/image.min`,
      'froala-image-manager': `${boot.deployment}froala-editor/js/plugins/image_manager.min`,
      'froala-inline-class': `${boot.deployment}froala-editor/js/plugins/inline_class.min`,
      'froala-inline-style': `${boot.deployment}froala-editor/js/plugins/inline_style.min`,
      'froala-line-breaker': `${boot.deployment}froala-editor/js/plugins/line_breaker.min`,
      'froala-line-height': `${boot.deployment}froala-editor/js/plugins/line_height.min`,
      'froala-link': `${boot.deployment}froala-editor/js/plugins/link.min`,
      'froala-lists': `${boot.deployment}froala-editor/js/plugins/lists.min`,
      'froala-paragraph-format': `${boot.deployment}froala-editor/js/plugins/paragraph_format.min`,
      'froala-paragraph-style': `${boot.deployment}froala-editor/js/plugins/paragraph_style.min`,
      'froala-print': `${boot.deployment}froala-editor/js/plugins/print.min`,
      'froala-quick-insert': `${boot.deployment}froala-editor/js/plugins/quick_insert.min`,
      'froala-quote': `${boot.deployment}froala-editor/js/plugins/quote.min`,
      'froala-save': `${boot.deployment}froala-editor/js/plugins/save.min`,
      'froala-special-characters': `${boot.deployment}froala-editor/js/plugins/special_characters.min`,
      'froala-table': `${boot.deployment}froala-editor/js/plugins/table.min`,
      'froala-trim-video': `${boot.deployment}froala-editor/js/plugins/trim_video.min`,
      'froala-url': `${boot.deployment}froala-editor/js/plugins/url.min`,
      'froala-video': `${boot.deployment}froala-editor/js/plugins/video.min`,
      'froala-word-paste': `${boot.deployment}froala-editor/js/plugins/word_paste.min`,

      // Froala Third Party Plugins
      'froala-embedly': `${boot.deployment}froala-editor/js/third_party/embedly.min`,
      'froala-font-awesome': `${boot.deployment}froala-editor/js/third_party/font_awesome.min`,
      'froala-image-tui': `${boot.deployment}froala-editor/js/third_party/image_tui.min`,
      'froala-spell-checker': `${boot.deployment}froala-editor/js/third_party/spell_checker.min`,

      // Froala Plugin Dependencies
      html2pdf: `${boot.deployment}html2pdf.js/dist/html2pdf`,
      html2canvas: `${boot.deployment}jspdf/dist/jspdf.min`,
      jspdf: `${boot.deployment}html2canvas/dist/html2canvas${boot.suffix}`,
      'font-awesome': `${boot.deployment}@fortawesome/fontawesome-free/js/all${boot.suffix}`,

      // Angular+ Froala Directive
      'angular-froala-wysiwyg': `${boot.deployment}angular-froala-wysiwyg/bundles/angular-froala-wysiwyg.umd`,

      // AngularJS Froala Directive
      'angular-froala': `${boot.deployment}angular-froala/src/angular-froala`,

      // formio dependencies (WIP)
      formiojs: `${boot.deployment}formiojs/dist/formio.full${boot.suffix}`,

    }
  })
})(this); // eslint-disable-line semi
