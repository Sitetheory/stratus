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
        define(["stratus", "jquery", "underscore", "stratus.views.widgets.base"], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // Views
    // -------------

    // This Backbone View intends to handle Generic rendering for a single Model.
    Stratus.Views.Widgets.Filter = Stratus.Views.Widgets.Base.extend({

        // Properties
        template: _.template('<div>Filter Template Here!</div>'),
        url: '/Api/',
        events: {
            'keypress input[type="text"]': 'enter',
            'keydown input[type="text"]': 'escape',
            'click button[type="submit"]': 'submit'
        },

        options: {
            private: {
                paginate: {
                    persist: false
                },
                api: {
                    limit: null
                },
                forceType: 'collection'
            },
            public: {
                target: null
            }
        },

        /**
         * @param views
         * @returns {boolean}
         */
        onRender: function (views) {
            this.input = this.$el.find('input[type="text"]');
            return true;
        },

        /**
         * @returns {boolean}
         */
        onRegister: function () {
            this.collection.on('reset', this.rerender, this);
            this.collection.on('change', this.rerender, this);
            return true;
        },

        /**
         * @param event
         * @returns {boolean}
         */
        submit: function (event) {
            this.search(this.input.val());
        },

        /**
         * @param event
         */
        enter: function (event) {
            if (event.keyCode === Stratus.Key.Enter) {
                this.search(this.input.val());
            }
        },

        /**
         * @param event
         */
        escape: function (event) {
            if (event.keyCode === Stratus.Key.Escape) {
                this.search();
            }
        },

        // search
        /**
         * @param query
         */
        search: function (query) {
            if (!this.collection.isHydrated()) return false;
            Backbone.history.navigate('filter/' + this.collection.entity + (typeof query === 'undefined' ? '' : '/' + query), true);
        }

    });

}));
