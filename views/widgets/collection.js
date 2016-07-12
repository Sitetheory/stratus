//     Stratus.Views.Widgets.Collection.js 1.0

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

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'jquery', 'underscore', 'masonry', 'sortable', 'stratus.views.widgets.base', 'stratus.views.widgets.generic'], factory);
    } else {
        factory(root.Stratus, root.$, root._, root.Masonry, root.Sortable);
    }
}(this, function (Stratus, $, _, Masonry, Sortable) {

    // Generic Collection View
    // -------------

    // This Backbone View intends to handle Generic rendering for the entire Collection.
    Stratus.Views.Widgets.Collection = Stratus.Views.Widgets.Base.extend({

        // Defaults
        // -------------

        template: _.template('<div data-collection="{{ globals.uid }}" data-entity="{{ globals.entity }}" data-id="{{ model.id }}"></div>'),

        // If you need custom error Messages, you can define the optionsCustom in data attributes to the set the
        // text, OR you can pass in a custom list template in the data-templates='{"list":"path or config value"}'
        errorTemplate: _.template('{% if (collection.meta.has("api.q")) { %}<div class="{{ options.cssNoResults}}"><div class="message">{{ options.textNoResults }}</div><div class="icon"></div></div>{% } else if (typeof code === "string") { %}<div class="{{ options.cssError}}"><div class="message">An Internal Error (Code: {{ code }}) occurred.  Please notify support with the url and time of the error.</div><div class="icon"></div></div>{% } else { %}<div class="{{ options.cssNoContent }}"><div class="message">{{ options.textNoContent }}</div><div class="icon"></div></div>{% } %}'),
        events: {
            'keypress #newGeneric': 'createOnEnter',
            start: 'dragStart',
            end: 'dragEnd'
        },
        templateRender: 'container',
        options: {
            private: {
                api: {
                    limit: null
                },
                autoLoader: false
            },
            public: {
                /* model property source */
                source: null,

                /* iterations */
                limit: null,
                batch: null,
                phantoms: null,
                width: null,
                height: null,
                meta: null,

                /* xhr events */
                success: null,
                error: null,

                /* model events */
                add: null,
                change: null,
                destroy: null,

                /* event parser */
                rerender: null,
                resync: null,

                /* plugins */
                masonry: null,
                sortable: null,

                /* standalone property toggle */
                standalone: false,

                /* display */

                // TODO: these messages should be more intelligent with different messages for context, i.e. if something was searched/filtered, or if there just isn't any content by default yet.
                // Default message if there are no results found.
                textNoResults: 'We were unable to find any content matching your request.',

                // Default animation if there aren't any query results found.
                cssNoResults: 'empty',
                textNoContent: 'No content available.',

                // Default animation if the XHR request failed
                cssError: 'error',

                // Default animation if there aren't any initial content found.
                cssNoContent: 'empty'
            }
        },

        // This stores whether or not the Collection has been handled at some point
        handled: false,

        // promise()
        // -------------
        // Begin initializing the widget within an asynchronous promise realm
        /**
         * @param options
         * @param fulfill
         * @param reject
         */
        promise: function (options, fulfill, reject) {

            /*
             if (typeof options.template === 'function') {}
             */

            // Store Options Locally
            this.templates = (_.has(options, 'templates')) ? options.templates : null;
            this.entity = (_.has(options, 'entity')) ? options.entity : null;

            // Handle Render Triggers
            if (_.has(this.options, 'rerender')) {
                var events = ['success', 'error', 'add', 'change', 'destroy'];
                var triggers = _.isArray(this.options.rerender) ? _.clone(this.options.rerender) : null;
                var action = (triggers) ? 'none' : this.options.rerender;

                // Set Chosen Events
                _.each(events, function (event) {
                    this.options[event] = action;
                }, this);

                // Set Triggers
                if (triggers) {
                    _.each(triggers, function (event) {
                        this.options[event] = 'all';
                    }, this);
                }

                if (this.options.rerender === 'none') {
                    /*
                     _.each(optionsList, changeOptions, this);
                     */
                    this.options.success = 'none';
                    this.options.error = 'none';

                    this.options.add = 'none';
                    this.options.change = 'none';
                    this.options.destroy = 'none';
                }
            }

            if (this.collection && typeof this.collection === 'object') {
                this.handleCollection();
            } else if (this.model && typeof this.model === 'object') {
                this.handleProperty();
            }

            this.views = {};

            this.once('render', function (widget) {
                fulfill(widget);
            });
        },

        // postOptions()
        // ------------------
        // Some values must trigger other conditional default values
        postOptions: function (options) {
            // allow data-limit attribute to set the limit.
            if (this.options.limit) this.options.api.limit = this.options.limit;
        },

        // Priming
        // -------------

        // primeAdd
        /**
         * @param model
         * @param xhr
         */
        primeAdd: function (model, xhr) {
            /*
             console.trace('Adding:', this.options.add, model, xhr);
             */
            if (!this.options.add || this.options.add === 'all') {
                this.addAll();
            } else if (this.options.add === 'one' || this.options.add === 'none') {
                this.clearGlobals();
                this.collection.models.forEach(this.buildGlobals, this);
                this.addOne(model);
            } else {
                console.warn('Add Event contains unknown option:', this.options.add);
            }
        },

        // primeReset
        /**
         * @param collection
         * @param xhr
         */
        primeReset: function (collection, xhr) {
            this.addAll();
        },

        // primeSuccess
        /**
         * @param model
         * @param xhr
         */
        primeSuccess: function (model, xhr) {
            if (!this.options.success || this.options.success === 'all') this.addAll();
        },

        // primeError
        /**
         * @param model
         * @param xhr
         */
        primeError: function (model, xhr) {
            // if (!this.options.error || this.options.error === "all") this.addAll();
        },

        // Changing the Model will already change the Widget (and all nested object),
        // we are only determining whether or not to render the list entirely, again
        /**
         * @param model
         * @param options
         */
        primeChange: function (model, options) {
            if (!this.options.change || this.options.change === 'all' || (_.has(options, 'xhr') && (!this.options.success || this.options.success === 'all'))) {
                this.addAll();
            }
        },

        // Destroying the Model will already destroy the Widget (and all nested object),
        // we are only determining whether or not to render the list entirely, again
        /**
         * @param model
         * @param collection
         * @param xhr
         */
        primeDestroy: function (model, collection, xhr) {
            if (!this.options.destroy) this.addAll();
        },

        /* TODO: Bring Targeting over to the Stratus Loader so we can use this continuously for models. */

        /**
         * @returns {{entity: *, id: *}}
         */
        modelTarget: function () {
            var target = {
                entity: this.model.entity,
                id: 'id'
            };
            if (typeof this.propertyName === 'string' && this.propertyName.indexOf('.') !== -1) {
                target.entity = _.first(this.propertyName.split('.'));
                if (this.model.has(target.entity + '.id')) {
                    target.id = target.entity + '.id';
                } else {
                    target.entity = this.model.entity;
                }
            }
            return {
                entity: _.ucfirst(target.entity),
                id: this.model.get(target.id)
            };
        },

        // handleProperty
        handleProperty: function () {
            // This will be holding the collection with the parent entity and refreshing that
            // particular item as opposed a standalone collection which will contain entities
            // that are completely separate from the view. For Example:
            /*
            if (!this.standalone) {
                // create collection inside parent (i.e. streams->viewVersions associations)
            } else {
            */
            this.collection = new Stratus.Collections.Generic({
                entity: _.ucfirst(this.options.source),
                target: this.modelTarget(),
                initialize: true,
                api: { property: this.propertyName }
            });
            Stratus.Instances[this.collection.globals.get('uid')] = this.collection;
            if (typeof this.propertyName === 'string') {
                this.model.on('change:' + this.propertyName, function () {
                    this.model.once('success', function () {
                        this.model.once('change', function () {
                            this.collection.target = this.modelTarget();
                            this.collection.refresh({ reset: true });
                        }, this);
                    }, this);
                }, this);
            }
            /* } */
            this.handleCollection();
        },

        // handleCollection
        handleCollection: function () {

            // Ensure this function only runs once
            if (this.handled) return false;
            this.handled = true;

            // XHR Events
            this.collection.on('reset', this.primeReset, this);
            this.collection.on('success', this.primeSuccess, this);
            this.collection.on('error', this.primeError, this);

            // Model Events
            this.collection.on('add', this.primeAdd, this);
            this.collection.on('change', this.primeChange, this);
            this.collection.on('destroy', this.primeDestroy, this);
        },

        // TODO: End Move

        // Clears all Globals before building a new set
        /**
         * @param model
         */
        clearGlobals: function (model) {
            _.each(this.collection.globals.get('levels'), function (level, iteration, levelList) {
                this.collection.globals.set('level' + level, 0);
                this.collection.globals.set('total' + level, 0);
            }, this);

            _.each(this.collection.globals.get('parents'), function (level, iteration, levelList) {
                this.collection.globals.set('parent' + level, 0);
                this.collection.globals.set('parentTotal' + level, 0);
            }, this);
        },

        // If a global is added in Build Globals, it also needs to be in Clear Globals
        /**
         * @param model
         */
        buildGlobals: function (model) {
            var currentLevel = (model.has('level')) ? model.get('level') : 1;
            this.collection.globals.iterate('total' + currentLevel);

            if (model.has('parent') && Stratus.Relations.Sanitize(model, 'parent', 'id') !== null) {
                this.collection.globals.iterate('parentTotal' + Stratus.Relations.Sanitize(model, 'parent', 'id'));
            }

            // TODO: Transverse through all children in nest and add level to array, then display this data for each parent

            /**
             * TODO: Possibly make this iterate how many children are in a parent, in the odd case that we don't have a
             * reverse relation, which doesn't make sense considering we're the ones handling the data in the API, but
             * it might be a nice fallback
             */
            /*
            if (model1.has(association) && model1.get(association).get(prop) !== null) {
                var currentParent = (model.has('parent')) ? model.get('level') : 1;
                model1.get(association).get(prop);
                this.collection.globals.iterate('total' + currentLevel);
            }
            */
        },

        drag: function () {
            // TODO: Handle Drag Event
        },

        /**
         * @param scope
         * @param response
         * @param options
         * @returns {boolean}
         */
        onError: function (scope, response, options) {
            if (_.has(response, 'status') && response.status !== 200) {
                this.$el.html(this.errorTemplate({ collection: this.collection, options: this.options, code: response.status.toString() }));
            }
            return true;
        },

        // addOne
        // TODO: Clear and Rerender Globals
        // TODO: {% if (!icon) { icon = {class: globals.entity.toLowerCase()}; } %} and data-icon="true"
        /**
         * @param model
         */
        addOne: function (model) {

            // Detect Child
            var isChild = (model.has('parent') && Stratus.Relations.Sanitize(model, 'parent', 'id') !== null);
            var phantoms = 0;

            // Create Globals
            var globals = {
                parent: (isChild) ? Stratus.Relations.Sanitize(model, 'parent', 'id') : 0,
                child: isChild,

                level: (model.has('level')) ? model.get('level') : 1,
                iteration: 0,
                total: 0,
                phantom: false,
                last: false,

                entity: this.collection.globals.get('entity'),
                meta: this.options.meta,
                hook: this.el,

                uid: this.collection.globals.get('uid'),

                weight: 0,
                gravity: 0,
                compound: 0
            };

            // TODO: If batch exists, then we need to create a fake "parent" in which (iteration % batch === 1)

            // Iterate for Level
            globals.iteration = this.collection.globals.iterate('level' + globals.level);
            globals.total = this.collection.globals.get('total' + globals.level);
            globals.last = (globals.iteration === globals.total);

            // Handle Dynamic Hook
            if (_.has(this.templates, 'combined') || _.has(this.templates, 'list')) {
                var containers = this.$el.find('[data-hook="containers"]');
                if (containers.length > 0) globals.hook = containers;
            }

            // Handle Batches
            if (this.options.batch) {
                // Determine Placement
                var tile = globals.iteration % this.options.batch;

                // Determine Order
                if (tile === 1) {
                    /* First Tile */
                    globals.iteration = 1;
                    this.collection.globals.set('batchParent', model.get('id'));
                    this.collection.globals.set('parent' + model.get('id'), 1);
                } else {
                    /* Middle & Last Tiles */
                    globals.parent = this.collection.globals.get('batchParent');
                    globals.child = true;
                }

                // Mark Last of Batch
                if (tile === 0) {
                    /* Last Tiles */
                    globals.last = true;
                }

                // Count Phantoms
                if (tile !== 0 && globals.last) {
                    phantoms = this.options.batch - tile;
                    globals.last = false;
                }
            }

            // Register Parents and Levels
            this.collection.globals.add('levels', globals.level);
            this.collection.globals.add('parents', globals.parent);

            // Handle Children
            if (globals.child) {
                globals.iteration = this.collection.globals.iterate('parent' + globals.parent);
                globals.total = this.collection.globals.get('parentTotal' + globals.parent);
                globals.last = (globals.iteration === globals.total);

                var parent = '[data-collection="' + globals.uid + '"][data-entity="' + globals.entity + '"][data-hook="parent' + globals.parent + '"]';
                if ($(parent).length > 0) globals.hook = parent;
            }

            // Calculate Weight
            globals.weight = 1 / globals.total;
            globals.gravity = globals.weight * globals.iteration;
            globals.compound = (1 / (globals.total - 1)) * (globals.iteration - 1);

            // Inject Container into DOM
            $(globals.hook).append(this.template({
                scope: 'container',
                globals: globals,
                meta: this.collection.meta.toObject(),
                model: model.attributes
            }));

            // Iterate Model Number and create GUID for this View
            this.collection.globals.iterate('modelNumber');
            var uid = (model.has('id')) ? model.get('id') : this.collection.globals.get('modelNumber');
            var guid = _.uniqueId(this.entity + '_generic');

            // Create Generic View and store in Collection View
            if (_.has(this.views, uid) && false) {
                this.views[uid].globals = globals;
            } else {
                var view = new Stratus.Internals.View(_.extend({}, this.view.nest(), {
                    uid: globals.uid,
                    id: model.get('id'),
                    scope: 'model',
                    model: model,
                    collection: this.collection
                }));
                var options = _.extend({}, view.toObject(), {
                    collectionView: this,
                    globals: globals,
                    templates: this.templates,
                    type: 'generic',
                    rerender: {
                        change: this.options.change
                    },
                    view: view
                });
                Stratus.Instances[guid] = this.views[uid] = new Stratus.Views.Widgets.Generic(options);
            }

            // Sortable Children
            if (globals.child && globals.last) {
                Sortable.create(_.first($(globals.hook)), {
                    draggable: '.draggable',
                    group: this.entity
                });
            }

            // Build Phantoms
            if (phantoms && _.has(this.templates, 'entity')) {
                var phantom = _.clone(globals);
                phantom.iteration = this.options.batch - phantom.iteration;
                phantom.model = null;
                phantom.phantom = true;
                phantom.parent = this.collection.globals.get('batchParent');
                phantom.child = true;
                phantom.hook = '[data-collection="' + globals.uid + '"][data-entity="' + phantom.entity + '"][data-hook="parent' + phantom.parent + '"]';
                var phantomTemplate = this.templates.combined ||  this.templates.entity;
                for (var i = 0; i < phantoms; i++) {
                    phantom.iteration++;
                    if (i === (phantoms - 1)) {
                        phantom.last = true;
                    }
                    $(phantom.hook).append(phantomTemplate({ scope: 'entity', globals: phantom }));
                }
            }

            // TODO: make this attached to parent iteration, which takes precedence if it exists in the model
            if (this.collection.globals.get('lastLevel') > globals.level) {
                this.collection.globals.set('level' + this.collection.globals.get('lastLevel'), 0);
            }
            this.collection.globals.set('lastLevel', globals.level);
        },

        // addAll
        addAll: function () {
            var list = {
                scope: 'list',
                collection: this.collection,
                options: this.options
            };
            this.$el.html(_.has(this.templates, 'combined') ? this.templates.combined(list) : (_.has(this.templates, 'list') ? this.templates.list(list) : ''));
            if ((!this.$el.html() || !this.$el.html().trim().length) && !this.collection.size()) {
                this.$el.html(this.errorTemplate({ collection: this.collection, options: this.options }));
            }
            if (this.$el.html() && this.$el.html().trim().length) {
                Stratus.Internals.Loader(this.el, this.view).done(function (entries) {
                    //if (!Stratus.Environment.get('production')) console.info('List Entries:', entries);
                }, function (error) {
                    console.error('List Views:', error);
                });
            }
            if (this.options.autosort) {
                this.collection.sort();
            }
            this.clearGlobals();
            this.collection.models.forEach(this.buildGlobals, this);
            this.collection.models.forEach(this.addOne, this);
            if (this.options.masonry) {
                new Masonry(this.el, {
                    itemSelector: '.grid-item',
                    columnWidth: 160,
                    percentPosition: true
                });
            }
            if (this.options.sortable) {
                Sortable.create(this.el, { group: this.entity });
            }
            this.trigger('render', this);
        },

        /**
         * @param e
         */
        dragStart: function (e) {
            console.log('Start:', e.originalEvent);
        },

        /**
         * @param e
         */
        dragEnd: function (e) {
            // find qualifying hook
            var $el = $(e.originalEvent.item);
            $el = (el.data('id')) ? el : el.find('[data-id]');

            // store information
            var proto = {
                el: $el,
                id: $el.data('id'),
                entity: $el.data('entity'),
                priority: _.size(this.collection.models) - e.originalEvent.newIndex,
                reference: Stratus.Models.Generic
            };

            // save priority calculation
            if (proto.entity && proto.id) {
                proto.reference = Stratus.Models.get(proto.entity).findOrCreate(proto.id);
                /*
                this.collection.each(function (model) {
                    var newPriority = model.get('priority');
                    if (newPriority <= proto.priority) --newPriority;
                    model.set('priority', newPriority);
                });
                */
                proto.reference.save('priority', proto.priority);
                this.collection.refresh();
            }

            console.log('End:', e.originalEvent.newIndex, proto);
        }
    });

}));
