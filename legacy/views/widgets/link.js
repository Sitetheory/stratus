//     Stratus.Views.Link.js 1.0

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
// Link allows us to add a dynamic variable to a link based on the model data (or Stratus.Environment if there is no model). This should be put on a <a> tag.

// Examples
// ========

/*
 <a href="http://domain.com/" data-type="link" data-property="routing[0].url" data-urlvars="?mode=preview" data-texton="Preview" data-textoff="" data-iconPath="@SitetheoryCoreBundle/Resources/public/images/icons/actionButtons/preview.svg"></a>
 */

// Data Attributes to Control Options
// ----------------------------------
// If you need to manipulate the widget, you can set data attributes to change the default values. See the options in this.options below to know which attributes can be modified from the data attributes.

// TODO: this needs a much more sophisticated way to manipulate the url, and create customizable urls with multiple properties

// Widget
// ======

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'jquery', 'underscore', 'stratus.views.widgets.base'], factory);
  } else {
    factory(root.Stratus, root.$, root._);
  }
}(this, function (Stratus, $, _) {

  // Link Widget
  // -------------

  // Link View which extends base view.
  Stratus.Views.Widgets.Link = Stratus.Views.Widgets.Base.extend({

    // Properties
    model: Stratus.Models.Generic,
    template: _.template('{% if (options.icon) { %}{% if (options.gradient) { %}<div class="{{ options.gradient }}"></div>{% } %}<span id="{{ elementId }}" class="{{ options.classBtn }}">{{ options.icon }}</span>{% } %}{% if (options.textOn) { %}<span class="{{ options.classOn}}">{{ options.textOn }}</span>{% } %}{% if (options.textOff) { %}<span class="{{ options.classOff}}">{{ options.textOff }}</span>{% } %}'),

    // Standard Options for View
    options: {
      private: {
        // A toggle will automatically save on click
        autoSave: false,

        // This saves whether this toggle is bound to a model or a variable (within Stratus.Environment), e.g. model|var
        dataType: null
      },
      public: {
        editable: false,

        // enter the CSS class of a gradient class to make a div appear above the SVG for styling
        gradient: false,

        // set to NULL to use default icon, FALSE to hide button, or set to HTML (e.g. an SVG) if you want a custom icon.
        icon: null,

        // set to null if you don't want an icon
        iconPath: '@SitetheoryCoreBundle:images/icons/actionButtons/preview.svg',

        // set to empty if you do not want text buttons
        textOn: 'Hide',
        textOff: 'Show',
        classBtn: 'btnIcon',
        classOn: 'btnText smallLabel textOn',
        classOff: 'btnText smallLabel textOff',

        // variables to add to the end of the string
        urlVars: null,

        // Set to true if you want to replace the current URL, or false if you want to just append to the current URL
        replaceUrl: false
      }
    },
    originalUrl: null,

    // promise()
    // -------------
    // Begin initializing the widget within an asynchronous promise realm
    /**
     * @param options
     * @param resolve
     * @param reject
     */
    promise: function (options, resolve, reject) {
      this.originalUrl = this.$el.attr('href');

      if (this.options.iconPath) {
        Stratus.Internals.Resource(this.options.iconPath, this.element).then(function (icon) {
          // get the resource text and set as the icon
          this.options.icon = icon;
          this.initializeSetup();
          resolve(this);
        }.bind(this));
      } else {
        this.initializeSetup();
        resolve(this);
      }
    },

    // initializeSetup()
    // -----------------
    // Use the same initialize method whether there is an icon or not
    /**
     * @returns {boolean}
     */
    initializeSetup: function () {
      if (this.options.dataType === 'var' && !Stratus.Environment.has(this.propertyName)) {
        Stratus.Environment.set(this.propertyName, this.options.valueOff);
      }
      this.render();
      return true;

    },

    // onRender()
    // ----------------
    // After the template renders, get the value and update the DOM. Use the same method for both model bound
    // objects and simple variable toggles, since all it does is gets the value and updates the class
    /**
     * @param entries
     */
    onRender: function (entries) {

      // Register Events
      // Set Values on DOM first time, and every time the model changes (if there is a model)
      if (this.options.dataType === 'model') {
        this.model.on('change', this.scopeChanged, this);
      }
      this.scopeChanged();

      // set events after model is rendered
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
      return true;
    },

    // scopeChanged()
    // -------------
    // If this entity is changed anywhere, check the status and update the DOM.
    /**
     * @returns {boolean}
     */
    scopeChanged: function () {
      this.$el.attr('href', ((this.options.replaceUrl) ? '' : this.originalUrl) + this.getPropertyValue() + this.options.urlVars);
      return true;
    }

  });

  // Require.js
  // -------------

  // We are not returning this module because it should be
  // able to add its objects to the Stratus object reference,
  // passed by sharing.

}));
