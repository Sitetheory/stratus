// Internal View Loader
// ----------------------

// This will hydrate every entity data attribute into a model or
// collection either by reference or instantiation and attach said
// 'scope' to a view instance.
/**
 * Events:
 *
 * Editable
 * Manipulate
 * Container Overlay (View)
 * Container Inlay (View)
 *
 * @param selector
 * @param view
 * @param requirements
 * @returns {Promise}
 * @constructor
 */
Stratus.Internals.Loader = function (selector, view, requirements) {
    if (typeof selector === 'undefined') {
        var body = Stratus('body');
        selector = !body.attr('data-loaded') ? '[data-entity],[data-plugin]' : null;
        if (selector) {
            body.attr('data-loaded', true);
        } else {
            console.warn('Attempting to load Stratus root repeatedly!');
        }
    }
    /*
         if (typeof selector === 'string') selector = $(selector);
         if (view && selector) selector.find('[data-type],[data-plugin]');
         */
    /* We check view, selector, and type in this order to save a small amount of power */
    if (selector) {
        selector = (view && selector && typeof selector === 'object') ? Stratus(selector).find('[data-type],[data-plugin]') : Stratus(selector);
    }
    return new Promise(function (resolve, reject) {
        var entries = {
            total: (selector && typeof selector === 'object') ? selector.length : 0,
            iteration: 0,
            views: {}
        };
        if (entries.total > 0) {
            selector.each(function (el, index, list) {
                entries.iteration++;
                var entry = _.uniqueId('entry_');
                entries.views[entry] = false;
                Stratus.Internals.ViewLoader(el, view, requirements).then(function (view) {
                    entries.views[entry] = view;
                    if (entries.total === entries.iteration && _.allTrue(entries.views)) {
                        resolve(entries);
                    }
                }, reject);
            });
        } else {
            resolve(entries);
        }
    });
};

// Internal View Model
// ---------------------

// This non-relational model is instantiated every time a Stratus Loader
// finds a Stratus DOM element.
/**
 * @type {void|*}
 */
Stratus.Internals.View = _.inherit(Stratus.Prototypes.Model, {
    toObject: function () {
        var sanitized = _.clone(this.data);
        if (sanitized.el && sanitized.el.selection) {
            sanitized.el = sanitized.el.selection;
            /* TODO: This may not be necessary */
            if (typeof $ === 'function' && $.fn) {
                sanitized.$el = $(sanitized.el);
            }
            /* */
        }
        return sanitized;
    },

    // TODO: This function's documentation needs to be moved to the Sitetheory-Docs repo
    hydrate: function () {
        var nel = this.get('el');
        this.set({
            // Unique IDs
            // -----------

            // This is set as the widgets are gathered
            uid: _.uniqueId('view_'),

            // This is set as a widget is created to ensure duplicates don't exist
            guid: (typeof nel.attr('data-guid') !== 'undefined') ? nel.attr('data-guid') : null,

            // Model or Collection
            // -----------

            // Entity Type (i.e. 'View' which would correlate to a Restful /Api/View Request)
            entity: (typeof nel.attr('data-entity') !== 'undefined') ? _.ucfirst(nel.attr('data-entity')) : null,

            // Entity ID (Determines Model or Collection)
            id: (typeof nel.attr('data-id') !== 'undefined') ? nel.attr('data-id') : null,

            // Determines whether or not we should create an Entity Stub to render the dependent widgets
            manifest: (typeof nel.attr('data-manifest') !== 'undefined') ? nel.attr('data-manifest') : null,

            // API Options are added to the Request URL
            api: (typeof nel.attr('data-api') !== 'undefined') ? nel.attr('data-api') : null,

            // Determine whether this widget will fetch
            fetch: (typeof nel.attr('data-fetch') !== 'undefined') ? nel.attr('data-fetch') : true,

            // Specify Target
            target: (typeof nel.attr('data-target') !== 'undefined') ? nel.attr('data-target') : null,

            // This is determines what a new Entity's settings would be on creation
            prototype: (typeof nel.attr('data-prototype') !== 'undefined') ? nel.attr('data-prototype') : null,

            // Stuff
            autoSave: (typeof nel.attr('data-autoSave') !== 'undefined') ? nel.attr('data-autoSave') : null,

            // View
            // -----------

            type: (typeof nel.attr('data-type') !== 'undefined') ? nel.attr('data-type') : null,
            types: (typeof nel.attr('data-types') !== 'undefined') ? nel.attr('data-types') : null,
            template: (typeof nel.attr('data-template') !== 'undefined') ? nel.attr('data-template') : null,
            templates: (typeof nel.attr('data-templates') !== 'undefined') ? nel.attr('data-templates') : null,
            dialogue: (typeof nel.attr('data-dialogue') !== 'undefined') ? nel.attr('data-dialogue') : null,
            pagination: (typeof nel.attr('data-pagination') !== 'undefined') ? nel.attr('data-pagination') : null,
            property: (typeof nel.attr('data-property') !== 'undefined') ? nel.attr('data-property') : null,
            field: (typeof nel.attr('data-field') !== 'undefined') ? nel.attr('data-field') : null,
            load: (typeof nel.attr('data-load') !== 'undefined') ? nel.attr('data-load') : null,
            options: (typeof nel.attr('data-options') !== 'undefined') ? nel.attr('data-options') : null,

            // Versioning
            // -----------

            versionEntity: (typeof nel.attr('data-versionentity') !== 'undefined') ? nel.attr('data-versionentity') : null,
            versionRouter: (typeof nel.attr('data-versionrouter') !== 'undefined') ? nel.attr('data-versionrouter') : null,
            versionId: (typeof nel.attr('data-versionid') !== 'undefined') ? nel.attr('data-versionid') : null,

            // Plugins
            // -----------

            plugin: (typeof nel.attr('data-plugin') !== 'undefined') ? nel.attr('data-plugin') : null,
            plugins: []
        });

        if (this.get('plugin') !== null) {
            var plugins = this.get('plugin').split(' ');
            if (this.get('type') !== null) {
                this.set('plugins', (plugins.length > 1) ? plugins : [this.get('plugin')]);
            } else if (plugins.length > 1) {
                this.set('plugin', _.first(plugins));

                // Add additional plugins
                this.set('plugins', _.rest(plugins));
            }
        }
        var id = this.get('id');
        var type = (this.get('type') !== null) ? this.get('type') : this.get('plugin');
        var loaderType = (this.get('type') !== null) ? 'widgets' : 'plugins';
        this.set({
            scope: (id !== null) ? 'model' : 'collection',
            alias: (type !== null) ? 'stratus.views.' + loaderType + '.' + type.toLowerCase() : null,
            path: (type !== null) ? type : null
        });
        if (!id && this.get('entity') !== null && this.get('manifest') !== null) {
            this.set('scope', 'model');
        }
    },
    clean: function () {
        if (!this.get('entity') || this.get('entity').toLowerCase() === 'none') {
            this.set({ entity: null, scope: null });
        }
    },

    // Give Nested Attributes for Child Views
    /**
     * @returns {{entity: *, id: *, versionEntity: *, versionRouter: *, versionId: *, scope: *, manifest: *}}
     */
    nest: function () {
        var nest = {
            entity: this.get('entity'),
            id: this.get('id'),
            versionEntity: this.get('versionEntity'),
            versionRouter: this.get('versionRouter'),
            versionId: this.get('versionId'),
            scope: this.get('scope'),
            manifest: this.get('manifest')
        };

        // Add Model or Collection to Nest
        if (this.has(nest.scope)) {
            nest[nest.scope] = this.get(nest.scope);
        }
        return nest;
    },
    /**
     * @returns {{id: *}}
     */
    modelAttributes: function () {
        return {
            id: this.get('id')
        };
    }
});


// This function creates and hydrates a view from the DOM,
// then either references or creates a Model or Collection
// instance (if present), then, upon View instantiation, calls
// the Internal Loader on that element to build the nested
// view tree.
/**
 * @param el
 * @param view
 * @param requirements
 * @returns {Promise}
 * @constructor
 */
Stratus.Internals.ViewLoader = function (el, view, requirements) {
    var parentView = (view) ? view : null;
    var parentChild = false;

    var element = Stratus(el);
    view = new Stratus.Internals.View();
    view.set('el', element);
    view.hydrate();
    if (parentView) {
        if (!view.has('entity')) {
            view.set(parentView.nest());
        } else {
            parentChild = true;
        }
    }
    view.clean();

    if (!parentChild) {

        // TODO: Add Previous Requirements Here!
        if (typeof requirements === 'undefined') requirements = ['stratus'];
        var template = view.get('template');
        var templates = view.get('templates');
        var dialogue = view.get('dialogue');
        var templateMap = [];

        // Add Scope
        if (view.get('scope') !== null) {
            requirements.push('stratus.' + view.get('scope') + 's.generic');
        }

        // Handle Alias or External Link
        if (view.get('alias') && _.has(requirejs.s.contexts._.config.paths, view.get('alias'))) {
            requirements.push(view.get('alias'));
        } else if (view.get('path')) {
            requirements.push(view.get('path'));
            var srcRegex = /(?=[^\/]*$)([a-zA-Z]+)/i;
            var srcMatch = srcRegex.exec(view.get('path'));
            view.set('type', _.ucfirst(srcMatch[1]));
        } else {
            view.set({
                type: null,
                alias: null,
                path: null
            });
        }

        // Aggregate Template
        if (template !== null) {
            templates = _.extend((templates !== null) ? templates : {}, { combined: template });
        }

        // Aggregate Dialogue
        if (dialogue !== null) {
            templates = _.extend((templates !== null) ? templates : {}, { dialogue: dialogue });
        }

        // Gather All Templates
        if (templates !== null) {
            for (var key in templates) {
                if (!templates.hasOwnProperty(key) || typeof templates[key] === 'function') continue;
                if (templates[key].indexOf('#') === 0) {
                    var $domTemplate = $(templates[key]);
                    if ($domTemplate.length > 0) {
                        templates[key] = $domTemplate.html();
                    }
                } else if (templates[key] in requirejs.s.contexts._.config.paths) {
                    requirements.push('text!' + templates[key]);
                    templateMap.push(key);
                } else {
                    requirements.push('text!' + templates[key]);
                    templateMap.push(key);
                }
            }
            view.set('templates', templates);
            templates = view.get('templates');
        }
    }

    return new Promise(function (resolve, reject) {
        if (view.get('guid')) {
            if (!Stratus.Environment.get('production')) console.warn('View hydration halted on', view.get('guid'), 'due to repeat calls on the same element.', view.toObject());
            resolve(true);
            return true;
        }
        if (parentChild) {
            /* if (!Stratus.Environment.get('production')) console.warn('Parent Child Detected:', view.toObject()); */
            resolve(true);
            return true;
        }
        require(requirements, function (Stratus) {
            if (!Stratus.Environment.get('production') && Stratus.Environment.get('nestDebug')) console.group('Stratus View');
            var hydrationKey = 0;
            if (templates && templateMap.length > 0) {
                for (var i = 0; i < arguments.length; i++) {
                    if (typeof arguments[i] === 'string') {
                        if (arguments[i].indexOf('<html') === -1) {
                            templates[templateMap[hydrationKey]] = arguments[i];
                        } else {
                            console.error('Template', templates[templateMap[hydrationKey]], 'failed to load.');
                        }
                        hydrationKey++;
                    }
                }
            }

            /* Refresh Template HTML on View */
            view.set('templates', templates);
            templates = view.get('templates');

            var subRequirements = [];

            /* Handle Custom Templates */
            if (_.size(templates) > 0) {
                var re = /<.+?data-type=["|'](.+?)["|'].*>/gi;

                /* Hydrate Underscore Templates */
                _.each(templates, function (value, key) {
                    if (typeof value === 'string') {
                        if (value.search(re) !== -1) {
                            var match = re.exec(value);
                            while (match !== null) {
                                var subRequirement = 'stratus.views.' + (view.get('plugin') ? 'plugins' : 'widgets') + '.' + match[1].toLowerCase();
                                if (subRequirement && !_.has(requirejs.s.contexts._.config.paths, subRequirement)) {
                                    if (!Stratus.Environment.get('production')) console.warn('Sub Type:', subRequirement, 'not configured in require.js');
                                }
                                subRequirements.push(subRequirement);
                                match = re.exec(value);
                            }
                        }
                        templates[key] = _.template(value);
                    }
                });

                /* Refresh Template Functions on View */
                view.set('templates', templates);
                templates = view.get('templates');
            }

            // Gather subRequirements
            if (view.get('plugins').length) {
                _.each(view.get('plugins'), function (plugin) {
                    subRequirements.push('stratus.views.plugins.' + plugin.toLowerCase());
                });
            }

            // Detect Loader Types
            var loaderTypes = [];
            if (view.get('plugin') !== null) loaderTypes.push('PluginLoader');
            if (view.get('type') !== null) loaderTypes.push('WidgetLoader');

            // Set Default Path
            if (!loaderTypes.length) loaderTypes.push('WidgetLoader');

            // Start Loader for each type detected
            _.each(loaderTypes, function (loaderType) {
                /* If subRequirements are detected in Custom Template, load their types before the View is instantiated. */
                if (_.size(subRequirements) === 0) {
                    Stratus.Internals[loaderType](resolve, reject, view, requirements);
                } else {
                    requirements = _.union(requirements, subRequirements);
                    new Promise(function (resolve, reject) {
                        require(requirements, function (Stratus) {
                            Stratus.Internals[loaderType](resolve, reject, view, requirements);
                        });
                    }).then(resolve, reject);
                }
            });
        });
    });
};

// Load Widgets
/**
 * @param resolve
 * @param reject
 * @param view
 * @param requirements
 * @constructor
 */
Stratus.Internals.WidgetLoader = function (resolve, reject, view, requirements) {
    /* TODO: In the a model scope, we are more likely to want a collection of the View to create the original reference, since it will be able to determine the model's relational data at runtime */
    if (view.get('scope') === 'model') {
        if (!Stratus.Models.has(view.get('entity'))) {
            /* TODO: Add Relations */
            Stratus.Models.set(view.get('entity'), Stratus.Models.Generic.extend({}));
        }

        var modelReference;
        var modelInstance;
        var modelInit = false;
        var ModelType = Stratus.Models.has(view.get('entity')) ? Stratus.Models.get(view.get('entity')) : null;

        if (!view.get('id') && view.get('manifest')) {
            modelInstance = view.get('entity') + 'Manifest';
            modelReference = Stratus.Instances[modelInstance];
            if (!modelReference) {
                Stratus.Instances[modelInstance] = new ModelType();
                modelReference = Stratus.Instances[modelInstance];
                modelInit = true;
            }
        } else {
            if (ModelType && _.has(ModelType, 'findOrCreate')) {
                modelReference = ModelType.findOrCreate(view.get('id'));
                if (!modelReference) {
                    modelReference = new ModelType(view.modelAttributes());
                    modelInit = true;
                }
            } else {
                modelInstance = view.get('entity') + view.get('id');
                modelReference = Stratus.Instances[modelInstance];
                if (!modelReference) {
                    Stratus.Instances[modelInstance] = new ModelType(view.modelAttributes());
                    modelReference = Stratus.Instances[modelInstance];
                    modelInit = true;
                }
            }
        }

        if (modelInit) {
            modelReference.safeInitialize(view.toObject());
        }
        view.set({ model: modelReference });
    } else if (view.get('scope') === 'collection') {
        // Create reference, if not defined
        if (!Stratus.Collections.has(view.get('entity'))) {
            Stratus.Collections.set(view.get('entity'), new Stratus.Collections.Generic(view.toObject()));

            // TODO: Inject prototype into Dynamic, Event-Controlled Namespace
            /*
                 Stratus.Collections.set(view.get('entity'), Stratus.Collections.Generic);
                 */
        }

        var collectionReference = Stratus.Collections.get(view.get('entity'));

        // Run initialization when the correct settings are present
        if (!collectionReference.initialized && view.get('fetch')) {
            collectionReference.safeInitialize(view.toObject());
        }

        // Set collection reference
        view.set({ collection: collectionReference });
    }

    if (view.get('type') !== null) {
        var type = _.ucfirst(view.get('type'));
        if (typeof Stratus.Views.Widgets[type] !== 'undefined') {
            // if (!Stratus.Environment.get('production')) console.info('View:', view.toObject());
            var options = view.toObject();
            options.view = view;
            Stratus.Instances[view.get('uid')] = new Stratus.Views.Widgets[type](options);
            Stratus.Instances[view.get('uid')].$el.attr('data-guid', view.get('uid'));
            if (_.has(Stratus.Instances[view.get('uid')], 'promise')) {
                Stratus.Instances[view.get('uid')].initializer.then(resolve, reject);
            } else {
                resolve(Stratus.Instances[view.get('uid')]);
            }
        } else {
            if (!Stratus.Environment.get('production')) console.warn('Stratus.Views.Widgets.' + type + ' is not correctly configured.');
            reject(new Stratus.Prototypes.Error({
                code: 'WidgetLoader',
                message: 'Stratus.Views.Widgets.' + type + ' is not correctly configured.'
            }, view.toObject()));
        }
        if (!Stratus.Environment.get('production') && Stratus.Environment.get('nestDebug')) console.groupEnd();
    } else {
        var nest = view.get('el').find('[data-type],[data-plugin]');
        if (nest.length > 0) {
            Stratus.Internals.Loader(view.get('el'), view, requirements).then(function (resolution) {
                if (!Stratus.Environment.get('production') && Stratus.Environment.get('nestDebug')) console.groupEnd();
                resolve(resolution);
            }, function (rejection) {
                if (!Stratus.Environment.get('production') && Stratus.Environment.get('nestDebug')) console.groupEnd();
                reject(new Stratus.Prototypes.Error(rejection, nest));
            });
        } else {
            if (!Stratus.Environment.get('production') && Stratus.Environment.get('nestDebug')) {
                console.warn('No Innate or Nested Type Found:', view.toObject());
                resolve(view.toObject());
                console.groupEnd();
            } else {
                resolve(view.toObject());
            }
        }
    }
};

// Load Plugins Like we Load Views
/**
 * @param resolve
 * @param reject
 * @param view
 * @param requirements
 * @constructor
 */
Stratus.Internals.PluginLoader = function (resolve, reject, view, requirements) {
    var types = _.union([view.get('plugin')], view.get('plugins'));
    _.each(types, function (type) {
        type = _.ucfirst(type);
        if (typeof Stratus.Views.Plugins[type] !== 'undefined') {
            var options = view.toObject();
            options.view = view;
            Stratus.Instances[view.get('uid')] = new Stratus.Views.Plugins[type](options);
            Stratus.Instances[view.get('uid')].$el.attr('data-guid', view.get('uid'));
            if (_.has(Stratus.Instances[view.get('uid')], 'promise')) {
                Stratus.Instances[view.get('uid')].initializer.then(resolve, reject);
            } else {
                resolve(Stratus.Instances[view.get('uid')]);
            }
        } else {
            if (!Stratus.Environment.get('production')) console.warn('Stratus.Views.Plugins.' + type + ' is not correctly configured.');
            reject(new Stratus.Prototypes.Error({
                code: 'PluginLoader',
                message: 'Stratus.Views.Plugins.' + type + ' is not correctly configured.'
            }, view.toObject()));
        }
    });
};