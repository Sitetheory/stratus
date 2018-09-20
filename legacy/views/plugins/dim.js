//     Stratus.Views.Plugins.Dim.js 1.0

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
    define(['stratus', 'jquery', 'underscore', 'stratus.views.plugins.base'], factory);
  } else {
    factory(root.Stratus, root.$, root._);
  }
}(this, function (Stratus, $, _) {

  // Dim
  // -------------

  // Add a dim class to the body so that the body can be styled to be black background and the
  // app can be styled to be opacity .2 (as defined in the site CSS)
  Stratus.Views.Plugins.Dim = Stratus.Views.Plugins.Base.extend({
    events: {
      click: 'toggle'
    },
    initialize: function (options) {
      this.prepare(options);
    },
    toggle: function (event) {
      $('body').toggleClass('dim');
    }
  });

}));
