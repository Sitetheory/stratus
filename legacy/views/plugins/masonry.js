//     Stratus.Views.Plugins.Masonry.js 1.0

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

// Data Attributes to Control Options
// ----------------------------------
// The options below are the standard Bootstrap masonry options. If you need to manipulate the widget, you can set data attributes to change the default values.

/*
data-content: this is the text that shows up in the masonry.

data-target: This is used instead of the data-content, and is the CSS selector for another element that contains the content of the masonry. This is used if you need a more complicated content (HTML) inside the masonry. This is

data-delay: if you need to set an alternative delay, you can pass in a JSON string to control the delay, e.g. {"show": 50, "hide": 400}.

data-placement: The location of the masonry, e.g. "auto top", "right", "bottom" "left"
 */

// Function Factory
// ----------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'zepto', 'underscore', 'masonry', 'stratus.views.plugins.base'], factory);
  } else {
    factory(root.Stratus, root.$, root._, root.Masonry);
  }
}(this, function (Stratus, $, _, Masonry) {

  // Masonry
  // -------------

  // The Masonry view is very simple and extends the Backbone View (not the base view like many other widgets)
  Stratus.Views.Plugins.Masonry = Stratus.Views.Plugins.Base.extend({
    initialize: function (options) {
      this.prepare(options);
      this.render();
    },
    render: function () {
      new Masonry(this.el, {
        /*
        // set itemSelector so .grid-sizer is not used in layout
        itemSelector: '.grid-item',
        // use element for option
        columnWidth: '.grid-sizer',
        percentPosition: true
        */
      });
    }
  });

}));
