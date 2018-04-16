//     Stratus.Routers.Generic.js 1.0

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
    define(['stratus', 'underscore', 'backbone'], factory)
  } else {
    factory(root.Stratus, root._, root.Backbone)
  }
}(this, function (Stratus, _, Backbone) {
  // Generic Router
  // -------------

  // TODO: This basically needs to handle every collection separately by use of
  // the stratus model and collection references provided by the loader and an
  // entity identifier to determine which to add the new one on
  Stratus.Routers.Generic = Backbone.Router.extend({
    routes: {
      'new/:entity': 'new',
      'filter/:entity': 'filter',
      'filter/:entity/:filter': 'filter',
      'page/:entity': 'paginate',
      'page/:entity/:page': 'paginate'
    },
    /**
     * @param options
     */
    initialize: function (options) {
      if (!Stratus.Environment.production) {
        console.info('Generic Router Invoked!')
      }
    },
    /**
     * @param bubble
     */
    change: function (bubble) {
      if (!Stratus.Environment.production) {
        console.log('Model(s):', arguments)
      }
    },
    /**
     * @param entity
     */
    new: function (entity) {
      if (!Stratus.Environment.production) {
        console.log('Route New:', arguments)
      }
      var collection = Stratus.Collections.get(_.ucfirst(entity))
      if (typeof collection === 'object') {
        this.navigate('#')
        collection.create(
          _.has(collection, 'prototype') ? collection.prototype : {},
          {wait: true})
      }
    },
    /**
     * @param entity
     * @param filter
     */
    filter: function (entity, filter) {
      if (filter === undefined) {
        filter = ''
      }
      var collection = Stratus.Collections.get(_.ucfirst(entity))
      if (typeof collection === 'object') {
        // Parse an array query
        if (filter.startsWith('[]')) {
          filter = filter.substring(2)
          filter = filter.split(',[]')
        }
        if (!Stratus.Environment.production) {
          console.info('Route Filter:', filter)
        }
        collection.meta.set('api.q', filter)
        if (collection.meta.has('api.p')) {
          collection.meta.set('api.p', 1)
        }
        collection.refresh({reset: true})
      }
    },
    /**
     * @param entity
     * @param page
     */
    paginate: function (entity, page) {
      if (page === undefined) {
        page = '1'
      }
      if (!Stratus.Environment.production) {
        console.log('Entity:', entity, 'Page:', page)
      }
      var collection = Stratus.Collections.get(_.ucfirst(entity))
      if (typeof collection === 'object') {
        if (collection.isHydrated()) {
          if (collection.meta.has('pageCurrent') &&
            collection.meta.get('pageCurrent') !== parseInt(page)) {
            if (collection.meta.get('pageTotal') >= parseInt(page) &&
              parseInt(page) >= 1) {
              collection.meta.set('api.p', page)
              collection.refresh({reset: true})
            } else {
              if (!Stratus.Environment.production) {
                console.log('Page', page, 'of entity', entity,
                  'does not exist.')
              }
            }
          }
        } else {
          collection.once('reset', function () {
            this.paginate(entity, page)
          }, this)
        }
      } else {
        Stratus.Collections.once('change:' + _.ucfirst(entity), function () {
          this.paginate(entity, page)
        }, this)
      }
    }
  })
}))
