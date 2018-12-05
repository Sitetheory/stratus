//     Stratus.Views.Plugins.AddClose.js 1.0

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

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'jquery', 'underscore', 'stratus.views.plugins.base'], factory)
  } else {
    factory(root.Stratus, root.$, root._)
  }
}(this, function (Stratus, $, _) {
  // AddClose
  // -------------

  // Simple adds a Close Button to the top of an Element
  Stratus.Views.Plugins.AddClose = Stratus.Views.Plugins.Base.extend({

    template: _.template('<button type="button" class="btn-close"><span class="sr-only">Toggle Navigation</span><md-icon md-svg-src="/Api/Resource?path=@SitetheoryCoreBundle:images/icons/actionButtons/close.svg" aria-hidden="true"></md-icon></button>'),

    /**
     * @param options
     * @returns {boolean}
     */
    initialize: function (options) {
      this.prepare(options)
      this.render()
      return true
    },

    /**
     * @returns {boolean}
     */
    render: function () {
      this.$el.prepend(this.template({ id: this.$el.attr('id') }))
      return true
    }
  })
}))
