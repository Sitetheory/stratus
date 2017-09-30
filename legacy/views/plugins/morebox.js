//     Stratus.Views.Plugins.MoreBox.js 1.0

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
    define(['stratus', 'zepto', 'underscore', 'stratus.views.plugins.base', 'stratus.views.plugins.addclass'], factory);
  } else {
    factory(root.Stratus, root.$, root._);
  }
}(this, function (Stratus, $, _) {

  // MoreBox
  // -------------

  // A consistent way to reuse the AddClass plugin to add a moreBox that pops up when you interact with
  // a button.
  Stratus.Views.Plugins.MoreBox = Stratus.Views.Plugins.Base.extend({

    // Custom Actions for View
    initialize: function (options) {
      // Add Default Plugin Values
      // Use the element's ID as the default base for the moreBox target.
      if (!this.$el.attr('data-target')) {
        this.$el.attr('data-target', '#' + this.$el.attr('id') + '-moreBox');
      }
      if (!this.$el.attr('data-event')) {
        this.$el.attr('data-event', 'click');
      }
      if (!this.$el.attr('data-class')) {
        this.$el.attr('data-class', 'show');
      }
      this.$el.attr('data-classremove', 'hidden');

      // Add Default Classes
      var $moreBox = $(this.$el.data('target'));
      $moreBox.addClass('moreBox');
      $moreBox.attr('aria-labelledby', this.$el.attr('id'));

      // Utilize Standard AddClass Plugin
      new Stratus.Views.Plugins.AddClass({ el: this.el });
    }

  });

}));
