//     Stratus.Views.Upload.js 1.0
//
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
    define(['stratus', 'jquery', 'underscore', 'text!templates-upload', 'stratus.views.widgets.base', 'dropzone'], factory);
  } else {
    factory(root.Stratus, root.$, root._, root.Template);
  }
}(this, function (Stratus, $, _, Template) {

  // Upload Widget
  // -------------

  // This is the base view for all text widgets, which extends the base view.
  Stratus.Views.Widgets.Upload = Stratus.Views.Widgets.Base.extend({

    // Properties
    model: Stratus.Models.Generic,

    // The template MUST add the id = elementId
    template: _.template(Template || ''),

    // Standard Options for View
    options: {
      private: {
        dropzone: {
          url: 'https://app.sitetheory.io:3000/?session={{ session }}',
          method: 'POST',
          parallelUploads: 5,
          clickable: true,
          maxFiles: null
        }
      },
      public: {
        editable: false
      }
    },

    /**
     * @param entries
     * @returns {boolean}
     */
    onRender: function (entries) {
      var hydrate = _.template(this.options.dropzone.url);
      this.options.dropzone.url = hydrate({ session: _.cookie('SITETHEORY') });
      this.$el.dropzone(this.options.dropzone);
      return true;
    }

  });

}));
