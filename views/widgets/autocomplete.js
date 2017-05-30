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
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'zepto', 'underscore', 'stratus.views.widgets.base', 'selectize'], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _) {

    // Views
    // -------------

    // This Backbone View intends to handle Generic rendering for a single Model.
    Stratus.Views.Widgets.Autocomplete = Stratus.Views.Widgets.Base.extend({

        model: Stratus.Models.Generic,
        template: _.template('<div><span class="title"><span class="name">{{ (typeof model === "object" && model && _.has(model, "id")) ? model.id : "item" }}</span></span></div>'),
        url: '/Api/',

        options: {
            private: {
                requiredCssFile: [Stratus.BaseUrl + 'sitetheorycore/css/sitetheory.selectize.css'],
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
                    persist: false,
                    allowEmptyOption: false
                }
            },
            public: {
                target: null,
                api: null,
                decouple: false
            }
        },

        // initialize()
        // -------------
        // Force model types when present, before initialization
        /**
         * @param options
         * @returns {*}
         */
        initialize: function (options) {
            if (this.$el.dataAttr('entity') && this.$el.dataAttr('id')) {
                this.options.forceType = 'model';
            }
            return Stratus.Views.Widgets.Base.prototype.initialize.call(this, options);
        },

        // postOptions()
        // -------------
        // Set Custom Options: this is the bulk of what is customized for this view
        // controller. The 'options' variable has anything that is defined the in
        // Auto Loader (Stratus.Internals.LoadViews),
        // e.g. options.el, options.entity, options.template, options.options
        /**
         * @param options
         */
        postOptions: function (options) {

            // Dynamic Api Url
            if (this.options.target !== null) {
                var entity = _.ucfirst(this.options.target);
                this.url = '/Api/' + entity + '/';
                if (!Stratus.Collections.has(entity)) {
                    Stratus.Collections.set(entity, new Stratus.Collections.Generic({
                        entity: entity,
                        initialize: true
                    }));
                }
                this.suggestions = Stratus.Collections.get(entity);
            }

            // Grab Selectize Options from DOM
            this.getDataOptions(this.options.selectize);

            // Add Standard Options to Selectize (on init)
            this.options.selectize.render = {
                option: function (model, escape) {
                    // TODO: Switch this for a more appropriate template (i.e. list, container, entity)
                    return this.template({ model: model, options: this.options, scope: 'suggestion' });
                }.bind(this)
            };

            this.options.selectize.load = function (query, callback) {
                if (!query.length && !this.initial.request) return callback();
                this.initial.request = false;
                if (!this.options.decouple && _.has(this, 'suggestions')) {
                    var convoy = {};
                    if (query.length) {
                        this.suggestions.meta.set('api.query', query);
                        this.suggestions.once('success', function () {
                            convoy = this.suggestions.toJSON();
                            callback(_.has(convoy, 'payload') ? convoy.payload : convoy);
                        }, this);
                        this.suggestions.refresh({ reset: true });
                    } else {
                        convoy = this.suggestions.toJSON();
                        callback(_.has(convoy, 'payload') ? convoy.payload : convoy);
                    }
                } else {
                    $.ajax({
                        url: this.url + '?query=' + query + '&' + $.param({ options: this.options.api }),
                        type: 'GET',
                        error: function () {
                            callback();
                        },
                        success: function (res) {
                            callback(res.payload);
                        }
                    });
                }
            }.bind(this);
        },

        // promise()
        // -------------
        // Begin initializing the widget within an asynchronous promise realm
        /**
         * @param options
         * @param resolve
         * @param reject
         */
        promise: function (options, resolve, reject) {
            if (_.contains(this.options.selectize.plugins, 'drag_drop')) {
                require(['jquery-ui'], function () {
                    Stratus.Views.Widgets.Base.prototype.promise.call(this, options, resolve, reject);
                }.bind(this));
            } else {
                Stratus.Views.Widgets.Base.prototype.promise.call(this, options, resolve, reject);
            }
        },

        /**
         * @param selectedElement
         */
        storeElement: function (selectedElement) {
            // NOTE: this overwrites the this.$el with the selectize, so it wipes out the normal widget prompt, status responses, etc
            var $parent = this.$el;
            if (this.options.label) {
                this.$el.append('<div class="autocomplete"></div>');
                $parent = this.$el.find('.autocomplete');
            }
            $parent.selectize(this.options.selectize);
            this.initial = this.initial || {
                    request: true,
                    load: true
                };
            this.$element = $parent[0].selectize;
            this.registeredElement = false;
        },

        // render()
        // --------
        // Overwriting Basic Render
        /**
         * TODO: Change this to onRender, which will force local DOM templates to be converted into .html files for re-use
         * @param entries
         * @returns {boolean}
         */
        onRender: function (entries) {
            // Manually Select the items selected (this shouldn't be necessary since we set the 'items' field in the options, but that doesn't work so we are currently doing it manually.
            // FIXME: Various things aren't firing in this widget; we'll need to go through and debug most of it.
            var that = this;
            this.$element.on('load', function () {
                if (that.initial.load) {
                    that.initial.load = false;

                    if (that.options.selectize.items !== null && that.options.selectize.items.length > 0) {
                        _.each(that.options.selectize.items, function (el) {
                            // If the value doesn't exists in the list add it to the list so that it shows up
                            if (!_.has(this.options, el)) {
                                var data = {};
                                /*
                                var data = new Stratus.Prototypes.Model();
                                data.set(that.options.selectize.valueField, el);
                                data.set(that.options.selectize.labelField, el);
                                */
                                data[that.options.selectize.valueField] = el;
                                data[that.options.selectize.labelField] = el;
                                this.addOption(data);
                            }

                            // set the default value selected
                            this.setValue([el]);
                        }, this);
                    }

                    // set dynamic api value if available
                    if (_.has(that, 'selected')) {
                        this.setValue(that.selected);
                    }
                }
            });
            return true;
        },

        // getValue()
        // -----------
        // Get the value for this widget
        /**
         * @returns {*}
         */
        getValue: function () {
            if (!this.$element || typeof this.$element !== 'object' || (typeof this.$element.length !== 'undefined' && !this.$element.length)) {
                return false;
            }
            var parsed = [];
            var selected = this.$element.getValue();
            selected = (selected.length) ? selected.split(',') : null;
            if (selected) {
                var id;
                _.each(selected, function (value) {
                    id = parseInt(value);
                    if (!isNaN(id)) {
                        parsed.push({ id: id });
                    }
                }, parsed);
            }
            return parsed;
        },

        // setValue()
        // -----------
        // Set the value on this widget
        /**
         * @param value
         * @returns {boolean}
         */
        setValue: function (value) {
            if (!this.$element || typeof this.$element !== 'object' || (typeof this.$element.length !== 'undefined' && !this.$element.length)) {
                return false;
            }
            this.selected = [];
            var parsed = '';
            if (value && value.length) {
                _.each(value, function (model) {
                    if (model && typeof model === 'object' && _.has(model, 'id')) {
                        if (parsed.length) parsed += ',';
                        parsed += model.id;
                        this.selected.push(model.id);
                    }
                }, this);
            }
            this.$el.dataAttr('value', parsed);
            this.$element.setValue(this.selected);
            return true;
        }

    });

}));
