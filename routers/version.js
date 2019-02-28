//     Stratus.Routers.Version.js 1.0

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
    define(['stratus', 'underscore', 'backbone'], factory)
  } else {
    factory(root.Stratus, root._, root.Backbone)
  }
}(this, function (Stratus, _, Backbone) {
  // Version Router
  // -------------

  // TODO: Move this into a Generic Model Router or possibly the Collection
  // Router
  Stratus.Routers.Version = Backbone.Router.extend({
    model: Stratus.Models.Generic,
    routes: {
      'version/:id': 'version'
    },
    initialize: function (options) {
      if (!_.has(options, 'model')) {
        console.error('A Model must be defined for a Version Router')
        return false
      }
      this.model = options.model
      this.modelId = this.model.get('id')
      this.versionEntityId = this.model.versionEntity + '.id'
      if (!this.model.isHydrated()) {
        this.model.once('success', function () {
          this.model.once('change', function () {
            this.register()
          }, this)
        }, this)
        Stratus.Events.once('finalized', function () {
          if (!this.model.isEvaluated()) {
            this.model._isEvaluated = true
            this.model.trigger('refresh')
          }
        }, this)
      } else {
        this.register()
      }
    },
    register: function () {
      this.model.on('change:' + this.model.versionEntity, this.change, this)
      this.change()
    },
    change: function () {
      if (Backbone.History.started) {
        if (this.model.has(this.versionEntityId) &&
          this.versionId !== this.model.get(this.versionEntityId)) {
          this.versionId = this.model.get(this.versionEntityId)
          if (!Stratus.Environment.get('production')) {
            console.info('Navigate:', 'version/' + this.versionId)
          }
          this.navigate('version/' + this.versionId, { replace: true })
        }
      } else {
        Stratus.Events.once('finalized', function () {
          this.change()
        }, this)
      }
    },
    version: function (id) {
      if (!this.model.isHydrated() ||
        (this.model.has(this.versionEntityId) && this.versionId !==
          parseInt(id))) {
        this.model.versionId = id
        this.model._isEvaluated = true
        this.model.trigger('refresh')
      }
    }
  })
}))
