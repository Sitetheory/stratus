//     Stratus.Views.Toggle.js 1.0

//     Copyright (c) 2017 by Sitetheory, All Rights Reserved
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

// Notes
// =====
// Toggle is different than a regular "select" widget in that it's meant to be just one value that you are toggling on/off (not selecting from multiple options), e.g. a single checkbox that is styled to look however you want. It can also be made to relate to other toggles across the page in cases where you need them all to match or inverse the current value, which makes it possible to make a toggle exclusive across different widgets interacting with different entities, e.g. the "primary" radio button on the routing.

// Toggle needs data-property so we know what variable should get updated, but it does not necessarily need a data-model (e.g. if it is going to update Stratus.Environment variable).

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
    define(['stratus', 'jquery', 'underscore', 'text!templates-toggle', 'stratus.views.widgets.base'], factory);
  } else {
    factory(root.Stratus, root.$, root._);
  }
}(this, function (Stratus, $, _, Template) {

  // Toggle Widget
  // -------------

  // Toggle View which extends base view.
  Stratus.Views.Widgets.Toggle = Stratus.Views.Widgets.Base.extend({

    // Properties
    model: Stratus.Models.Generic,
    template: _.template(Template || ''),
    events: {
      click: 'clickAction'
    },

    // Options that are customizable in the data attribute of the DOM
    options: {
      private: {
        // A toggle will automatically save on click
        autoSave: false,

        // This saves whether this toggle is bound to a model or a variable (within Stratus.Environment), e.g. model|var
        dataType: null,

        // SliderCss
        sliderCss: [
          Stratus.BaseUrl + Stratus.BundlePath + 'bower_components/bootstrap-toggle/css/bootstrap-toggle.min.css'
        ],

        // specify whether the value being toggled is 'boolean' (true|false) or 'string' (1|0, red|green)
        // If value is 'string' you MUST set the valueOn and valueOff
        valueType: null
      },
      public: {
        // Technically it is editable since it saves a value
        editable: true,

        // Optional: 'radio'|'checkbox'|'icon'|'slider'
        ui: 'checkbox',
        style: 'widget',

        // enter the CSS class of a gradient class to make a div appear above the SVG for styling
        gradient: false,

        // set to NULL to use default icon, FALSE to hide button, or set to HTML (e.g. an SVG) if you want a custom icon.
        icon: null,
        iconPath: '@SitetheoryCoreBundle:images/icons/actionButtons/visibility.svg',

        // set to empty if you do not want text buttons
        textOn: 'Hide',
        textOff: 'Show',
        emptyValue: false,
        classBtn: 'btn-icon',
        classOn: 'btn-text small-label text-on',
        classOff: 'btn-text small-label text-off',

        // specify what the value should be for ON and OFF if valueType is not boolean
        valueOn: true,
        valueOff: false,

        // specify if you want this toggle to relate to other toggles (either matching or inverse value)
        related: null,

        // By default checking one will uncheck the others (inverse). But if you want it to match, set to false and checking one will check others.
        relatedInverse: false,

        // By default if you set related, one must always be checked (radio), but if you don't want
        // to require a value, then set this to false, so that they are checkboxes
        relatedRequire: false,

        // If you set related values, and you want to do a re-sync from the database (because you have a
        // listener that updates the values), then set sync as true. See setRelated() method for more details.
        relatedSync: false,

        // This allows for a checkbox to have Javascript level styling
        slider: false,

        // large, normal, small, mini
        sliderSize: 'normal',

        // default, primary, success, info, warning, danger (default: primary)
        sliderOnStyle: 'info',

        // default, primary, success, info, warning, danger (default: default)
        sliderOffStyle: 'warning',

        // adds a class to the bootstrapToggle container
        sliderStyle: '',
        sliderWidth: null,
        sliderHeight: null
      }
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
      // set empty value as the off value
      this.options.emptyValue = this.options.valueOff;

      // TODO: Move this into the base for Icon Registration
      if (this.options.ui === 'icon' && this.options.iconPath) {
        Stratus.Internals.Resource(this.options.iconPath, this.element).then(function (icon) {
          this.options.icon = icon;
          Stratus.Views.Widgets.Base.prototype.promise.call(this, options, resolve, reject);
        }.bind(this));
      } else {
        Stratus.Views.Widgets.Base.prototype.promise.call(this, options, resolve, reject);
      }
    },

    /**
     * @param options
     */
    preOptions: function (options) {
      if (this.$el.dataAttr('ui') === 'slider') {
        this.options.public.textOn = 'Enabled';
        this.options.public.textOff = 'Disabled';
      }
    },

    // postOptions()
    // ----------------
    // Custom Options for a widget in case you need to modify after regular merging.
    /**
     * @param options
     */
    postOptions: function (options) {
      if (this.options.ui === 'slider') {
        this.options.ui = 'checkbox';
        this.options.slider = true;
        this.options.cssFile = _.union(this.options.cssFile, this.options.sliderCss);
      }
      if (this.options.related) {
        this.options.ui = (this.options.relatedRequire) ? 'radio' : this.options.ui;
      }
      if (((this.options.ui === 'checkbox' && !this.options.slider) || this.options.ui === 'radio') && typeof this.$el.dataAttr('textOn') === 'undefined') {
        this.options.textOn = null;
        this.options.textOff = null;
      }
      this.options.valueType = typeof (this.options.valueOn);
    },

    // validate()
    // -------------
    // Check that the element contains the minimum required data attributes
    /**
     * @returns {boolean}
     */
    validate: function () {
      // Both model bound and Stratus.Environment variables need to set the data-property (name of the variable being altered)
      if (!this.$el.dataAttr('property')) {
        Stratus.Events.trigger('toast', 'The data-property attribute is missing.', 'Missing Data Attribute', 'danger');
        return false;
      }

      // Verify Model
      if (this.options.dataType === 'model' && typeof this.model === 'function') {
        Stratus.Events.trigger('toast', 'This widget requires a model that is missing.', 'Missing Model', 'danger');
        return false;
      }

      return true;
    },

    /**
     * @param options
     */
    onRender: function (options) {
      // Bootstrap Toggle
      if (this.options.ui === 'checkbox' && this.options.slider) {

        this.scopeChanged();

        /*
        // Find DOM Element
        this.slider = this.$el.find('input');

        // Initialize
        this.slider.bootstrapToggle({
            on: this.options.textOn,
            off: this.options.textOff,
            size: this.options.sliderSize,
            onstyle: this.options.sliderOnStyle,
            offstyle: this.options.sliderOffStyle,
            style: this.options.sliderStyle,
            width: this.options.sliderWidth,
            height: this.options.sliderHeight
        });
        */
      }
    },

    // clickAction()
    // -------------
    // When the button is clicked set the toggled value (opposite of current value).
    // WARNING: toggle should not be registered as auto-save. And the toggling of the value should not be set on
    // save, but ONLY on the click action
    /**
     * @param event
     */
    clickAction: function (event) {
      // If ui is set as 'radio', don't let them uncheck
      var newValue = this.toggleValue();
      if (this.options.ui === 'radio' && newValue === this.getValueOff()) return;

      this.setPropertyValue(newValue);

      // Whenever an element is clicked (and sets value), it also needs to check related
      if (this.options.dataType === 'model') {
        // this calls the default saveAction which sets to the model
        this.safeSaveAction({ saveNow: true });
      }
      this.setRelated();
    },

    // modelChange()
    // -------------
    // If this entity is changed anywhere, check the status and update the DOM.
    /**
     * @param event
     * @returns {boolean}
     */
    scopeChanged: function (event) {
      // Toggle Class: if the value is boolean (if the status is true then the "on" class is set)
      // If this is a model, we want to get the data of the model, otherwise
      var value = this.getPropertyValue();

      // If boolean, set the opposite of the class, otherwise, set the class name to be the value
      // Set Value on the element's data attribute
      this.setValue(value);

      if (this.options.valueType === 'boolean') {
        this.$el.toggleClass('on', value);
        this.$el.toggleClass('off', !value);
      } else {
        this.$el.toggleClass('on on-' + this.options.valueOn, (value === this.options.valueOn));
        this.$el.toggleClass('off off-' + this.options.valueOff, (value === this.options.valueOff));
      }
      if (this.options.ui === 'checkbox' || this.options.ui === 'radio') {
        value ? this.$element.attr('checked', 'checked') : this.$element.removeAttr('checked');
      }

      return true;
    },

    // toggleValue()
    // -------------
    // Return the opposite of the current set value.
    /**
     * @returns {boolean}
     */
    toggleValue: function () {
      var value = this.getPropertyValue();

      // NOTE: If the value is relatedRequire (radio) it will always be the on/true value
      // If the Value is boolean, just get the opposite for now (see above)
      // NOTE: an icon based toggle will have this.options.related=null
      // so relatedRequire doesn't apply
      if (this.options.valueType === 'boolean') {
        value = (this.options.related && this.options.relatedRequire) ? true : !value;
      } else {
        value = ((this.options.related && this.options.relatedRequire) || value !== this.options.valueOn) ? this.options.valueOn : this.options.valueOff;
      }
      return value;
    },

    /**
     * @returns {boolean}
     */
    getValueOn: function () {
      return (this.options.valueType === 'boolean') ? true : this.options.valueOn;
    },

    /**
     * @returns {boolean}
     */
    getValueOff: function () {
      return (this.options.valueType === 'boolean') ? false : this.options.valueOff;
    },

    // setValue()
    // -----------
    // This sets the value on the DOM (not set the value to the model)
    /**
     * @param value
     */
    setValue: function (value) {

      // Store as JSON so that it boolean remains
      this.$element.closest('[data-type="toggle"]').dataAttr('value', value);

      // Check if this toggle is a checkbox or radio (determined if it's flagged as 'related')
      if (this.options.related) {
        if (value === this.getValueOn()) {
          this.$element.prop('checked', true);
          this.$element.attr('checked', 'checked');
        } else {
          this.$element.prop('checked', false);
          this.$element.removeAttr('checked');
        }
      }

      // Since this doesn't save to model, the normal save won't work so we just save it right away manually
      if (this.options.dataType === 'var') {
        // Since this doesn't register a 'change' event on the model, we just have to call scopeChanged manually
        // Set the value on the body, so we can referenece this in CSS if necessary, e.g. data-liveEdit
        $('#app').dataAttr(this.propertyName.toLowerCase(), value);
      }
    },

    // getValue()
    // ----------
    // This is meant to get the value from the DOM (not from the model)
    /**
     * @returns {*}
     */
    getValue: function () {
      var value = this.$el.dataAttr('value');
      return (typeof value !== 'undefined') ? value : this.getValueOff();
    },

    /**
     * @param value
     * @returns {*}
     */
    getValueInverse: function (value) {
      if (value === undefined) value = this.getValue();
      return (value === this.getValueOn()) ? this.getValueOff() : this.getValueOn();
    },

    // setRelated()
    // --------------
    // When a toggle with relations is clicked, check the related toggles and base their values off the current
    // getValue. This should only be executed on click.
    setRelated: function () {
      if (!this.options.related) return false;

      // If relatedRequire is set, it will be a radio, otherwise it will be a checkbox
      // radio cannot be unchecked, but checkbox will allow checking and unchecking so it needs to
      // consider the current value before doing anything else, i.e. checkbox should not set the property
      // to "true" if it's already checked.

      // If we toggle the other related widget's values, they will not be in sync with the database.
      // There are two situations that need to be handled uniquely:
      // 1. Each related widget needs to trigger a save for their new value.
      //      -This should trigger a save for the collection if it's a collection (not supported in the
      //          API at the moment), otherwise it will need to manually cycle through and save each entity.
      // 2. The entity has a listener that updates the other entities when some value is changed.
      //      -This happens in view.routing.main and causes the database to be out of sync with the
      //          Stratus model on the page. So in this situation we need to do a sync and fetch the
      //          collection again so that it's in sync with the database. Set the this.options.sync
      //          value to true in order to trigger this scenario. Otherwise #1 above will be used.

      if (this.options.relatedSync) {
        // If there is a collection, AND (2) the entity is set to
        if (this.options.dataType === 'model' && _.has(this.model, 'collection')) {
          this.model.once('success', function () {
            this.model.collection.refresh();
          }.bind(this));
        }
      } else {
        // TODO: add ability to save collections (once API supports that) IF it's a collection

        // if the current element is on, all others should be off
        var relatedValue = this.options.relatedInverse ? this.getValueInverse() : this.getValue();

        // If it's a collection, we need to cycle through each model and change the value so that it
        // saves (the widget's scopeChanged method will update the DOM accordingly).
        if (this.options.dataType === 'model' && _.has(this.model, 'collection')) {
          _.each(this.model.collection.models, function (model) {
            // cannot use  model.has(this.propertyName) because the value may be NULL
            if (this.propertyName in model.attributes && model.get('id') !== this.model.get('id')) {
              model.set(this.propertyName, relatedValue);
            }
          }.bind(this));
        }
      }

    }

  });

}));
