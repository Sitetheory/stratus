//     Stratus.Views.Plugins.AddClass.js 1.0

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

// Examples
// ========

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'jquery', 'underscore', 'stratus.views.plugins.base'], factory);
  } else {
    factory(root.Stratus, root.$, root._);
  }
}(this, function (Stratus, $, _) {

  // AddClass
  // -------------

  // This plugin adds a class to any element based on events
  Stratus.Views.Plugins.AddClass = Stratus.Views.Plugins.Base.extend({

    // Custom Actions for View
    initialize: function (options) {

      this.prepare(options);

      this.target = this.$el.data('target') ? $(this.$el.data('target')) : this.$el;
      this.targetInit = this.$el.data('targetinit') ? $(this.$el.data('targetinit')) : this.target;
      this.cssClass = this.$el.data('class') ? this.$el.data('class') : 'active';
      this.cssClassInit = this.$el.data('classinit') ? this.$el.data('classinit') : 'initialized';
      this.cssClassInitUnique = this.cssClassInit + '-' +this.cssClass;
      this.cssClassRemove = this.$el.data('classremove') ? this.$el.data('classremove') : 'hidden';

      // event can be multiple listeners: hover, click
      var event = this.$el.data('event') ? this.$el.data('event').split(' ') : ['hover'];

      if (this.target) {
        if (_.contains(event, 'hover')) {
          this.$el.hover(
            function () {
              this.show.apply(this, arguments);
            }.bind(this),
            function () {
              this.hide.apply(this, arguments);
            }.bind(this)
          );
        }
        if (_.contains(event, 'click')) {
          this.$el.on('click', function () {
            this.toggle.apply(this, arguments);
          }.bind(this));
        }
      }
    },

    toggle: function () {
      // Add a class indicated it has been added once already
      this.$el.addClass(this.cssClassInit + ' ' + this.cssClassInitUnique);
      this.targetInit.addClass(this.cssClassInit + ' ' + this.cssClassInitUnique);
      this.targetInit.removeClass(this.cssClassRemove);
      this.$el.toggleClass('click');
      this.target.toggleClass('click ' + this.cssClass);
    },
    show: function () {
      this.targetInit.addClass(this.cssClassInit + ' ' + this.cssClassInitUnique);
      this.targetInit.removeClass(this.cssClassRemove);
      this.$el.addClass('hover ' + this.cssClassInit + ' ' + this.cssClassInitUnique);
      this.target.addClass('hover ' + this.cssClass);
    },
    hide: function () {
      this.$el.removeClass('hover');
      this.target.removeClass('hover ' + this.cssClass);
    }

  });

}));
