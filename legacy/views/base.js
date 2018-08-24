//     Stratus.Views.Base.js 1.0

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
    define(['stratus', 'zepto', 'underscore', 'backbone'], factory)
  } else {
    factory(root.Stratus, root.$, root._, root.Backbone)
  }
}(this, function (Stratus, $, _, Backbone) {
  // View Base
  // -------------

  // This Backbone View intends to handle Generic rendering for a single plugin or widget.
  Stratus.Views.Base = Backbone.View.extend({

    /**
     * @param options
     * @returns {boolean}
     */
    initialize: function (options) {
      return true
    }

  })

  // Require.js
  // -------------

  // We are not returning this module because it should be
  // able to add its objects to the Stratus object reference,
  // passed by sharing.
}))
