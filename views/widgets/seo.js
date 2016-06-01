//     Stratus.Views.Seo.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of this information or reproduction of this
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io


// Examples
// ========

// Data Attributes to Control Options
// ----------------------------------
// If you need to manipulate the widget, you can set data attributes to change the default values. See the options in this.options below to know which attributes can be modified from the data attributes.

// Widget
// ======

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["stratus", "jquery", "underscore", "stratus.views.widgets.base"], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // SEO Widget
    // ----------

    // SEO view which extends the view base.
    Stratus.Views.Widgets.Seo = Stratus.Views.Widgets.Base.extend({

        model: Stratus.Models.Generic,

        // Reference stratus.templates.publish.html for non-minified version
        template: _.template('<span id="{{ elementId }}" class="btn btnSeo" data-plugin="drawer"><div class="btnGradientLight"></div><span class="{{ options.classIcon }}"></span>{% if (options.textBtn) { %}<span class="seoText">{{ options.textBtn }}</span>{% } %}</span><div id="{{ elementId }}-drawer" class="hidden">{% if (options.textTitle) { %}<h1 class="seoTitle">{{ options.textTitle }}</h1>{% } %}<div data-type="text" data-property="viewVersion.headTitle" data-label="Browser Title" data-help="By default the browser title will be your content title, but this field will overwrite the default if you want a custom keyword-rich title for SEO purposes."></div><div data-type="text" data-property="viewVersion.description" data-label="Description" data-help="Enter a 155 character description which summarizes the content of this page. Many search engines will use this when displaying the search results."></div><div data-type="text" data-property="viewVersion.keywords" data-label="Keywords" data-help="Use 5-10 comma separated keywords for words or phrases for which you want to rank high. Put your most important keywords first. Do <strong>not</strong> include any keywords which are not on your page. The title, description, friendly URL, and page content <strong>should</strong> also contain these keywords for optimal SEO ranking."></div><div id="routing" data-type="Collection" data-entity="routing" data-target=\'{"entity": "view", "id":{{ model.id }}}\' data-template="sitetheorycorebundle/stratus/templates/routing.collection.html" data-rerender="none" data-prototype=\'{"view": {"id": {{ model.id }} } }\'></div></div>'),

        options: {
            private: {
                // individual included widgets auto-save on their own, there are no fields on the widget that need to be saved
                autoSave: false,
                forceType: 'model'
            },
            public: {
                style: false,
                textTitle: 'SEO',
                textBtn: null,
                classIcon: 'seoIcon glyphicon glyphicon-tag',
                // TODO: point to the cloud server (PATH!)
                // The CSS file to load for this widget
                cssFile: ['/sitetheory/v/1/0/bundles/sitetheorycore/js/lib/stratus/views/templates/stratus.views.widgets.templates.seo.css']
            }
        }
    });

}));
