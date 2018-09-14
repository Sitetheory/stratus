//     Stratus.Views.Widgets.Generic.js 1.0

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

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'jquery', 'underscore', 'tether', 'stratus.views.widgets.base'], factory);
  } else {
    factory(root.Stratus, root.$, root._, root.Tether);
  }
}(this, function (Stratus, $, _, Tether) {

  // Generic Model View
  // -------------

  // NOTE: This ideology only works because dialogues don't have a stagnant DOM element, and instead can actually tether to anything on a particular page
  // TODO: I need each dialogue instance to be able to maintain itself by a particular template, which we can then use to 'thin the herd' of dialogue widgets
  // TODO: After the instances are more generalized, we can maintain various data sources, so that a particular widget can attach to any particular source

  // This Backbone View intends to handle Generic rendering for a single Model.
  Stratus.Views.Widgets.Dialogue = Stratus.Views.Widgets.Base.extend({

    template: _.template('{{ model.id }}'),
    el: function () {
      return '[data-collection="' + this.collection.globals.get('uid') + '"][data-entity="' + this.model.collection.globals.get('entity') + '"][data-id="' + this.model.get('id') + '"][data-dialogue="true"]';
    },
    events: {
      click: 'open',
      dblclick: 'open'
    },

    timestamp: Date.now(),
    templateRender: 'dialogue',
    tether: null,

    /**
     * @param options
     */
    preOptions: function (options) {
      this.globals = options.globals || {};
      this.widget = options.widget || null;
    },

    /**
     * @param entries
     * @returns {Stratus.Views.Widgets.Dialogue}
     */
    onRender: function (entries) {
      if (this.widget) {
        this.widget.initializer.then(function () {
          this.primeTether();
        }.bind(this));
      }
      return this;
    },

    primeTether: function () {
      if (this.widget.$el.length) {
        this.tether = new Tether({
          element: this.$el.selector,
          target: this.widget.$el.selector,
          attachment: 'top left',
          targetAttachment: 'top right'

          // offset: '0 10px'
          // constraints: [{to: 'window',pin: true}]
        });
      } else {
        // console.info('dialogue parent didn\'t render:', this.widget);
      }
    },

    refresh: function () {
      this.primeTether();
    },

    /**
     * @returns {boolean}
     */
    onRegister: function () {
      $(document).click(function (event) {
        if (this.$el.notClicked(event) && this.widget.$el.notClicked(event)) {
          this.close();
        }
      }.bind(this));
      return true;
    },

    /**
     * @returns {*}
     */
    open: function () {
      return this.$el.addClass('initializeDialogue');
    },

    /**
     * @returns {*}
     */
    close: function () {
      return this.$el.removeClass('initializeDialogue');
    }

  });

}));
