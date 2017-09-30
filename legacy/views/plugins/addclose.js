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

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'zepto', 'underscore', 'stratus.views.plugins.base'], factory);
  } else {
    factory(root.Stratus, root.$, root._);
  }
}(this, function (Stratus, $, _) {

  // AddClose
  // -------------

  // Simple adds a Close Button to the top of an Element
  Stratus.Views.Plugins.AddClose = Stratus.Views.Plugins.Base.extend({

    template: _.template('<button type="button" class="btnClose"><span class="sr-only">Toggle Navigation</span><svg viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs></defs><g id="close-{{ id }}" fill="none" transform="translate(1.000000, 2.000000)"><g id="closeX" transform="translate(16.271267, 15.687500)" stroke-linecap="square" stroke="#666"><g id="lineLeft"><path d="M1.63636364,0.5875 L16.3737342,16.4608762"></path></g><g id="lineRight"><path d="M15.8181818,0.5875 L1.08081124,16.4608762"></path></g></g><circle class="oval" stroke="#555" cx="24.7258128" cy="24" r="24"></circle></g></svg></button>'),

    /**
     * @param options
     * @returns {boolean}
     */
    initialize: function (options) {
      this.prepare(options);
      this.render();
      return true;
    },

    /**
     * @returns {boolean}
     */
    render: function () {
      this.$el.prepend(this.template({ id: this.$el.attr('id') }));
      return true;
    }
  });

}));
