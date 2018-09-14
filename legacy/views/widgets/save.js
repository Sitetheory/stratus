//     Stratus.Views.Save.js 1.0

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

// Require.js
// -------------

// Examples
// =========

/*
 <div data-type="save" data-status="load"></div>
 */

// Data Attributes to Control Options
// ----------------------------------
// If you need to manipulate the widget, you can set data attributes to change the default values. See the options in this.options below to know which attributes can be modified from the data attributes.

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

  // Save Widget
  // -----------

  // Save view that extends the view base.
  Stratus.Views.Widgets.Save = Stratus.Views.Widgets.Base.extend({

    template: _.template('{% if (options.icon) { %}{% if (options.gradient) { %}<div class="{{ options.gradient }}"></div>{% } %}<span id="{{ elementId }}" class="{{ options.classBtn }}">{{ options.icon }}</span>{% } %}{% if (options.textOn || options.textOff) { %}<span class="{{ options.classOn}}">{{ options.textOn }}</span><span class="{{ options.classOff}}">{{ options.textOff }}</span>{% } %}'),
    events: {
      click: 'saveNowAction'
    },
    options: {
      private: {
        forceType: 'model'
      },
      public: {
        editable: false,

        // Allow specifying special save actions, e.g. 'version', 'duplicate'
        action: null,

        // TODO: point to the cloud server (PATH!)
        // cssFile: Stratus.BaseUrl + Stratus.BundlePath + 'views/widgets/save.css',
        iconPath: '@SitetheoryCoreBundle:images/icons/actionButtons/save.svg',

        // The text for the save button that appears when it's unsaved.
        gradient: null,
        textOff: 'Save',

        // The text for the information that appears after the model is successful saved (in sync with the model), e.g. no value by default, since we use a check mark in the class.
        textOn: '',
        classBtn: 'btnIcon',

        // The CSS class that is on the element that shows up when the model is changed (unsaved).
        classOff: 'btnText smallLabel textOff',

        // The CSS class that is on the element that shows up when the model is saved.
        classOn: 'btnText smallLabel textOn glyphicon glyphicon-ok success'
      }
    },

    originalId: null,
    _prevState: null,

    // promise()
    // ---------

    // Begin initializing the widget within an asynchronous promise realm
    /**
     * @param options
     * @param resolve
     * @param reject
     */
    promise: function (options, resolve, reject) {
      if (this.options.iconPath) {
        Stratus.Internals.Resource(this.options.iconPath, this.element).then(function (icon) {
          // get the resource text and set as the icon
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
      if (this.model && typeof this.model === 'object') {
        this.originalId = this.model.get('id');
      }
    },

    // onRender()
    // ----------

    // Additional actions after rendering
    /**
     * @param entries
     */
    onRender: function (entries) {
      // If there is a special action, add css to differentiate this from the standard save button
      if (this.options.action) {
        this.$el.addClass('action' + _.ucfirst(this.options.action));
      }
      this.scopeChanged();
    },

    /**
     * @returns {boolean}
     */
    onRegister: function () {
      $(window).bind('keydown', function (event) {
        this.saveKey(event);
      }.bind(this));
      this.model.on('save', this.onSave, this);
      return Stratus.Views.Widgets.Base.prototype.onRegister.call(this);
    },

    // saveAction()
    // ------------

    // When the button is clicked save the model.
    /**
     * @returns {boolean}
     */
    saveNowAction: function (options) {
      // Pass in other options
      // Get Special Actions
      if (this.options.action === 'version') {
        this.model.meta.temp('apiSpecialAction', 'iterateVersion');
        this.model.set('timeEdit', 'API::NOW');
      } else if (this.options.action === 'duplicate') {
        this.model.meta.temp('apiSpecialAction', 'duplicate');
        this.model.set('timeEdit', 'API::NOW');
      }

      if (_.size(this.model.patch)) {
        this.model.trigger('save');
      }

      // check the model for changes and update the DOM classes, just in case a save doesn't trigger a change event
      // so we can make sure the button stays in sync with the model changes
      this.scopeChanged();
      return true;
    },

    // scopeChanged()
    // --------------

    // If this entity model is changed anywhere, update the DOM.
    /**
     * @returns {boolean}
     */
    scopeChanged: function () {
      // If the model was duplicated then we need to redirect to the new URL
      // If the current page is accessed based on an ID (e.g. admin) modify that in the URL
      // Otherwise redirect to the new url
      // FIXME: Move this logic into the model!
      if (this.model.get('id') !== this.originalId) {
        var url = window.location.toString();
        var urlNew = url.replace(/id=[0-9]+/, 'id=' + this.model.get('id'));

        // If there was no ID, find the URL of the new page
        if (urlNew === url) {
          urlNew = (this.originalId === null) ? Stratus.Internals.SetUrlParams({ id: this.model.get('id') }) : this.model.get('routingPrimary.url');
        }
        if (urlNew) window.location.replace(urlNew);
      }

      // Confirm if the "change" is from a full API change (will have id) or from a user change
      // timeEdit will only be in the change set when it fetches the full model from the API
      // this.primeChanges(!_.size(this.model.patch));
      this.primeChanges((!_.size(this.model.patch) || this.model.hasChanged('timeStatus') || (this.model.hasChanged('timeEdit') && this.model.get('timEdit') !== 'API::NOW')));
    },

    /**
     * @param state
     */
    primeChanges: function (state) {
      if (!this._stateChanging && this._prevState !== state) {
        this._stateChanging = !state;
        this.$el.toggleClass('on', state);
        this.$el.toggleClass('off', !state);
      }
    },

    /**
     * @param patch
     */
    onSave: function (patch) {
      this.model.once('success', function () {
        this.model.once('change', function () {
          this._stateChanging = false;
          this.scopeChanged();
        }, this);
      }, this);
    },

    // keyActions()
    // --------
    // Register standard key actions like command|ctrl + "s" for saving.
    /**
     * @param event
     * @returns {boolean}
     */
    saveKey: function (event) {
      if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
          case 's':
            event.preventDefault();
            this.saveNowAction({});
            break;
        }
      }
      return true;
    }

  });

}));
