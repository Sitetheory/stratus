//     Stratus.Views.Widgets.Base.js 1.0

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

// Additional Standard Data Attribute Options
// -------------------------------------------
/*

 data-property: The property on the model that is being edited or displayed.

 data-label: Optional text to add a label near the widget.

 data-help: Optional text to add a help button popover near the widget.

 data-render: Set whether the widget should load automatically or on an event, e.g. false|auto|click|hover etc (default to auto). Note, if you do not want to render a template (because you are putting your own content inside, then set data-render="false"

 data-status="load" : It is often a good idea to set the status as load, so that CSS can show styles indicating the model for the widget is loading still (the status will be changed to 'success' after it's loaded).

 data-style: Set to "form" if you want to add the classes that make the widget look like a form. This is set to 'form' by default if the widget has a custom getValue() method that returns anything other than the default 'undefined', which basically means that the widget is intended to be an input that we fetch data from, i.e. a form.

 data-feedback: Set to "true" to make the widget display standard Bootstrap style feedback elements on success, error, request, change, etc. This is set to true by default if data-style is set to "form".

 data-templates: A JSON string to specify an alternative template to render, e.g. {"render":"#myTemplate"}

 data-options: A JSON string of options to overwrite the javascript options, e.g. {"autoSave": true, "autoSaveInterval": 5000}'

 data-id: if you need to set a specific ID for the element that gets rendered inside your widget (for CSS purposes) you can set it here. Otherwise a default id will be assigned starting with "Widget-"

 */

// Widget
// ======

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'jquery', 'underscore', 'backbone', 'tether', 'moment', 'promise', 'stratus.models.generic', 'stratus.collections.generic'], factory);
    } else {
        factory(root.Stratus, root.$, root._, root.Backbone, root.Tether, root.moment);
    }
}(this, function (Stratus, $, _, Backbone, Tether, moment) {

    // Base Model View
    // -------------
    // This Backbone View intends to handle Generic rendering for a single Model.

    Stratus.Views.Widgets.Base = Backbone.View.extend({

        // Typical References
        model: Stratus.Models.Generic,
        collection: Stratus.Collections.Generic,

        // Event Dispatch
        dispatch: Stratus.Prototypes.Dispatch,

        // Unique Id
        uid: 'unset',

        // Set the default templateContainer used for managing labels, help buttons, and feedback elements
        templateContainer: _.template('{% if(options.label) { %}<label class="control-label" for="{{ elementId }}">{{ options.label }}</label>{% } %}{% if(options.help) { %}<span data-plugin="help" data-content="{{ options.help }}"></span>{% } %}{{ template }}{% if(options.feedback) { %}<span class="form-control-feedback" aria-hidden="true"></span>{% } %}'),

        // These Default Attributes are the base for any widget's attributes
        defaults: {
            // Internal Attributes (Not DOM Accessible)
            private: {
                // If a widget is some sort of an editable user input, then this should be set as true. But if a widget does
                // not interact with a model or interacts in a simple way (e.g. toggle, display) and shouldn't display as a
                // form, then set this to false
                editable: true,

                // Default to where the widget's data is stored. Options: 'model', 'var'
                // Var is used in toggle (sometimes) if you want to save a value to the Stratus.Environment object. But in most
                // cases the dataType is 'model'
                dataType: 'model',

                // Determine whether this view should register for auto saving
                autoSave: false,

                // Determine how often the model should auto-save. The lowest set autoSaveInterval will have priority.
                autoSaveInterval: '3s',

                // Default Action for unrendering
                unrenderEventDefault: 'blur',

                // specify false if you do not want Stratus.Internals.Loader to run
                // and load sub widgets after view is rendered
                autoLoader: true,

                // This will force a type of model or collection to be present for the particular widget
                forceType: null,

                // Add Required CSS Files, if necessary
                requiredCssFile: []
            },

            // Attributes Editable from Data-Attributes on the DOM
            public: {
                // Specify if what the empty value should be, e.g. '' or 'null'.
                // Strings that are nullable, however, should be set as `null` in the setValue, so that they don't trigger
                // a changeSet when they load the first time. If null is set, we will determine the emptyValue based on the
                // current typeof(value) which will result in strings being set as '' and objects and arrays set as null.
                // This default, will work in most situations.
                emptyValue: null,

                // This is the value that should show up when live edit makes widgets clickable
                placeholder: 'Click to Edit',

                // Add text before the input
                before: '',

                // Add text after the input
                after: '',

                // determine if the widget should be rendered as a 'form', e.g. have form-control added
                style: null,
                label: null,
                help: null,
                feedback: null,
                render: 'auto',

                // By default this will use the unrenderEventDefault for the widget (e.g. blur). But if you don't want to
                // unrender, then data-unrender="false" should be set on the DOM. If the widget has a complex internal way
                // of detecting blur (e.g. editor, datetimepicker), it must call blurAction() manually when detecting a blur,
                // which will call unrender(). In those cases, unrender needs to be set as true.
                unrender: null,
                format: null,
                interval: null,

                // specify an integer representing the minimum number of collections that need to be present in order for
                // widget to appear (e.g. this is used by delete)
                collectionMin: null,

                // Universal option to limit (used on contexts of lists, e.g. 'collection' widget)
                limit: null,

                // Determine Autosort
                autosort: false,
                cssFile: []
            }
        },

        // These options are for each widget to extend
        options: {
            // Internal Attributes (Not DOM Accessible)
            private: {},

            // Attributes Editable from Data-Attributes on the DOM
            public: {}
        },

        // Various Settings (will add more information later)
        isRendered: false,
        templateRender: 'render',
        elementId: null,

        // every widget should define whether it's focused or not (unique method of determining this for each element)
        isFocused: false,

        // Ensure events are only registered once
        registeredEvents: false,
        renderTrigger: false,
        liveEditTrigger: false,
        registered: false,
        registeredElement: false,

        // Store Element Selector TODO: Rename this to something more descriptive
        element: null,

        /**
         * @returns {boolean|*|jQuery|HTMLElement}
         */
        $element: function () {
            return (!this.element) ? null : $('#' + this.element);
        },

        // initialize()
        // ----------
        // Default initialize() function, which is the minimum that any other instances of this base view should use. All
        // When customizing the initialize() functions you will usually want to include this.prepare() and this.validate().
        /**
         * @param options
         * @returns {*}
         */
        initialize: function (options) {

            // Create Dispatch
            this.dispatch = new Stratus.Prototypes.Dispatch();

            // Register Main Events
            this.primeEvents();

            // Return Promise for Loader Validation
            this.initializer = new Promise(function (fulfill, reject) {
                this.fork(options, fulfill, reject);
            }.bind(this));

            // Return Boolean for Constructor
            return true;
        },

        /**
         * @returns {boolean}
         */
        primeEvents: function () {
            this.registeredEvents = this.registeredEvents || this.registerEvents();
            return true;
        },

        /**
         * @returns {boolean}
         */
        registerEvents: function () {
            // Listen for Rendering
            this.on('render', this.onRender, this);
            this.on('render', this.dispatchTrigger, this);

            // Handle Other Events
            this.on('unrender', this.onUnrender, this);
            this.on('postrender', this.onPostRender, this);
            this.on('register', this.primeRegister, this);

            // TODO: Only mark change, error and success on fields that were changed (i.e. don't add success marks to every field on the page)

            // Track the status of the API calls if there is a model or collection present
            // Model Status takes precedence over Collection
            var scope = (this.model && typeof this.model === 'object') ? 'model' : ((this.collection && typeof this.collection === 'object') ? 'collection' : null);
            if (scope) {
                // Set Loading Animation
                if (!this[scope].isHydrated()) this.setStatus('load');

                // Listen for Request
                this[scope].on('request', function () {
                    this.setStatus('request');
                }.bind(this));

                // Listen for Error
                this[scope].on('error', function () {
                    this.setStatus('error');
                }.bind(this));

                // Listen for Success
                this[scope].on('success', function () {
                    this.setStatus('success');
                }.bind(this));

                // Remove DOM Elements on Model Destruction
                if (scope === 'model') {
                    this.model.on('destroy', function () {
                        this.$el.html('');
                    }.bind(this));
                }
            }

            return true;
        },

        // Passively fork this method until a Collection or Model is Hydrated
        /**
         * @param options
         * @param fulfill
         * @param reject
         * @returns {boolean}
         */
        fork: function (options, fulfill, reject) {
            var success = true;
            if (this.collection && typeof this.collection === 'object' && !this.collection.isHydrated()) {
                this.collection.once('success', function () {
                    // FIXME: this.collection.once('reset', function () { this.fork(options, fulfill, reject); }, this);
                    this.fork(options, fulfill, reject);
                }, this);
            } else if (this.model && typeof this.model === 'object' && !this.model.isHydrated()) {
                this.model.once('success', function () {
                    this.model.once('change', function () {
                        this.fork(options, fulfill, reject);
                    }, this);
                }, this);
                this.model.once('error', function () {
                    reject(new Stratus.Prototypes.Error(this.model.entity + ' does not exist', this));
                }, this);
            } else {
                this.$el.removeClass('has-load');
                if (!this.prepare(options)) {
                    reject(new Stratus.Prototypes.Error('Preparation', this));
                    success = false;
                } else {
                    this.promise(options, fulfill, reject);
                }
            }
            return success;
        },

        // prepare()
        // -------
        // Standard methods to prepare this generic view.
        /**
         * @param options
         * @returns {boolean}
         */
        prepare: function (options) {

            this.uid = (_.has(options, 'uid')) ? options.uid : null;
            this.type = options.type.toLowerCase();
            this.view = options.view;
            this.api = options.api;
            this.target = options.target;

            this.propertyName = options.property;
            this.propertyValue = null;

            // This is the Id that should be set on the editable element
            this.element = this.$el.data('id') ? this.$el.data('id') : _.uniqueId('Widget-');

            // Allow Customization of Internals
            this.preOptions(options);

            // Clone and Merge Defaults with Options (Instantiate)
            this.options = {
                private: (this.options.private && _.size(this.options.private)) ? _.extend(_.cloneDeep(this.defaults.private), _.cloneDeep(this.options.private)) : _.cloneDeep(this.defaults.private),
                public: (this.options.public && _.size(this.options.public)) ? _.extend(_.cloneDeep(this.defaults.public), _.cloneDeep(this.options.public)) : _.cloneDeep(this.defaults.public)
            };

            // All the display options to be customized by data attribute options (merge with optionsCustom)
            this.getDataOptions(this.options.public);

            // Bring Nested Values to Surface
            this.options = _.extend(this.options.public, this.options.private);

            // Merge Initialize-Passed Options
            this.mergeOptions(options);

            // Merge CSS File Requirements
            this.mergeCssOptions(options);

            // Allow Options to be Changed on a Per-Widget Bases
            this.postOptions(options);

            // Handle Collection View Architecture Appropriately
            this.setCollectionView(options);

            if (!this.validate()) return false;

            // specify whether this is the model or the alternative var (e.g. for Stratus.Environment variables)
            this.options.dataType = (this.model && typeof this.model === 'object') ? 'model' : ((this.collection && typeof this.collection === 'object') ? 'collection' : 'var');

            // specify the best empty value ('' or null)
            if (typeof this.$el.dataAttr('emptyValue') === 'undefined') {
                this.options.emptyValue = (typeof this.getPropertyValue() === 'object') ? null : '';
            }

            // Ensure System Variables are Defined
            if (this.options.dataType === 'var' && typeof Stratus.Environment.get(this.propertyName) === 'undefined') {
                Stratus.Environment.set(this.propertyName, this.options.emptyValue);
            }

            // Manipulate any custom options
            this.getStandardData();
            this.selectTemplate(options);

            return true;
        },

        /**
         * @param options
         */
        mergeCssOptions: function (options) {
            // Clean Options
            this.options.cssFile = (this.options.cssFile === 'string') ? [this.options.cssFile] : (_.isArray(this.options.cssFile) ? this.options.cssFile : []);
            this.options.requiredCssFile = (this.options.requiredCssFile === 'string') ? [this.options.requiredCssFile] : (_.isArray(this.options.requiredCssFile) ? this.options.requiredCssFile : []);

            // Unite
            this.options.cssFile = _.union(this.options.cssFile, this.options.requiredCssFile);
        },

        /**
         * @param options
         */
        preOptions: function (options) {},

        // setStatus()
        // ---------------
        // Update the element's status to show how it's interacting with the model
        // Options: ['load','request','success','error','destroy']
        /**
         * @param status
         * @returns {boolean}
         */
        setStatus: function (status) {

            // Don't Change the status if it's identical
            //if (status === this.$el.attr('data-status')) return true;
            this.$el.attr('data-status', status);

            var statuses = {
                request: this.$el.hasClass('has-request'),
                error: this.$el.hasClass('has-error'),
                change: this.$el.hasClass('has-change')
            };

            // only add request if it's changed
            if (status === 'request' && !statuses.change) return false;

            // only add "error" if the "change" status was set already
            if (status === 'error' && !statuses.change) return false;

            // only add "success" if the "change" or "error" status was already
            if (status === 'success' && !statuses.change && !statuses.error && !statuses.request) return false;

            // remove all assisting 'has-' classes so they don't accumulate
            this.$el.removeClass(function (index, className) {
                return (className.match(/(^|\s)has-\S+/g) || []).join(' ').replace('has-feedback');
            });

            this.$el.addClass('has-' + status);

            return true;
        },

        // mergeOptions()
        // ------------
        // Merge options from the data-options attribute with the widget prototype options
        /**
         * @param options
         * @returns {boolean}
         */
        mergeOptions: function (options) {
            if (_.has(options, 'options') && options.options !== null) {
                // This has to loop through a nested array so that the defaults work
                _.each(this.options, function (el, index) {
                    if (typeof options.options[index] !== 'undefined') {
                        if (typeof el === 'object') {
                            this.options[index] = _.defaults(options.options[index], this.options[index]);
                        } else {
                            this.options[index] = options.options[index];
                        }
                    }
                }, this);

                // Store any API options that need to be passed
                if (_.has(options.options, 'api')) {
                    if (typeof this.model === 'object' && !this.model.meta.has('api')) {
                        this.model.meta.set('api', options.options.api);
                    } else if (typeof this.collection === 'object' && !this.collection.meta.has('api')) {
                        this.collection.meta.set('api', options.options.api);
                    }
                }
            }

            return true;
        },

        // postOptions()
        // ----------------
        // Custom Options for a widget in case you need to modify after regular merging.
        /**
         * @param options
         */
        postOptions: function (options) {},

        // getDataOptions
        // --------------
        // Get the specific options from the DOM element's data attributes. Usually you would not want to allow data
        // attributes to modify all the options, only specific options, e.g. this.options
        /**
         * @param options
         * @returns {*}
         */
        getDataOptions: function (options) {
            if (!options) return false;
            var data = {
                key: null,
                value: null
            };
            _.each(options, function (value, key) {
                data.key = key.toLowerCase();
                data.value = this.$el.dataAttr(data.key);
                if (data.value !== undefined) {
                    options[key] = data.value;
                }
            }, this);
            return options;
        },

        // setCollectionView()
        // Set Standard properties for Collection View
        /**
         * @param options
         * @returns {boolean}
         */
        setCollectionView: function (options) {
            if ('collectionView' in options) {
                this.collectionView = options.collectionView;
            } else {
                this.collectionView = {};
            }
            if ('globals' in options) {
                this.globals = options.globals;
                this.model.globals = options.globals;
            } else {
                this.globals = {};
            }
            return true;
        },

        // selectTemplate()
        // ---------------
        // Select the template to render, based on various options. The view can define a default template in
        // this.template, which is recommended if it's a simple template. But if it's complex, it's recommended to specify
        // an alternative template file that will be loaded via require.js. This is accomplished by adding the template
        // to the config.js and then requiring it in the definition of the view that extends this base. Then in this.template
        // you will fetch the text of that file.
        // Alternatively a designer may pass in an alternative template on a per use case, by including a script tag
        // with an id that matches the id of this DOM element on the page, e.g.
        // If you need to pass in multiple or alternative templates, you can pass in options for multiple templates, e.g.

        // <div id="foobar" data-type="myWidget"></div><script id="render_foobar">TEMPLATE CONTENT INSERTED HERE</script>.

        // data-templates='{"container":"sitetheorymenu/stratus/templates/menuPrimary.container.html","entity":"sitetheorymenu/stratus/templates/menuPrimary.entity.html"}'
        // data-templates='{"container":"#MenuLinkContainer","entity":"#MenuLinkEntity"}'

        // TODO: more details needed here...
        /**
         * @param options
         * @returns {boolean}
         */
        selectTemplate: function (options) {

            // setting data-render="false" will bypass any template rendering, e.g. if you want to keep the content you entered inside
            // an element manually.
            if (this.options.render === false) {
                this.template = null;
                return false;
            }

            // Capture the template for rendering. This is specified as the HTML
            // contents of a script "text/template" tag with an ID of "render_{id}"
            // where ID matches the element id. The contents can have javascript
            // variables and sudo twig like logic. Alternatively multiple templates
            // can be passed in the data-template as JSON string array, where the main
            // template is labelled 'render' key, e.g. {"render": "#myTemplate", "subContainer": "#mySubContainer"}.
            var renderTemplate = (options.templates && _.has(options.templates, this.templateRender)) ? options.templates[this.templateRender] : '#render_' + this.$el.attr('id');

            if (_.has(options.templates, 'combined')) {
                renderTemplate = options.templates.combined;
            }

            if (typeof renderTemplate === 'function') {
                this.template = renderTemplate;
            } else if (renderTemplate.indexOf('#') === 0) {
                var $renderTemplate = $(renderTemplate);
                if ($renderTemplate.length > 0) {
                    this.template = _.template($renderTemplate.html());
                }
            }

            return true;
        },

        // getStandardData()
        // ---------------
        // Get standard data from the element, which is used for creating defaults and identifying the editable element
        /**
         * @returns {boolean}
         */
        getStandardData: function () {

            // If the widget is set to load on some event, we don't want to require the designer to manually set the
            // data-unrender for ever widget. That should be default. If someone does NOT want to unrender, they can
            // set data-unrender="false" but if it's null (the default), we'll set it as the default.

            // Each widget can set a different unrenderEventDefault. If the render is 'auto' we do NOT want to set an unrender
            if (this.options.render !== 'auto' && this.options.unrender === null && this.options.unrender !== false) {
                this.options.unrender = this.options.unrenderEventDefault;
            }

            // If the widget is editable (i.e. a getValue() has been defined), set the style as a form and wrap with
            // form elements. We used to do this with data-style="form" but if we can do that automatically and avoid
            // needing to put that on every widget that would be better. If you need a getValue() but don't want the
            // style set as form then set the widget default this.options.style='widget' (or data-style="widget" on the DOM)

            if (this.options.editable) {
                if (this.options.style === null) this.options.style = 'form';
                if (this.options.autoSave && this.model && typeof this.model === 'object') {
                    this.model.autoSave(this.options.autoSave);
                }
            }
            this.options.feedback = (this.options.feedback || this.options.style === 'form') ? true : false;

            return true;
        },

        // validate()
        // --------
        // Create validation that returns true or false. False results will abort the setup of this view.
        /**
         * @returns {boolean}
         */
        validate: function () {
            return true;
        },

        // promise()
        // ----------
        // This needs to contain a fulfillment of the parent promise in every extension
        // or it will stop the finalize routines from ever executing, since they wait
        // for widget fulfillment before continuing.
        /**
         * @param options
         * @param fulfill
         * @param reject
         */
        promise: function (options, fulfill, reject) {
            if (this.options.forceType && (!_.has(this, this.options.forceType) || typeof this[this.options.forceType] !== 'object')) {
                reject(new Stratus.Prototypes.Error(_.ucfirst(this.options.forceType) + ' not present on widget.', this));
            } else if (_.size(this.options.cssFile)) {
                Stratus.Internals.LoadCss(this.options.cssFile).done(function () {
                    this.render();
                    fulfill(this);
                }.bind(this), function (rejection) {
                    reject(new Stratus.Prototypes.Error(rejection, this));
                }.bind(this));
            } else {
                this.render();
                fulfill(this);
            }
        },

        // render()
        // -------
        // If there is a template set, proceed to render the template immediately or on click (in cases where rendering
        // is not set to auto load, e.g. live editing loads on click. the data-render attribute should be empty or auto
        // to load automatically, otherwise the value will be the on event, e.g. click, hover, etc.
        /**
         * @returns {boolean}
         */
        render: function () {

            if (this.template === null || typeof this.template !== 'function') {
                // If it doesn't render, we still need to call the renderCallback because we may normally render a template
                // but some widget sets data-render="false" but it still needs the callback to execute the model change
                // event, e.g. link
                this.renderEvent();
                this.isRendered = true;
                return false;
            }

            if (this.options.render === 'auto') {
                this.renderTemplate();
            } else {
                // Register Custom Render Event Trigger
                this.primeRenderTrigger();

                // Listen for LiveEdit
                this.primeLiveEdit();

                // If set to render on click, set initial value on parent element
                this.unrender();
            }
            return true;
        },

        /**
         * @returns {boolean}
         */
        primeRenderTrigger: function () {
            this.renderTrigger = this.renderTrigger || this.registerRenderTrigger();
            return true;
        },

        /**
         * @returns {boolean}
         */
        registerRenderTrigger: function () {
            this.$el.on(this.options.render, function () {
                // Render if not already rendered and live edit is on
                if (!this.isRendered && Stratus.Environment.get('liveEdit')) {
                    this.renderTemplate();
                }
            }.bind(this));
            return true;
        },

        /**
         * @returns {boolean}
         */
        primeLiveEdit: function () {
            this.liveEditTrigger = this.liveEditTrigger || this.registerLiveEdit();
            return true;
        },

        /**
         * @returns {boolean}
         */
        registerLiveEdit: function () {
            // Create a Listener for when LiveEdit is toggled
            Stratus.Environment.on('change:liveEdit', function () {
                // Toggle the related LiveEdit* method depending on when it's
                Stratus.Environment.get('liveEdit') ? this.liveEditOn() : this.liveEditOff();
            }.bind(this));
            return true;
        },

        // renderTemplate()
        // ----------------

        // Render the element based on the template and set various helper attributes, like label and help.
        // A method for renderCallback() is called when the rendering is completed (in case you need to do additional
        // logic).
        /**
         * @returns {boolean}
         */
        renderTemplate: function () {

            var editElement;

            var templateData = {
                // Generic Data
                el: this.$el,
                elementId: this.element,
                property: this.propertyName,
                options: this.options,
                scope: 'entity',

                // Libraries
                moment: moment,
                tether: Tether,

                // List Items
                globals: (_.has(this, 'globals')) ? this.globals : {},
                icon: (_.has(this, 'icon')) ? this.icon : {}
            };

            // Add Model Information
            if (this.model && typeof this.model === 'object') {
                templateData.model = this.model.attributes;
                templateData.meta = this.model.meta.toObject();
            }

            // Add Collection Information with Meta Precedence
            if (this.collection && typeof this.collection === 'object') {
                templateData.collection = this.collection.models;
                templateData.meta = this.collection.meta.toObject();
            }

            // Add the Editable Element Inside a Container
            editElement = this.template(templateData);

            // If this is not auto render, then it's being rendered based on an event. In that case, we do not want to
            // show the feedback option twice, so we should remove the status until an event happens again
            if (this.options.render !== 'auto') {
                // set to 'render' which is just a generic value (don't want to show a success message)
                this.setStatus('render');
            }

            // Insert the edit element into the container
            this.$el.html(this.renderContainer(editElement));

            // Assign Element Selector as a local property
            var selectedElement = Stratus.Views.Widgets.Base.prototype.$element.call(this);

            if (typeof this.$element === 'function' || !_.isEqual(this.$element, selectedElement)) {
                this.$element = selectedElement;
                this.registeredElement = false;
            }

            if (this.options.style === 'form') {
                this.$el.addClass('form-group has-feedback');
                this.$element.addClass('form-control');
            } else {
                this.$el.addClass('widgetContainer');
            }

            // Capture Element
            this.primeElement();

            // TODO: ADD DISPATCH HERE!

            // Load Nested Types & Plugins
            if (this.options.autoLoader) {
                this.autoload();
            }

            // Register Unrender After the Element is Rendered
            // After Template is Rendered and We Have the Element (so we know where to apply the event)
            // When rendering happens on an event, the element will unrender unless unrender attribute is set to false
            // (the event that triggers a widget to unrender will vary based on the element, e.g. sometimes blur is enough, other times it's now.
            // We will set a default unrender event that is appropriate for each type (so the design doesn't need to know) so
            // they only have to type data-unrender="true"

            // If it equals true, it's not actually an event, so we'll unrender based on the blurAction() method
            if (this.options.unrender && this.options.unrender !== true) {
                // Some widgets can't detect a blur event, instead they record isFocused (e.g. editor, datetimepicker, etc).
                // So in those cases the widget needs to trigger the blurAction by it's own methods. which will call unrender.
                this.$element.on(this.options.unrender, function (event) {
                    this.unrender();
                }.bind(this));
            }

            // Any customized post render methods
            if (!this.options.autoLoader) {
                this.renderEvent();
            }

            return true;
        },

        // Prime Auto-Saving Routines
        /**
         * @returns {boolean}
         */
        primeElement: function () {
            this.registeredElement = this.registeredElement || this.registerElement();
            return true;
        },

        // Capture Auto-Saving Routines
        /**
         * @returns {boolean}
         */
        registerElement: function () {
            if (!this.$element || !this.$element.length) return false;
            this.$element.on('focus', function (event) {
                this.focusAction(event);
            }.bind(this));
            this.$element.on('blur', function (event) {
                this.blurAction(event);
            }.bind(this));
            this.$element.on('keydown', function (event) {
                this.keyActions(event);
            }.bind(this));
            this.$element.on('click', function (event) {
                this.editAction(event);
            }.bind(this));
            return true;
        },

        // autoload()
        // -----------------

        // Auto-loads all nest and parent widgets within the current rendered template and initializes
        // the loaderCallback which aggregates data and kicks off a render event & dispatch
        autoload: function () {
            Stratus.Internals.Loader(this.el || this.$el, this.view).done(function (nest) {
                /* Second Loader for Parent-Children */
                Stratus.Internals.Loader(this.$el.find('[data-entity]')).done(function (parent) {
                    this.loaderCallback(nest, parent);
                }.bind(this));
            }.bind(this));
        },

        // renderContainer()
        // -----------------
        // Render the container template that wraps the main editable element template defined by the view. This passes
        // specific values in the options that are needed in the default templateContainer template, e.g. the style, label, help, etc
        /**
         * @param template
         * @returns {*}
         */
        renderContainer: function (template) {
            return this.templateContainer({
                template: template,
                elementId: this.element,
                options: this.options
            });
        },

        // liveEditOn()
        // ------------
        // Default callback when the liveEdit is toggled on. For example, if a field on the page is empty, when the
        // liveEdit is toggled on, we want to populate it with default content so that the user can see there is a field
        // there to edit
        /**
         * @returns {boolean}
         */
        liveEditOn: function () {
            // If the widget is not editable, i.e. a getValue is not defined (e.g. display widgets), then don't do anything
            if (this.getValue() === 'undefined' || !Stratus.Environment.get('liveEdit')) return false;

            // If the widget is not rendered yet, and this model value is empty, set default value on the DOM element
            // before it's even rendered, so that users can see the fields that are available
            var modelValue = this.getPropertyValue();
            if (!this.isRendered && !modelValue && modelValue !== 0) {
                // This sets the contents of the element itself, not using traditional setValue()
                this.$el.html(this.options.placeholder);
            }
        },

        // liveEditOff()
        // ------------
        // Default callback when the liveEdit is toggled off. For example, if a field on the page is empty, but was populated
        // with default content when live edit was toggled on, we need to reset it back to empty
        // When toggling off liveEdit we need to do a safeSaveAction on every field...
        // TODO: we probably don't want them all to trigger an API call though...
        /**
         * @returns {boolean}
         */
        liveEditOff: function () {
            // If the widget is not editable, i.e. a getValue is not defined (e.g. display widgets), then don't do anything
            return (this.getValue() !== 'undefined') ? this.unrender() : false;
        },

        // unrender()
        // ------------------
        // Unrender the widget when liveEdit is toggled off OR when blurred.
        // But when liveEdit is toggled off, the widget may not be rendered yet (it may just have placeholder), so we
        // need to unrender the same way both ways.
        unrender: function () {

            // if template is not set to unrender, don't do anything
            if (!this.options.unrender) return false;

            // NOTE: It doesn't matter if the template is rendered, or just a placeholder, either way we reset the element with
            // the model value
            // Save Before Unrendering
            this.safeSaveAction({ saveNow: true });

            // TODO: don't save placeholder value
            // TODO: allow placeholder to be customized in the data attribute

            // When unrendering, set the data of the DOM element to the Display Value (which by default is the Model's
            // value, but can be manipulated)
            var unrenderedValue = this.options.before + this.getDisplayValue() + this.options.after;
            unrenderedValue = unrenderedValue === null ? '' : unrenderedValue;

            // This sets the contents of the element itself, not using traditional setValue()
            this.$el.html(unrenderedValue);
            this.isRendered = false;

            // AFTER UNRENDERING
            // If LiveEdit is on, we need to render back to a state that looks right for liveEdit, e.g. placeholders
            this.liveEditOn();

            this.trigger('unrender');
        },

        // After all widgets return their promise, we share dispatch objects one level deep
        /**
         * @param nest
         * @param parent
         * @returns {{parent: *, nest: *}}
         */
        loaderCallback: function (nest, parent) {
            var entries = { parent: parent, nest: nest };
            var register = function (view) {
                view.dispatch = this.dispatch;
            };
            if (parent && typeof parent === 'object' && parent.total > 0) _.each(parent.views, register, this);
            if (nest && typeof nest === 'object' && nest.total > 0) _.each(nest.views, register, this);
            this.renderEvent(entries);
            return entries;
        },

        /**
         * @returns {boolean}
         */
        primeIdleCheck: function () {
            if (!this.$element) return false;
            this.idleJob = this.idleJob || Stratus.Chronos.add(this.options.autoSaveInterval, this.idleCheck, this);
            return Stratus.Chronos.toggle(this.idleJob, this.isFocused);
        },

        /**
         * @returns {boolean}
         */
        idleCheck: function () {
            if (this._timestamp && ((Date.now() - this._timestamp) > (_.seconds(this.options.autoSaveInterval) * 1000))) {
                this._timestamp = null;
                this.safeSaveAction();
            }
            return true;
        },

        // focusAction()
        // -----------
        // Register a value when the editable element is focused, so we can check whether certain events should fire
        // This is not called by default, but should be called by widgets that have complex internal methods of detecting
        // focus, e.g. editor, datetimepicker, etc
        /**
         * @param event
         * @returns {boolean}
         */
        focusAction: function (event) {
            if (!this.isFocused) {
                this.isFocused = true;
                this.$el.addClass('editing');
                this.primeIdleCheck();
            }
            return true;
        },

        // blurAction()
        // -----------
        // Register a value when the editable element is focused, so we can check whether certain events should fire.
        // This is not called by default, but should be called by widgets that have complex internal methods of detecting
        // blur, e.g. editor, datetimepicker, etc
        /**
         * @param event
         * @returns {boolean}
         */
        blurAction: function (event) {
            if (this.isFocused) {
                this.isFocused = false;
                this.$el.removeClass('editing');
                this.primeIdleCheck();
                /*
                if (this.model && typeof this.model === 'object') {
                    this.safeSaveAction({saveNow: true});
                } else {
                    this.safeSaveAction();
                }
                */
                this.safeSaveAction();

                // If it's still rendered, AND the unrender options is set (whether it's an event or just true) then we call unrender
                if (this.isRendered && this.options.unrender) {
                    // Some widgets can't detect a blur event, instead they record isFocused (e.g. editor, datetimepicker, etc).
                    // So in those cases the widget needs to trigger the blurAction by it's own methods. which will call this here.
                    this.trigger('unrender');
                }
            }
            return true;
        },

        // Stub to allow widget to toggle focus on the element, if it requires unusual method
        focus: function () {
            if (this.$elementInput) {
                this.$elementInput.focus();
            } else if (this.$element && this.$element.length) {
                this.$element.focus();
            }
        },

        // Stub to allow widget to toggle blur on the element, if it requires unusual method
        blur: function () {
            if (this.$elementInput) {
                this.$elementInput.blur();
            } else if (this.$element && this.$element.length) {
                this.$element.blur();
            }
        },

        // keyActions()
        // -----------
        // Bind specific actions to key combinations
        /**
         *
         * @param event
         * @returns {boolean}
         */
        keyActions: function (event) {
            // Enter should blur focus and trigger the changes to be set to the model
            if (event.keyCode === Stratus.Key.Enter) {
                event.preventDefault();

                // safeSaveAction() is called on blur so we can just blur
                $(event.target).blur();
            }

            // Escape should cancel the changes
            if (event.keyCode === Stratus.Key.Escape) {
                event.preventDefault();
                this.closeAction(event);
            }

            // Update Key Timestamp
            this._timestamp = Date.now();
            return true;
        },

        // editAction()
        // -----------
        // When the widget is clicked, make sure the editable element is focused
        /**
         * @param event
         * @returns {boolean}
         */
        editAction: function (event) {
            $(event.target).focus();
            return true;
        },

        // closeAction()
        // -----------
        // When the escape key is called, we want to close the widget (blur) and revert.
        /**
         * @param event
         * @returns {boolean}
         */
        closeAction: function (event) {
            this.scopeChanged();
            $(event.target).blur();
            return true;
        },

        // safeSaveAction
        // ---------------
        // The safeSaveAction is meant to check if the value of the view element is different from the model, so that we
        // don't execute a saveAction unless something has changed.
        /**
         * @returns {boolean}
         */
        safeSaveAction: function (options) {
            // Ensure we can save
            if (!this.propertyName || this.options.dataType !== 'model' || !this.isRendered || !this.options.editable) return false;

            // if getValue() method has not been customized, then the widget is not enabled for editing and shouldn't set
            var value = this.getValue();
            if (typeof value !== 'boolean' && _.isEmpty(value)) {
                value = this.options.emptyValue;
            }

            // Save Data if Different
            if (value !== this.getPropertyValue()) {
                this.saveAction(options);
            }
            return true;
        },

        // getPropertyValue()
        // ---------------
        // Since there are two different dataTypes (model or var) we need to get the model value different for each
        /**
         * @returns {*}
         */
        getPropertyValue: function () {
            if (this.options.dataType === 'model') {
                return this.model.get(this.propertyName);
            } else if (this.options.dataType === 'var') {
                return Stratus.Environment.get(this.propertyName);
            } else {
                return false;
            }
        },

        // getPropertyValues()
        // ----------------
        // In some cases getModelValue may return an object, e.g. images will return one or more media objects
        // But we really only want an array of simple values (whatever field is the identifier)
        getPropertyValues: function () {
            var value = this.getPropertyValue();

            // If value is not an array then just return it as a simple array
            if (!_.isArray(value)) {
                value = [value];
            }

            // If value is an array, e.g. images is a media object, then create an array of just the ids
            var values = [];
            _.each(value, function (v) {
                if (!_.isObject(v)) {
                    values.push(v);
                } else if (_.has(v, 'id')) {
                    values.push(v.id);
                }
            });
            return values;
        },

        // setPropertyValue()
        // ---------------
        /**
         * @param value
         * @returns {*}
         */
        setPropertyValue: function (value) {
            // Determine Value Scope
            var scope = this.propertyName;
            if (value === null && typeof scope === 'string' && scope.indexOf('.') !== -1) {
                var digest = scope.split('.');
                if (_.last(digest) === 'id') {
                    scope = scope.slice(0, -3);
                }
            }
            // Remove Empty Values
            if (typeof value !== 'boolean' && !value) value = this.options.emptyValue;

            // Set Value
            if (this.options.dataType === 'model') {
                return this.model.set(scope, value);
            } else if (this.options.dataType === 'var') {
                return Stratus.Environment.set(scope, value);
            } else {
                return false;
            }
        },

        // REQUIRED TO BE SET ON EVERY VIEW THAT INTERACTS WITH AUTO SAVE
        //---------------------------------------------------------------

        // getValue()
        // ----------

        // This should get the value from the DOM element (may vary depending on view type, e.g. text, select,
        // editor). The element can be found at this.element, which references $('#'+this.element)
        /**
         * @returns {string}
         */
        getValue: function () {
            return 'undefined';
        },

        // setValue()
        // ----------

        // this should set the value from the model on the DOM element
        /**
         * @param value
         * @returns {*}
         */
        setValue: function (value) {
            return value;
        },

        // RECOMMENDED TO BE SET ON EVERY VIEW
        // ====================================

        // getDisplayValue()
        // -----------------

        // The value that should be displayed on the page, which may be formatted differently, e.g. a date will not
        // display the UNIX timestamp, but a formatted value. A widget can customize formatDisplayValue() to alter the value.
        /**
         * @returns {*}
         */
        getDisplayValue: function () {
            return this.formatDisplayValue(this.getPropertyValue());
        },

        // formatDisplayValue()
        // --------------------

        // If you need the value that gets displayed to the DOM to be formatted differently (e.g. convert timestamp to a date)
        // you can customize this value on any widget.
        /**
         * @param value
         * @returns {*}
         */
        formatDisplayValue: function (value) {
            return value;
        },

        // saveAction()
        // -------------

        // Default Save Action, required for every element that has a propertyName.
        /**
         * @param options
         *      -options.saveNow {boolean} bypass autosave delay and save right away
         * @returns {boolean}
         */
        saveAction: function (options) {
            if (!this.propertyName) return false;

            if (typeof options === 'undefined') options = {};

            // set the changes to the model
            this.setPropertyValue(this.getValue());
            this.setStatus('change');

            // If auto save is set, the stratus will automatically save at intervals
            if (this.model && typeof this.model === 'object' && (!this.options.autoSave || options.saveNow)) {
                this.model.saveInterval();
            }

            return true;
        },

        // scopeChanged()
        // --------------

        // Default Action to take if there are any changes to the model.
        // This usually includes changes to CSS classes that broadcast
        // the state e.g. status, deleted, published, etc.
        /**
         * @returns {boolean}
         */
        scopeChanged: function () {
            if (!this.propertyName) return false;
            if (!this.isFocused) {
                // get the value of the property fetched from the API and update the element's value in the DOM
                // NOTE: We do not want the current field to be updated if the model updates from a save somewhere else
                // otherwise, the stuff we typed since last save is going to be overwritten
                this.setValue(this.getPropertyValue());
            }
            return true;
        },

        // dispatchTrigger()
        // ----------------

        // Called after rendering of the template is complete.
        /**
         * @returns {boolean}
         */
        dispatchTrigger: function (entries) {
            this.dispatch.trigger('render', entries);
            return true;
        },

        // Render Event
        // ------------

        // This allows a widget to safely render or re-render a widget at any point
        // it deems necessary, while still priming the postRender

        /**
         * @param options
         * @returns {Stratus.Views.Widgets.Base}
         */
        renderEvent: function (options) {
            this.primePostRender();
            this.trigger('render', options || this);
            return this;
        },

        // Prime the Post Render event before each render trigger
        primePostRender: function () {
            // This will be added to the render function once after the render event
            this.once('render', function () {
                this.trigger('postrender');
            }, this);
        },

        // onRender()
        // ----------------

        // Called after rendering of the template is complete.
        /**
         * @param entries
         * @returns {boolean}
         */
        onRender: function (entries) {
            return true;
        },

        // onPostRender()
        // -------------
        // Methods to execute after any custom renderCallback()
        /**
         * @param entries
         * @returns {boolean}
         */
        onPostRender: function (entries) {
            this.isRendered = true;

            // Add the value to the rendered template (this is done after callback in case part of rendering needs to
            // happen first, e.g. dateTimePicker gets instantiated on the rendered element, before values can be saved)
            this.scopeChanged();

            // If this was rendered based on a click, focus on the element
            // This is called after renderCallback so that the elementInput can be set custom if necessary
            if (this.options.render !== 'auto') {
                this.focus();
            }
            this.trigger('register');
            return true;
        },

        // onUnrender()
        // ------------

        // Custom functions to call when unrendering on a specific widget
        /**
         * @param entries
         * @returns {Stratus.Views.Widgets.Base}
         */
        onUnrender: function (entries) {
            return this;
        },

        // Event Registration
        // ------------------

        // These functions ensure registration only happens once per model or collection.
        // If a collection or model is created within the widget, outside of a Stratus
        // Loader, those will need to be registered separately.

        /**
         * @returns {boolean}
         */
        primeRegister: function () {
            this.registered = this.registered || this.onRegister();
            return true;
        },

        /**
         * @returns {boolean}
         */
        onRegister: function () {
            // Determine Scope
            var scope = this.propertyName || 'change';
            if (scope !== 'change') scope = 'change:' + scope;

            // Listen to Properties
            if (this.model && typeof this.model === 'object') {
                this.model.on(scope, this.scopeChanged, this);
            } else if (this.options.dataType === 'var') {
                Stratus.Environment.on(scope, this.scopeChanged, this);
            }
            return true;
        }

    });

}));
