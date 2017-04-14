// Configuration
// -------------

boot.config({

    // Connection Settings
    waitSeconds: 30,

    // Cache Busting
    urlArgs: 'v=' + boot.cacheTime,

    // Version Location (Disabled During Beta Testing)
    baseUrl: ((boot.dev || boot.local) ? boot.host + '/' : boot.cdn) + boot.relative,

    // Dependencies
    shim: {
        /* Angular */
        angular: {
            exports: 'angular'
        },
        'angular-aria': { deps: ['angular'] },
        'angular-animate': { deps: ['angular'] },
        'angular-messages': { deps: ['angular'] },
        'angular-material': {
            deps: [
                'angular-aria',
                'angular-animate',
                'angular-messages'
            ]
        },
        'angular-sanitize': { deps: ['angular'] },

        /* Angular Modules */
        'angular-file-upload': { deps: ['angular'] },
        'angular-icons': { deps: ['angular'] },
        'angular-scrollSpy': { deps: ['angular'] },

        // Charts
        'chart.js': {
            deps: ['angular', 'chart']
        },

        /* Backbone */
        'backbone.relational': { deps: ['backbone'] },

        /* jQuery */
        selectize: { deps: ['zepto'] },
        timeago: { deps: ['zepto'] },
        watch: { deps: ['zepto'] },
        masonry: { deps: ['zepto'] },

        /* Froala */
        'froala-align': { deps: ['froala'] },
        'froala-char-counter': { deps: ['froala'] },
        'froala-code-beautifier': { deps: ['froala'] },
        'froala-code-view': { deps: ['froala'] },
        'froala-colors': { deps: ['froala'] },
        'froala-draggable': { deps: ['froala'] },
        'froala-emoticons': { deps: ['froala'] },
        'froala-entities': { deps: ['froala'] },
        'froala-file': { deps: ['froala'] },
        'froala-font-family': { deps: ['froala'] },
        'froala-font-size': { deps: ['froala'] },
        'froala-forms': { deps: ['froala'] },
        'froala-fullscreen': { deps: ['froala'] },
        'froala-help': { deps: ['froala'] },
        'froala-image': { deps: ['froala'] },
        'froala-image-manager': { deps: ['froala', 'froala-image'] },
        'froala-inline-style': { deps: ['froala'] },
        'froala-line-breaker': { deps: ['froala'] },
        'froala-link': { deps: ['froala'] },
        'froala-lists': { deps: ['froala'] },
        'froala-paragraph-format': { deps: ['froala'] },
        'froala-paragraph-style': { deps: ['froala'] },
        'froala-quick-insert': { deps: ['froala'] },
        'froala-quote': { deps: ['froala'] },
        'froala-save': { deps: ['froala'] },
        'froala-special-characters': { deps: ['froala'] },
        'froala-table': { deps: ['froala'] },
        'froala-url': { deps: ['froala'] },
        'froala-video': { deps: ['froala'] },
        'froala-word-paste': { deps: ['froala'] },
        'angular-froala': { deps: ['angular', 'froala'] },

        /* Calendar */
        fullcalendar: {
            deps: [
                'zepto',
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
         /**/
        {
            name: 'codemirror',
            location: boot.bundle + 'stratus/bower_components/codemirror',
            main: 'lib/codemirror'
        }
    ],

    // Relative Paths
    paths: {
        /* Require.js Plugins */
        text: boot.bundle + 'stratus/bower_components/text/text',

        /* Stratus Core Library */
        stratus: boot.bundle + 'stratus/stratus' + boot.suffix,

        /* Stratus Core Collections */
        'stratus.collections.generic': boot.bundle + 'stratus/collections/generic' + boot.suffix,

        /* Stratus Core Models */
        'stratus.models.generic': boot.bundle + 'stratus/models/generic' + boot.suffix,

        /* Stratus Core Routers */
        'stratus.routers.generic': boot.bundle + 'stratus/routers/generic' + boot.suffix,
        'stratus.routers.version': boot.bundle + 'stratus/routers/version' + boot.suffix,

        /* Stratus Controllers */
        'stratus.controllers.generic': boot.bundle + 'stratus/controllers/generic' + boot.suffix,

        /* Stratus Core Components */
        'stratus.components.base': boot.bundle + 'stratus/components/base' + boot.suffix,
        'stratus.components.dateTime': boot.bundle + 'stratus/components/dateTime' + boot.suffix,
        'stratus.components.delete': boot.bundle + 'stratus/components/delete' + boot.suffix,
        'stratus.components.edit': boot.bundle + 'stratus/components/edit' + boot.suffix,
        'stratus.components.facebook': boot.bundle + 'stratus/components/facebook' + boot.suffix,
        'stratus.components.filter': boot.bundle + 'stratus/components/filter' + boot.suffix,
        'stratus.components.help': boot.bundle + 'stratus/components/help' + boot.suffix,
        'stratus.components.mediaSelector': boot.bundle + 'stratus/components/mediaSelector' + boot.suffix,
        'stratus.components.optionValue': boot.bundle + 'stratus/components/optionValue' + boot.suffix,
        'stratus.components.pagination': boot.bundle + 'stratus/components/pagination' + boot.suffix,
        'stratus.components.search': boot.bundle + 'stratus/components/search' + boot.suffix,
        'stratus.components.selector': boot.bundle + 'stratus/components/selector' + boot.suffix,
        'stratus.components.sort': boot.bundle + 'stratus/components/sort' + boot.suffix,
        'stratus.components.tweet': boot.bundle + 'stratus/components/tweet' + boot.suffix,
        'stratus.components.upload': boot.bundle + 'stratus/components/upload' + boot.suffix,
        'stratus.components.visualSelector': boot.bundle + 'stratus/components/visualSelector' + boot.suffix,

        // TODO: Move these to Sitetheory since they are specific to Sitetheory
        'stratus.components.permission': boot.bundle + 'stratus/components/permission' + boot.suffix,
        'stratus.components.permissions': boot.bundle + 'stratus/components/permissions' + boot.suffix,
        'stratus.components.publish': boot.bundle + 'stratus/components/publish' + boot.suffix,
        'stratus.components.themeSelector': boot.bundle + 'stratus/components/themeSelector' + boot.suffix,

        /* Stratus Core Directives */
        'stratus.directives.base': boot.bundle + 'stratus/directives/base' + boot.suffix,
        'stratus.directives.drag': boot.bundle + 'stratus/directives/drag' + boot.suffix,
        'stratus.directives.drop': boot.bundle + 'stratus/directives/drop' + boot.suffix,
        'stratus.directives.href': boot.bundle + 'stratus/directives/href' + boot.suffix,
        'stratus.directives.singleClick': boot.bundle + 'stratus/directives/singleClick' + boot.suffix,
        'stratus.directives.src': boot.bundle + 'stratus/directives/src' + boot.suffix,
        'stratus.directives.trigger': boot.bundle + 'stratus/directives/trigger' + boot.suffix,
        'stratus.directives.validate': boot.bundle + 'stratus/directives/validate' + boot.suffix,

        // TODO: Move these to Sitetheory since they are specific to Sitetheory
        'stratus.directives.froala': boot.bundle + 'stratus/directives/froala' + boot.suffix,
        'stratus.directives.redactor': boot.bundle + 'stratus/directives/redactor' + boot.suffix,

        /* Stratus Core Filters */
        'stratus.filters.gravatar': boot.bundle + 'stratus/filters/gravatar' + boot.suffix,
        'stratus.filters.map': boot.bundle + 'stratus/filters/map' + boot.suffix,
        'stratus.filters.moment': boot.bundle + 'stratus/filters/moment' + boot.suffix,
        'stratus.filters.reduce': boot.bundle + 'stratus/filters/reduce' + boot.suffix,
        'stratus.filters.truncate': boot.bundle + 'stratus/filters/truncate' + boot.suffix,

        /* Stratus Core Services */
        'stratus.services.model': boot.bundle + 'stratus/services/model' + boot.suffix,
        'stratus.services.collection': boot.bundle + 'stratus/services/collection' + boot.suffix,
        'stratus.services.registry': boot.bundle + 'stratus/services/registry' + boot.suffix,

        /* Stratus Core Views */
        'stratus.views.base': boot.bundle + 'stratus/views/base' + boot.suffix,

        /* Stratus Core Widgets */
        'stratus.views.widgets.base': boot.bundle + 'stratus/views/widgets/base' + boot.suffix,
        'stratus.views.widgets.autocomplete': boot.bundle + 'stratus/views/widgets/autocomplete' + boot.suffix,
        'stratus.views.widgets.calendar': boot.bundle + 'stratus/views/widgets/calendar' + boot.suffix,
        'stratus.views.widgets.collection': boot.bundle + 'stratus/views/widgets/collection' + boot.suffix,
        'stratus.views.widgets.datetime': boot.bundle + 'stratus/views/widgets/datetime' + boot.suffix,
        'stratus.views.widgets.delete': boot.bundle + 'stratus/views/widgets/delete' + boot.suffix,
        'stratus.views.widgets.dialogue': boot.bundle + 'stratus/views/widgets/dialogue' + boot.suffix,
        'stratus.views.widgets.display': boot.bundle + 'stratus/views/widgets/display' + boot.suffix,
        'stratus.views.widgets.editor': boot.bundle + 'stratus/views/widgets/editor' + boot.suffix,
        'stratus.views.widgets.filter': boot.bundle + 'stratus/views/widgets/filter' + boot.suffix,
        'stratus.views.widgets.generic': boot.bundle + 'stratus/views/widgets/generic' + boot.suffix,
        'stratus.views.widgets.link': boot.bundle + 'stratus/views/widgets/link' + boot.suffix,
        'stratus.views.widgets.map': boot.bundle + 'stratus/views/widgets/map' + boot.suffix,
        'stratus.views.widgets.pagination': boot.bundle + 'stratus/views/widgets/pagination' + boot.suffix,
        'stratus.views.widgets.password': boot.bundle + 'stratus/views/widgets/password' + boot.suffix,
        'stratus.views.widgets.publish': boot.bundle + 'stratus/views/widgets/publish' + boot.suffix,
        'stratus.views.widgets.save': boot.bundle + 'stratus/views/widgets/save' + boot.suffix,
        'stratus.views.widgets.select': boot.bundle + 'stratus/views/widgets/select' + boot.suffix,
        'stratus.views.widgets.text': boot.bundle + 'stratus/views/widgets/text' + boot.suffix,
        'stratus.views.widgets.toggle': boot.bundle + 'stratus/views/widgets/toggle' + boot.suffix,
        'stratus.views.widgets.routing': boot.bundle + 'stratus/views/widgets/routing' + boot.suffix,
        'stratus.views.widgets.upload': boot.bundle + 'stratus/views/widgets/upload' + boot.suffix,

        /* Stratus Core Plugins */
        'stratus.views.plugins.base': boot.bundle + 'stratus/views/plugins/base' + boot.suffix,
        'stratus.views.plugins.addclass': boot.bundle + 'stratus/views/plugins/addclass' + boot.suffix,
        'stratus.views.plugins.addclose': boot.bundle + 'stratus/views/plugins/addclose' + boot.suffix,
        'stratus.views.plugins.carousel': boot.bundle + 'stratus/views/plugins/carousel' + boot.suffix,
        'stratus.views.plugins.dim': boot.bundle + 'stratus/views/plugins/dim' + boot.suffix,
        'stratus.views.plugins.drawer': boot.bundle + 'stratus/views/plugins/drawer' + boot.suffix,
        'stratus.views.plugins.help': boot.bundle + 'stratus/views/plugins/help' + boot.suffix,
        'stratus.views.plugins.masonry': boot.bundle + 'stratus/views/plugins/masonry' + boot.suffix,
        'stratus.views.plugins.morebox': boot.bundle + 'stratus/views/plugins/morebox' + boot.suffix,
        'stratus.views.plugins.onscreen': boot.bundle + 'stratus/views/plugins/onscreen' + boot.suffix,
        'stratus.views.plugins.popover': boot.bundle + 'stratus/views/plugins/popover' + boot.suffix,

        /* Stratus Core Underscore Templates */
        /* TODO: remove these, they aren't even used anymore. Convert to components and remove. */
        'templates-base': boot.bundle + 'stratus/views/widgets/base.html',
        'templates-filter-search': boot.bundle + 'stratus/views/widgets/filter.search.html',
        'templates-filter-sort': boot.bundle + 'stratus/views/widgets/filter.sort.html',
        'templates-filter-type': boot.bundle + 'stratus/views/widgets/filter.type.html',
        'templates-pagination': boot.bundle + 'stratus/views/widgets/pagination.html',
        'templates-toggle': boot.bundle + 'stratus/views/widgets/toggle.html',
        'templates-widgets-select': boot.bundle + 'stratus/views/widgets/select.html',
        'templates-widgets-select-options': boot.bundle + 'stratus/views/widgets/select.options.html',
        'templates-widgets-selected-options': boot.bundle + 'stratus/views/widgets/selected.options.html',
        'templates-upload': boot.bundle + 'stratus/views/widgets/upload.html',

        /* Froala Libraries */

        // TODO: Move these to Sitetheory since they are specific to Sitetheory
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
        bowser: boot.bundle + 'stratus/bower_components/bowser/src/bowser',
        chart: boot.bundle + 'stratus/bower_components/chart.js/dist/Chart',
        chartist: '//cdnjs.cloudflare.com/ajax/libs/chartist/0.9.5/chartist' + boot.suffix,
        d3: '//cdnjs.cloudflare.com/ajax/libs/d3/3.5.10/d3' + boot.suffix,
        dropzone: '//cdnjs.cloudflare.com/ajax/libs/dropzone/4.3.0/' + boot.directory + 'dropzone-amd-module' + boot.suffix,
        fullcalendar: boot.bundle + 'stratus/bower_components/fullcalendar/dist/fullcalendar' + boot.suffix,
        highlight: '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.3.0/highlight' + boot.suffix,
        less: boot.bundle + 'stratus/bower_components/less/dist/less' + boot.suffix,
        masonry: boot.bundle + 'stratus/bower_components/masonry/dist/masonry.pkgd' + boot.suffix,
        math: boot.bundle + 'stratus/bower_components/mathjs/dist/math' + boot.suffix,
        md5: boot.bundle + 'stratus/bower_components/js-md5/build/md5.min',
        moment: boot.bundle + 'stratus/bower_components/moment/' + boot.directory + 'moment' + boot.suffix,
        'moment-timezone': boot.bundle + 'stratus/bower_components/moment-timezone/builds/moment-timezone-with-data' + boot.suffix,
        'moment-range': boot.bundle + 'stratus/bower_components/moment-range/dist/moment-range' + boot.suffix,
        promise: boot.bundle + 'stratus/bower_components/promise-polyfill/promise' + boot.suffix,
        sortablejs: boot.bundle + 'stratus/bower_components/Sortable/Sortable' + boot.suffix,
        zepto: boot.bundle + 'stratus/bower_components/zepto/zepto' + boot.suffix,

        /* Angular */
        angular: boot.bundle + 'stratus/bower_components/angular/angular' + boot.suffix,
        'angular-animate': boot.bundle + 'stratus/bower_components/angular-animate/angular-animate' + boot.suffix,
        'angular-aria': boot.bundle + 'stratus/bower_components/angular-aria/angular-aria' + boot.suffix,
        'angular-material': boot.bundle + 'stratus/bower_components/angular-material/angular-material' + boot.suffix,
        'angular-messages': boot.bundle + 'stratus/bower_components/angular-messages/angular-messages' + boot.suffix,
        'angular-sanitize': boot.bundle + 'stratus/bower_components/angular-sanitize/angular-sanitize' + boot.suffix,
        'angular-chart': boot.bundle + 'stratus/bower_components/angular-chart.js/dist/angular-chart' + boot.suffix,
        'angular-icons': boot.bundle + 'stratus/bower_components/angular-material-icons/angular-material-icons' + boot.suffix,
        'angular-file-upload': boot.bundle + 'stratus/bower_components/ng-file-upload/ng-file-upload' + boot.suffix,
        'angular-sortable': boot.bundle + 'stratus/bower_components/ng-sortable/angular-legacy-sortable' + boot.suffix,
        'angular-scrollSpy': boot.bundle + 'stratus/bower_components/angular-scroll-spy/angular-scroll-spy',

        /* Backbone */
        underscore: boot.bundle + 'stratus/bower_components/underscore/underscore' + boot.dashSuffix,
        backbone: boot.bundle + 'stratus/external/backbone' + boot.suffix,
        'backbone.relational': boot.bundle + 'stratus/normalizers/backbone.relational.injector',
        'backbone.relational.core': boot.bundle + 'stratus/bower_components/backbone-relational/backbone-relational',

        /* jQuery */
        'jquery-sandbox': boot.bundle + 'stratus/normalizers/jquery.sandbox' + boot.suffix,
        jquery: boot.bundle + 'stratus/bower_components/jquery/dist/jquery' + boot.suffix,
        'jquery-ui': boot.bundle + 'stratus/bower_components/jquery-ui/jquery-ui' + boot.suffix,
        selectize: boot.bundle + 'stratus/bower_components/selectize/dist/js/standalone/selectize' + boot.suffix,
        watch: '//cdnjs.cloudflare.com/ajax/libs/watch/2.0.4/jquery.watch' + boot.suffix,

        /* Tether */
        tether: boot.bundle + 'stratus/bower_components/tether/dist/js/tether' + boot.suffix,
        'tether-drop': boot.bundle + 'stratus/bower_components/tether-drop/dist/js/drop' + boot.suffix,
        'tether-shepherd': boot.bundle + 'stratus/bower_components/tether-shepherd/dist/js/shepherd' + boot.suffix,
        'tether-tooltip': boot.bundle + 'stratus/bower_components/tether-tooltip/dist/js/tooltip' + boot.suffix
    }
});
