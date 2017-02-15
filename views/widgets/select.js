//     Stratus.Views.Select.js 1.0

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

// Purpose
// ========
// This is a flexible choice widget, which can display as a traditional select (single or multiple), checkbox, radio,
// or as a fancy image based list. The options can be provided via a static list of options, or they can be populated
// dynamically from a collection (which could allow filtering, paging, etc. e.g. layout selector).

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
        define(['stratus', 'zepto', 'underscore', 'text!templates-widgets-select', 'stratus.views.widgets.base'], factory);
    } else {
        factory(root.Stratus, root.$, root._);
    }
}(this, function (Stratus, $, _, Template) {

    // Select Widget
    // -------------

    // Select View which extends base view.
    Stratus.Views.Widgets.Select = Stratus.Views.Widgets.Base.extend({

        // Properties
        model: Stratus.Models.Generic,
        template: _.template(Template || ''),

        // templateOptionsCheckbox: _.template(),

        options: {
            private: {
                // A select will automatically save on click
                autoSave: false,
                forceType: 'model'
            },
            public: {
                // Technically it is editable since it saves a value
                editable: true,

                // Indicate whether to allow selecting multiple options, or only a single option
                // e.g. checkbox if it's multiple, radio if it's exclusive
                // TODO: this hasn't yet been tested on an entity property that allows multiple (testing required)
                multiple: false,

                // The number of options to display in a multiple list
                multipleSize: 5,

                // Options to Determine How Select UI is Rendered, can be combined with multiple to allow menu that
                // is also multiple selectable.
                // null: a basic HTML select
                // menu: a fancy drop down that can accommodate custom templates (particularly useful if you want to have images)
                // list: a list of options (particularly useful if you want to have images)
                ui: null,

                // Flag whether to include the search filter above the collection (assuming you sourced your choices
                // from the API)
                // Default Placeholder
                placeholder: 'Click to See Options',
                showPaginatorTop: false,
                showSearch: false,

                // Flag whether to include an area that displays the items that have been selected
                // TODO: Currently this will only work with options that are sourced from the API (i.e. optionsCustom.source, not optionsCustom.choices)
                showSelected: true,

                // Customize the layout of the selected items. The 'combined' template can contain all of them, otherwise
                // specify 'list', 'container', and 'entity' templates separtely
                selectedTemplates: { combined: 'templates-widgets-selected-options' },

                // The title inside the selected container. Set as empty if no header is desired.
                textSelectedHeader: 'Selected Options',
                textSelectedNoContent: 'No {{TYPE}} Selected',
                cssSelectedNoContent: 'addAnimation',

                // TODO: Determine if the items that are selected should be removed from the main list
                selectedRemove: false,

                // TODO: Determine if user can drag items from the options to the selected list
                selectedDrag: false,

                // Manually provide a JSON string of options. This can be either a simple array (e.g. ["value1", "value2"] where the values will be used for key and label), or an array of objects (e.g. [{"value": "value1", "label": "Value 1", "image": "//www.sitetheory.io/images/foo.jpg"}, {"value": "value2", "label": "Value 2", "image": "//www.sitetheory.io/images/foo2.jpg"}]).
                // Allowed Properties: value, label, image, containerClass, checked
                choices: null,

                // specify a the API to load options as a generic list, e.g. "Layout"
                source: null,

                // specify an object or array of objects to limit the sourceApi request, e.g. {"entity":"contentType", "id":2} or if you don't know the id, you can specify a variable on the model to use instead, e.g. {"entity":"contentType", "modelId":"contentType.id"} and it will make the API path be /Api/ContentType/2/Layout to filter all layouts by contentTypeId=2. Combine multiple objects in an array to create complex filtering.
                sourceTarget: null,
                sourceApi: null,
                sourceIdAttribute: 'id',
                sourceLabelAttribute: 'id',

                // The property name of the image field
                sourceImageAttribute: 'images',

                // The path to the default templates to render the collection. If you specify alternative templates, they
                // should include the basic element and logic for checkbox vs. radio inputs.
                // Customize the layout of the selected items. The 'combined' template can contain all of them, otherwise
                // specify 'list', 'container', and 'entity' templates separtely
                sourceTemplates: { combined: 'templates-widgets-select-options' },

                // Limit the source collection
                sourceLimit: null,

                // TODO: point to the cloud server (PATH!)
                // TODO: this (and all others) should point to current version path
                // The CSS file to load for this widget
                cssFile: [Stratus.BaseUrl + 'sitetheorystratus/stratus/views/widgets/select.css', Stratus.BaseUrl + 'sitetheorycore/css/Core/list.css'],

                // The class that should appear on the dropdown-menu (which is the containerOptions when this ui is
                // set to display as a menu).  This is usually used to determine if you want to pull-left or right,
                // but could add anything.
                classDropdown: 'pull-left'
            }
        },

        events: {
            // Checkbox or Radio
            'click .selectOptionsContainer .optionContainer input': 'syncModel',

            // Select
            'change .selectOptionsContainer select': 'syncModel',

            // If the showSelected is enabled, make the delete button work
            'click .selectedOptionsContainer button.delete': 'removeSelectedOption'
        },

        // postOptions()
        // ------------------
        // Some values must trigger other conditional default values
        postOptions: function (options) {
            if (this.options.ui === 'list') {
                this.options.classDropdown = '';
            } else {
                this.options.showSelected = false;
                this.options.sourceLimit = 100;
                if (this.options.ui === null) {
                    this.options.classDropdown = '';
                } else {
                    this.options.classDropdown += ' dropdown-menu';
                }
            }

            // Set standard values for the input (which are passed to the templates rendering the inputs)
            this.options.inputType = this.options.multiple === true ? 'checkbox' : 'radio';
            this.options.inputName = this.uid + '_' + this.propertyName.replace('.', '_');

            if (this.options.source) {
                this.options.sourceApi = _.extend(this.options.sourceApi || {}, { limit: this.options.sourceLimit });
                this.options.sourceMeta = {
                    ui: this.options.ui,
                    inputType: this.options.inputType,
                    inputName: this.options.inputName,
                    placeholder: this.options.placeholder,
                    modelIdAttribute: this.options.sourceIdAttribute,
                    modelLabelAttribute: this.options.sourceLabelAttribute,
                    modelImageAttribute: this.options.sourceImageAttribute
                };
                if (this.options.showSelected) {
                    this.options.selectedMeta = {
                        elementId: this.element,
                        api: this.options.sourceApi,
                        modelLabelAttribute: this.options.sourceLabelAttribute,
                        modelImageAttribute: this.options.sourceImageAttribute
                    };
                }
                this.options.textSelectedNoContent = this.options.textSelectedNoContent.replace('{{TYPE}}', _.ucfirst(this.options.source));
            }
        },

        onResolve: function () {
            // Make Sure sourceTarget is an array we can cycle through for including the collection
            if (_.isObject(this.options.sourceTarget) && !_.isArray(this.options.sourceTarget)) {
                this.options.sourceTarget = [this.options.sourceTarget];
            }

            // Validate each sourceTarget is complete
            if (_.isArray(this.options.sourceTarget)) {
                this.options.collectionTarget = [];
                _.each(this.options.sourceTarget, function (el, k) {
                    // if there is no id but there is an idAttribute, find the id in the model
                    if (!_.has(el, 'id') && _.has(el, 'idAttribute') && this.model.get(el.idAttribute)) {
                        el.id = this.model.get(el.idAttribute);
                    }
                    if (_.has(el, 'entity') && _.has(el, 'id')) {
                        this.options.collectionTarget.push({ entity: el.entity, id: el.id });
                    }
                }, this);
            }
        },

        // validate()
        // -------------
        // Check that the element contains the minimum required data attributes
        /**
         * @returns {boolean}
         */
        validate: function () {
            // Both model bound and Stratus.Environment variables need to set the data-property (name of the variable being altered)
            if (!this.$el.data('property')) {
                // message, title, class
                Stratus.Events.trigger('toast', 'The data-property attribute is missing.', 'Missing Data Attribute', 'danger');
                return false;
            }

            // Choices must be JSON
            if (this.options.choices && typeof this.options.choices !== 'object') {
                Stratus.Events.trigger('toast', 'The data-choice attribute is defined as a JSON string, but it is not an array.', 'Incorrect Data Attribute Format', 'danger');
                return false;
            }

            return true;
        },

        // onRender()
        // ----------------
        // After the template renders, get the value and update the DOM. Use the same method for both model bound
        // objects and simple variable toggles, since all it does is gets the value and updates the class
        onRender: function (entries) {

            // Container for the options
            this.containerOptions = this.$el.find('.selectOptionsContainer');
            this.containerPlaceholder = (this.options.ui === 'menu') ? this.$el.find('.placeholder') : null;

            // container for the selected
            this.containerSelected = (this.options.showSelected) ? this.$el.find('.selectedOptionsContainer') : null;

            // We are grabbing the collection from below this select widget that were already built
            // These are the options we can select from

            if (this.options.source && entries.parent.total) {
                _.each(entries.parent.views, function (widget) {
                    if (_.has(widget, 'collection') && typeof widget.collection === 'object') {
                        this.optionsCollection = widget.collection;
                    }
                }, this);
            }

            // These are the options we have selected
            if (this.options.showSelected && entries.nest.total) {
                _.each(entries.nest.views, function (widget) {
                    if (_.has(widget, 'collection') && typeof widget.collection === 'object') {
                        this.selectedCollection = widget.collection;
                    }
                }, this);
            }

            this.addOptions();

            if (this.options.showSelected) {
                // TODO: add functionality to allow drag/drop of options into the selected
            }

        },

        /**
         * @returns {boolean}
         */
        onRegister: function () {

            // Register Events
            // Set Values on DOM first time, and every time the model changes (if there is a model)
            // Since this isn't a traditional "input" that we can get the data from on the DOM, we need
            // to set the initial value ON the dom. The modelChange will do a setValue from the getModelValue
            // (which will be the model or the internal var.
            if (this.options.dataType === 'model') {
                // this.model.on('change', this.scopeChanged, this);
                this.getSelectedCollection();

                // If this is display ui=menu and showSelected is not on, we need to get the selected manually
                this.model.on('change:' + this.propertyName, function () {
                    this.model.once('success', function () {
                        if (this.options.ui === 'menu' && !this.options.showSelected) {
                            this.getSelectedCollection();
                        }
                    }, this);
                }, this);
            }

            // If the choices are supplied manually, we can check the model has changed immediately in
            // the addOptions() method. If the choices are added dynamically via an API source then we need
            // run the model Change AFTER the sub widget for Collection is loaded, e.g. loaderCallback()

            // If the options are loaded dynamically from an API source, we need to sync the DOM with the model
            // AFTER the collection is loaded fully, which is why this is done in the loaderCallback() method
            if (this.options.source) {

                // If we are loading the options from a source collection, and there is pagination or filtering
                // then we need to resync the inputs to the model data whenever they update (to see if they are
                // checked). So we have to add a listener to the collection where these options exist, so that
                // when that collection changes, we run our internal syncDom() function again.
                // The Dispatch is a bubble around this select widget and all it's children, so whenever
                // children change they trigger this dispatch and we are notified here and execute our method.
                this.dispatch.on('render', this.syncDom, this);
            }

            return true;
        },

        // TODO: create option to display the "selected" in a separate list. This is
        // useful when there is a large list (particularly multiple pages).
        // e.g. image library
        // selecting an option should add to the list, and unclicking (from options)
        // or removing from selected list, need to be tied

        addOptions: function (container) {
            // Populate Options
            if (!this.options.choices || !this.containerOptions) return false;
            _.each(this.options.choices, function (option, i) {
                // if it's a simple array, the option will be a string used for value and label
                var value = option;
                var label = option;
                var image = null;
                var imageBg = null;
                var checked = null;
                var containerClass = '';
                if (typeof option === 'object') {
                    value = option.value ? option.value : null;
                    label = option.label ? option.label : value;
                    containerClass = option.containerClass ? ' ' + option.containerClass : '';
                    if (typeof option.checked !== 'undefined' && option.checked === true) {
                        checked = this.options.ui === 'menu' ? 'checked="checked"' : 'selected="selected"';
                    }
                    if (option.image) {
                        image = option.image;
                        imageBg = 'style="background-image:url(' + option.image + ');"';
                        containerClass += ' hasImage';
                    }
                }

                var optionId = this.options.inputName + '-selectOption-' + i;

                // TODO: mark as checked
                // TODO: make it use a template that can be extended by the user
                // TODO: allow an image or HTML in the choices. It might be okay to just pass that through the label
                if (this.options.ui === 'menu') {
                    this.containerOptions.append('<div class="optionContainer' + containerClass + '" ' + imageBg + '><input id="' + optionId + '" type="' + this.options.inputType + '" name="' + this.options.inputName + '" value="' + value + '" ' + checked + ' class="form-control selectOption"><label class="control-label selectImage" for="' + optionId + '">' + label + '</label></div>');
                } else {
                    this.containerOptions.append('<option value="' + value + '" ' + checked + '>' + label + '</option>');
                }
            }, this);

            // If the choices are supplied manually, we can check the model has changed immediately, and
            // update the DOM with the model values.
            this.scopeChanged();

        },

        // setEvents()
        // ----------------
        /*
         setEvents: function() {
         // TODO: if ui=menu, setup morebox to open/close the menu dropdown

         // TODO: also add 'checked' to the parent

         // Add Actions to Each Input (which may not be on the page yet) by setting event on the parent
         // Currently using the backbone events instead
         //this.containerOptions.on('click .selectOption', function() { this.syncModel() }.bind(this));

         },
         */

        // syncDom()
        // ---------
        // Make the DOM reflect the model values, e.g. update check status on each input
        // NOTE: the inputs currently displayed may be paginated so we can't rely on them being complete
        // when setting or fetching
        syncDom: function () {
            this.setInputValues();
            if (this.containerPlaceholder) this.setPlaceholder();

            // At the moment, the selected list is managed by a separate collection, which means it only works
            // with dynamic API sourced options. At this time, we don't need to code a selected list for
            // custom choices because those will rarely be so many that you can't just look in the existing list.
            // When we do code it, it will need to work like addOptions, and add/remove from the selected list
            // if(this.containerSelected) this.setSelected();
        },

        // syncModel()
        // ----------------
        // Get the input values (inputs checked) and save the values to the value vault on this
        // widget's data-value attribute, which is then referenced by getValue() function in the save action.
        // Each time an input is checked or unchecked, it will either add or remove the value from the vault.
        //
        // BEWARE: if the choice list is a collection that is paginated, all the selected inputs may not be
        // displayed on the page. So we can't use getInputValues to cycle through current inputs and expect to
        // get inputs that were checked on other pages. Therefore this needs to add to the data-value,
        // but not remove values. Removing values needs to happen separately.
        syncModel: function (event) {
            // If Multiple options allowed, we need selection to span pagination
            // Otherwise the value is just updated by the current selected options
            var inputValue = $(event.target).val();
            if (this.options.multiple) {
                var modelValue = this.getValue();

                // Add Value
                if ($(event.target).is(':checked')) {
                    modelValue.push(inputValue);

                    // Remove Value
                } else {
                    modelValue = _.without(modelValue, inputValue);
                }
                this.setPropertyValue(modelValue);
            } else {
                this.setPropertyValue(inputValue);
            }

            // we set the value on the DOM, so that a saveAction can getValue (from DOM)
            // We do not setPropertyValue() directly because that would remove the changeSet
            // this.setValue(this.getInputValues());
            // standard function that will save the value returned from getValue()
            this.safeSaveAction();
        },

        // removeSelectedOption()
        // ----------------------
        // Remove items from the selected container
        // TODO: at the moment the selected area only works with choices that are sourced from the API
        removeSelectedOption: function (event) {
            if (this.containerSelected) {
                var removeValue = $(event.currentTarget).dataAttr('value');
                if (removeValue) {
                    // Update the model, and the DOM will sync
                    var modelValue = this.getPropertyValue();
                    if (modelValue && typeof (modelValue) === 'object') {
                        modelValue = _.clone(modelValue);
                    }
                    var direct = false;
                    if (!_.isArray(modelValue)) {
                        modelValue = [modelValue];
                        direct = true;
                    }

                    // If value is an array, e.g. images is a media object, then create an array of just the ids
                    _.each(modelValue, function (v, k) {
                        if (_.isObject(v) && _.has(v, 'id') && v.id === removeValue) {
                            // use splice instead of delete modelValue[k]; because that leaves [null] in an array
                            modelValue.splice(k, 1);
                        } else if (v === removeValue) {
                            modelValue.splice(k, 1);
                        }
                    });

                    var newValue = direct ? _.first(modelValue) : modelValue;
                    this.setPropertyValue(newValue);
                    this.setValue(newValue);
                    this.safeSaveAction();
                }
            }
        },

        // setInputValues()
        // ----------------
        // Takes the model value and toggles on/off all the inputs that match the value(s)
        // NOTE: if the collection is paginated, all the inputs may not be displayed, so this would need to be
        // called in again each time the collection is filtered or paginated.
        // value: must be an array of values that can be compared directly with the input value.
        setInputValues: function (values) {
            values = _.isArray(values) ? values : this.getPropertyValues();
            if (!this.containerOptions) return false;

            if (!this.options.ui) {
                // Cycle through all the inputs and check the correct one
                _.each(this.containerOptions.find('option'), function (el) {
                    // value can be a string (!multiple) or an array (multiple)
                    $(el).prop('selected', _.contains(values, _.hydrate($(el).attr('value'))));
                }, this);
            } else {
                // Cycle through all the inputs and check the correct one
                _.each(this.containerOptions.find('input'), function (el) {
                    // value can be a string (!multiple) or an array (multiple)
                    $(el).prop('checked', _.contains(values, _.hydrate($(el).val())));
                }, this);
            }
        },

        // getOptionLabel()
        // ----------------
        // For menu UIs, get the label for the options that matches the selected values
        // NOTE: value can be a single value or array of values
        getOptionLabel: function (values) {

            if (!values) return false;
            var labels = [];
            values = (typeof values === 'object' && _.isArray(values)) ? values : [values];
            if (this.options.choices) {
                _.each(this.options.choices, function (option) {
                    // if it's a simple array, the option will be a string used for value and label
                    var value = option;
                    var label = option;
                    if (typeof option === 'object') {
                        value = typeof option.value !== 'undefined' ? option.value : null;
                        label = typeof option.label !== 'undefined' ? option.label : value;
                    }
                    if (_.contains(values, value)) {
                        labels.push({ value: value, label: label });
                    }
                }, this);
            } else if (this.options.source && this.selectedCollection && this.selectedCollection.models.length > 0) {
                // If the options are sourced from the API, e.g. Collection, then we get the selected options
                this.selectedCollection.forEach(function (option) {
                    var value = option.get(this.options.sourceIdAttribute);
                    var label = option.get(this.options.sourceLabelAttribute);
                    if (_.contains(values, value)) {
                        labels.push({ value: value, label: label });
                    }
                }, this);
            }
            return labels;
        },

        // setPlaceholder()
        // ----------------
        // If this is display ui=menu then we need to update the placeholder to reflect
        // the value of the selected options
        setPlaceholder: function () {
            // if more than one value, count the total and say (+3 more)
            var labels = this.getOptionLabel(this.getPropertyValue());
            if (labels.length > 0) {
                var placeholder = _.first(labels).label;
                if (labels.length > 1) placeholder += ' (+' + (labels.length - 1) + ' more)';
                this.containerPlaceholder.text(placeholder);
            }
        },

        // getSelectedCollection()
        // -----------------------
        // Get the collection of selected options when using the choices from the source API
        getSelectedCollection: function () {

            if (!this.options.source) return false;

            // Get the Collection Once, otherwise Refresh
            if (typeof this.selectedCollection === 'undefined') {
                // Get the Collection via API
                this.selectedCollection = new Stratus.Collections.Generic({
                    entity: _.ucfirst(this.options.source),
                    target: this.modelTarget(),
                    initialize: true,
                    api: { property: this.propertyName }
                });
                Stratus.Instances[this.selectedCollection.globals.get('uid')] = this.selectedCollection;
                if (typeof this.propertyName === 'string') {
                    this.model.on('change:' + this.propertyName, function () {
                        this.model.once('success', function () {
                            this.model.once('change', function () {
                                this.selectedCollection.target = this.modelTarget();
                                this.selectedCollection.refresh({ reset: true });
                            }, this);
                        }, this);
                    }, this);
                }

                // set placeholder AFTER we get the collection
                this.selectedCollection.on('reset', this.syncDom, this);
            } else {
                this.selectedCollection.refresh({ reset: true });
            }
        },

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

        // modelChange()
        // -------------
        // If this entity is changed anywhere, check the status and update the DOM.
        /**
         * @returns {boolean}
         */
        scopeChanged: function () {
            // When model changes, make sure the widget's data-value attribute reflects the model value
            this.setValue(this.getPropertyValues());
            if (this.options.choices) {
                // If manual choices are set (this.options.choices), we need to run the syncDom
                // But we don't do this for source choices because a different listener manages that.
                this.syncDom();
            }
            return true;
        },

        // setValue()
        // -----------
        // This sets the value on the DOM (not set the value to the model).
        // NOTE: this is called when the model changes
        setValue: function (value) {
            if (value === undefined) return false;

            // Store value on the element for quick retrieval if necessary
            // if it's multiple, convert to an array if it isn't
            if (this.options.multiple && !_.isArray(value)) {
                value = (value === null) ? [] : [value];
            }
            this.$el.dataAttr('value', value);
        },

        // getValue()
        // ----------
        // This is meant to get the value from the DOM (not from the model), so it would need to cycle
        // through all the options and find the checked version. But to avoid that, we save the value
        // on the element, and find it there.
        getValue: function () {
            // When we return the value to the base to update the model, we need to convert it to a single
            // value if multiple = false.
            var value = this.$el.dataAttr('value');
            return (this.options.multiple === false && _.isArray(value)) ? _.first(value) : value;
        }

    });

}));
