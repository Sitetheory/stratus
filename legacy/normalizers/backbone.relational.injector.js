//     backbone.relational.injector.js 1.0

//     Copyright (c) 2015 by Sitetheory, All Rights Reserved
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

// Backbone Relational Definition
// ------------------------------

// This configured Backbone Relational for Stratus
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'backbone', 'backbone.relational.core'], factory)
  } else {
    factory(root.Stratus, root.Backbone)
  }
}(this, function (Stratus, Backbone) {
  // Backbone Relational Settings
  // ----------------------------

  // This is provides a Stratus scope for Dynamic Relations.
  Backbone.Relational.store.addModelScope(Stratus.Models.attributes)
  Backbone.Relational.store.addModelScope(Stratus.Collections.attributes)

  /*
   Backbone.Relational.store.addModelScope(Stratus.Collections.attributes);
   */

  // Backbone Relational Functions
  // -----------------------------

  // This function gathers data from a model within a model.
  // This should only occur when using Backbone Relations to
  // display data from parent or child objects.
  /**
   * @param model
   * @param scope
   * @param property
   * @returns {*}
   * @constructor
   */
  Stratus.Relations.Sanitize = function (model, scope, property) {
    var data = null
    if (typeof model.get(scope) !== 'undefined') {
      if (typeof model.get(scope) === 'object' && model.get(scope) !== null) {
        if (typeof model.get(scope).get(property) !== 'undefined') {
          if (model.get(scope).get(property).length === 0) {
            /* do nothing */
          } else if (model.get(scope).get(property).length === 1) {
            data = model.get(scope).get(property)[0]
          } else {
            data = model.get(scope).get(property)
          }
        }
      } else {
        data = model.get(scope)
      }
    }
    return data
  }
}))
