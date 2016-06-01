//     Stratus.Views.Autocomplete.js 1.0

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
        define(["stratus", "jquery", "underscore", "text!templates-pagination", "stratus.views.widgets.base"], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _, Template) {

    // Views
    // -------------

    // This Backbone View intends to handle Generic rendering for a single Model.
    Stratus.Views.Widgets.Pagination = Stratus.Views.Widgets.Base.extend({

        collection: Stratus.Collections.Generic,
        template: _.template('<div>Pagination Template Here!</div>'),
        url: '/Api/',

        options: {
            private: {
                paginate: {
                    persist: false
                },
                api: {
                    limit: null
                }
            },
            public: {
                target: null
            }
        },

        /**
         * @param options
         */
        preOptions: function (options) {
            if (typeof Template === 'string') this.template = _.template(Template);
        },

        /**
         * @returns {boolean}
         */
        onRegister: function () {
            this.collection.on('reset', this.render, this);
            this.collection.on('change', this.render, this);
            return true;
        },

        /**
         * @returns {boolean}
         */
        render: function () {
            this.$el.html(this.template({
                paginator: {
                    countCurrent: this.collection.meta.get('countCurrent'),
                    countTotal: this.collection.meta.get('countTotal'),
                    pageCurrent: this.collection.meta.get('pageCurrent'),
                    pageTotal: this.collection.meta.get('pageTotal')
                },
                entity: this.collection.entity
            }));
            this.renderEvent();
            return true;
        }

    });

}));
