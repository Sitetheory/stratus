//     Stratus.Views.Widgets.Autocomplete.js 1.0

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

// TODO: this needs to be brought up to our Widget standards so it's more consistent with the way we do things now with
// promises, rendering, switching templates, etc.

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
    if (typeof define === "function" && define.amd) {
        define(["stratus", "jquery", "underscore", "stratus.views.widgets.base", "selectize"], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // Views
    // -------------

    // This Backbone View intends to handle Generic rendering for a single Model.
    Stratus.Views.Widgets.Autocomplete = Stratus.Views.Widgets.Base.extend({

        model: Stratus.Models.Generic,
        template: _.template('<div><span class="title"><span class="name">{{ model.id }}</span></span></div>'),
        url: '/Api/',

        options: {
            private: {
                // TODO: point to the cloud server (PATH!)
                requiredCssFile: ['/sitetheory/v/1/0/bundles/sitetheorycore/css/sitetheory.selectize.css'],
                selectize: {
                    preload: true,
                    delimiter: null,
                    plugins: null,
                    items: null,
                    valueField: 'id',
                    labelField: 'id',
                    searchField: ['id'],
                    maxItems: 1,
                    create: true,
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

        // promise()
        // -------------
        // Begin initializing the widget within an asynchronous promise realm
        /**
         * @param options
         * @param fulfill
         * @param reject
         */
        promise: function (options, fulfill, reject) {
            if (_.contains(this.options.selectize.plugins, 'drag_drop')) {
                require(['jquery-ui'], function () {
                    Stratus.Views.Widgets.Base.prototype.promise.call(this, options, fulfill, reject);
                }.bind(this));
            } else {
                Stratus.Views.Widgets.Base.prototype.promise.call(this, options, fulfill, reject);
            }
        },

        // render()
        // --------
        // Overwriting Basic Render
        render: function (entries) {
            // NOTE: this overwrites the this.$el with the selectize, so it wipes out the normal widget prompt, status responses, etc
            this.$el.selectize(this.options.selectize);
            this.initial = this.initial || {
                request: true,
                load: true
            };
            // Manually Select the items selected (this shouldn't be necessary since we set the 'items' field in the options, but that doesn't work so we are currently doing it manually.
            var view = this;
            this.$el[0].selectize.on('load', function () {
                if (view.initial.load && view.options.selectize.items !== null && view.options.selectize.items.length > 0) {
                    view.initial.load = false;
                    _.each(view.options.selectize.items, function (el) {
                        // If the value doesn't exists in the list add it to the list so that it shows up
                        if (!_.has(this.options, el)) {
                            var data = {};
                            data[view.options.selectize.valueField] = el;
                            data[view.options.selectize.labelField] = el;
                            this.addOption(data);
                        }
                        // set the default value selected
                        this.setValue([el]);
                    }, this);
                }
            });

            return this;
        },

        // Set Custom Options: this is the bulk of what is customized for this view
        // controller. The 'options' variable has anything that is defined the in
        // Auto Loader (Stratus.Internals.LoadViews),
        // e.g. options.el, options.entity, options.template, options.options
        postOptions: function (options) {

            // Dynamic Api Url
            if (this.options.target !== null) {
                this.url = '/Api/' + this.options.target + '/';
            }

            // Add Standard Options to Selectize (on init)
            this.options.selectize.render = {
                option: function (model, escape) {
                    return this.template({model: model, options: this.options});
                }.bind(this)
            };
            this.options.selectize.load = function (query, callback) {
                if (!query.length && !this.initial.request) return callback();
                this.initial.request = false;
                $.ajax({
                    url: this.url + '?query=' + query + '&' + $.param({options: this.options.api}),
                    type: 'GET',
                    error: function() {
                        callback();
                    },
                    success: function(res) {
                        callback(res.payload);
                    }
                });
            }.bind(this);
        }

    });

}));
