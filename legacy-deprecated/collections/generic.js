// Generic Collection
// ------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'underscore', 'backbone', 'backbone.relational', 'stratus.models.generic'], factory)
  } else {
    factory(root.Stratus, root._, root.Backbone)
  }
}(this, function (Stratus, _, Backbone) {
  // Generic Collection
  // -------------

  // This Backbone Collection intends to handle Generic API routines.
  Stratus.Collections.Generic = Backbone.Collection.extend({

    // Backbone Targeting
    model: Stratus.Models.Generic,
    meta: Stratus.Prototypes.Model,
    url: '/Api',
    entity: 'Unknown',

    // Modular Timing
    _isHydrated: false,

    /**
     * @param options
     * @returns {boolean}
     */
    initialize: function (options) {
      if (!_.has(this, 'initialized')) {
        this.initialized = false
      }
      if (this.initialized) {
        return true
      }
      if (options && _.isObject(options) && options.initialize) {
        this.safeInitialize(options)
      }
    },

    /**
     * @param options
     * @returns {boolean}
     */
    safeInitialize: function (options) {
      // Ensure we only run this function once
      if (this.initialized) {
        return true
      } else {
        this.initialized = true
      }

      this.globals = new Stratus.Prototypes.Model()
      this.meta = new Stratus.Prototypes.Model()

      if (_.has(options, 'entity')) this.entity = options.entity
      if (_.has(options, 'target')) this.target = options.target

      if (_.has(options, 'api')) {
        this.meta.set('api', options.api)
        this.api = options.api
      }

      if (_.has(options, 'prototype')) {
        this.prototype = options.prototype
      }

      if (this.target) {
        if (_.has(this.target, 'entity')) this.target = [this.target]
        _.each(this.target, function (target) {
          if (target.entity && target.id) {
            this.url = this.url + '/' + _.ucfirst(target.entity) + '/' + target.id
          }
        }, this)
      }

      if (this.entity && this.entity !== 'Unknown') {
        this.url = this.url + '/' + this.entity
        this.globals.set('entity', this.entity)
      }

      this.globals.set('uid', _.uniqueId('collection_'))

      this.refresh({ reset: true })
    },

    /**
     * @returns {boolean}
     */
    isHydrated: function () {
      return (typeof this._isHydrated !== 'undefined') ? this._isHydrated : false
    },

    /**
     * This hydrates text to object, for instance 'Backbone.Many' to an actual Backbone.Many object.
     *
     * @param obj
     * @param iteration
     * @param list
     * @returns {*}
     */
    hydrateRelations: function (obj, iteration, list) {
      obj.type = this[obj.type]
      if (_.has(obj, 'reverseRelation') && _.has(obj.reverseRelation, 'type')) {
        obj.reverseRelation.type = this[obj.reverseRelation.type]
      }
      return obj.type
    },

    /**
     * @param obj
     * @param iteration
     * @param list
     * @returns {*}
     */
    hydrateType: function (obj, iteration, list) {
      var entity = null
      var scope = null

      if (_.has(obj, 'relatedModel')) {
        entity = obj.relatedModel
        scope = 'model'
      }
      if (_.has(obj, 'collectionType')) {
        entity = obj.collectionType
        scope = 'collection'
      }

      if (entity) {
        if (scope === 'model' && !Stratus.Models.has(entity)) {
          /* TODO: Make this work using the same function(s) we use in Stratus to create a model for the first time inside of a collection with its referential information */
          Stratus.Models.set(entity, Stratus.Models.Generic.extend({ entity: entity }))
        } else if (scope === 'collection' && !Stratus.Collections.has(entity)) {
          Stratus.Collections.set(entity, Stratus.Collections.Generic.extend({ entity: entity }))
        }
      }
    },

    /**
     * @param obj
     * @param iteration
     * @param list
     * @returns {*}
     */
    hydrateTypes: function (obj, iteration, list) {
      this.hydrateType(obj, iteration, list)
      if (_.has(obj, 'reverseRelation')) {
        this.hydrateType(obj.reverseRelation, iteration, list)
      }
    },

    /**
     * @param resp
     * @param options
     * @returns {*}
     */
    parse: function (resp, options) {
      /* Don't Pop the Bubble! */
      if (!_.has(resp, 'payload')) return resp

      /* Hydrate */
      this._isHydrated = true

      if (typeof this.globals.get('entity') !== 'undefined') {
        /* Hydrate Backbone Relations */
        if (typeof resp.meta.relations === 'object') {
          _.each(resp.meta.relations, this.hydrateRelations, Backbone)
        }

        /* Create Relational Object, if undefined */
        if (!Stratus.Models.has(this.globals.get('entity'))) {
          Stratus.Models.set(this.globals.get('entity'), (typeof resp.meta.relations === 'object') ? Stratus.Models.Generic.extend({ relations: resp.meta.relations }) : Stratus.Models.Generic.extend())
        }

        /* Hydrate Undefined Relations */
        if (typeof resp.meta.relations === 'object') {
          _.each(resp.meta.relations, this.hydrateTypes, this)
        }

        /* Store Pagination Data */
        var storeMeta = function (collection, data, key) {
          if (_.has(data, key)) {
            collection.set(key, data[key])
          }
        }
        storeMeta(this.meta, resp.meta, 'editUrl')
        storeMeta(this.meta, resp.meta, 'countCurrent')
        storeMeta(this.meta, resp.meta, 'countTotal')
        storeMeta(this.meta, resp.meta, 'pageCurrent')
        storeMeta(this.meta, resp.meta, 'pageTotal')
        storeMeta(this.meta, resp.meta, 'searchable')

        this.model = Stratus.Models.get(this.globals.get('entity'))
      }

      /* Trigger Events */
      var status = _.first(resp.meta.status)
      if (status.code !== 'SUCCESS' && status.code !== 'NOTFOUND') {
        Stratus.Events.trigger('toast', status.message, status.code, 'danger')
        if (!Stratus.Environment.get('production')) console.trace('Error:', resp)
        this.trigger('error', this, resp, options)
      } else {
        if (!Stratus.Environment.get('production')) console.info('Success:', resp)
        this.trigger('success', this, resp, options)
      }

      /* Return Response */
      return resp.payload
    },

    // Refresh the Data Set According to the API Data
    /**
     * @param options
     */
    refresh: function (options) {
      // TODO: Fetching needs to wait for a generic router evaluation to change a boolean value on Stratus.Environment before continuing with a fetch to ensure targets are set
      options = (options && typeof options === 'object') ? options : {}
      if (typeof (this.url) === 'string' && this.url.toLowerCase() !== '/Api'.toLowerCase()) {
        this.fetch(this.meta.has('api') ? _.extend(options, { data: this.meta.get('api') }) : options)
      } else if (this.models.length) {
        this._isHydrated = true
        _.each(this.models, function (model) {
          model._isHydrated = true
        })
        this.trigger('success', this, this.models, options)
        this.trigger('reset', this, options)
      }
    },

    /**
     * @param options
     */
    toJSON: function (options) {
      var attributes = []
      this.each(function (model) {
        var modelAttributes = model.toJSON()
        attributes.push(_.has(modelAttributes, 'payload') ? modelAttributes.payload : modelAttributes)
      })
      return (this.meta.size() > 0) ? {
        meta: this.meta.toJSON(),
        payload: _.clone(attributes)
      } : _.clone(attributes)
    },

    /**
     * Find highest parent available, as allowed by ceiling
     *
     * @param model
     * @param association
     * @param ceiling
     * @returns {*}
     */
    findParent: function (model, association, ceiling) {
      if (typeof ceiling !== 'undefined' && model.get(association) && model.get(association).get('id') === ceiling) return model
      return (!model.get(association)) ? model : this.findParent(model.get(association), association, ceiling)
    },

    /**
     * @param model
     * @param association
     * @param breadcrumbs
     * @returns {*}
     */
    findParents: function (model, association, breadcrumbs) {
      if (typeof breadcrumbs === 'undefined') breadcrumbs = []
      if (model.has('id')) breadcrumbs.push(model.get('id'))
      return (!model.get(association)) ? breadcrumbs : this.findParents(model.get(association), association, breadcrumbs)
    },

    /**
     * @param model1
     * @param model2
     * @param prop
     * @param inverse
     * @param association
     * @returns {number}
     */
    compare: function (model1, model2, prop, inverse, association) {
      var weight = null
      var child = false
      var related = false

      var first = null
      var second = null

      var parent1 = null
      var parent2 = null
      var bestParent1 = null
      var bestParent2 = null

      var associative = (!_.isUndefined(association) && !_.isUndefined(model1.get(association)) && !_.isUndefined(model2.get(association)))

      if (associative) {
        first = model1.get(association)
        second = model2.get(association)
      }

      if (!first && !_.isUndefined(model1.get(prop))) first = model1
      if (!second && !_.isUndefined(model2.get(prop))) second = model2

      associative = (associative && first && second)

      if (associative) {
        // Check for Root Parent
        parent1 = (!model1.get(association))
        parent2 = (!model2.get(association))

        // Check for Root Parent-Child Relationship
        if (_.isEqual(first.toObject(), second.toObject())) {
          child = (parent1 || parent2)
        } else {
          // Check for Nested Parent
          if (!parent1 && !parent2) {
            parent1 = _.isEqual(model1.toObject(), model2.get(association).toObject())
            parent2 = _.isEqual(model2.toObject(), model1.get(association).toObject())
            child = (parent1 || parent2)
          }
        }

        // Check for Relations
        if (!child) {
          if (!parent1 && !parent2) {
            related = _.isEqual(model1.get(association).toObject(), model2.get(association).toObject())
          }
          if (!related) {
            // Find Root Parents
            bestParent1 = this.findParent(model1, association)
            bestParent2 = this.findParent(model2, association)

            // Check for Nested Relations
            related = _.isEqual(bestParent1.toObject(), bestParent2.toObject())

            // Find Equal Ground
            if (related) {
              var closestAncestor = _.first(_.intersection(this.findParents(model1, association), this.findParents(model2, association)))
              var closestAncestor1 = this.findParent(model1, association, closestAncestor)
              var closestAncestor2 = this.findParent(model2, association, closestAncestor)
              if (!(_.isEqual(closestAncestor1.toObject(), bestParent2.toObject()) || _.isEqual(bestParent1.toObject(), closestAncestor2.toObject()))) {
                bestParent1 = closestAncestor1
                bestParent2 = closestAncestor2
              }
            }

            // Set Parents for Normal Comparison
            first = bestParent1
            second = bestParent2
          }
        }
      }

      /* Get Property or Mark Child */
      if (!child) {
        first = (first) ? first.get(prop) : 0
        second = (second) ? second.get(prop) : 0
      } else {
        first = (parent1) ? 1 : 0
        second = (parent2) ? 1 : 0
      }

      /* Compare Properties */
      if (first > second) weight = 1
      else if (first < second) weight = -1

      return (weight && inverse) ? -weight : weight
    },

    /**
     * @param model1
     * @param model2
     * @returns {*}
     */
    comparator: function (model1, model2) {
      var weight = null

      // if (!weight) weight = this.compare(model1, model2, "level");
      if (!weight) {
        weight = this.compare(model1, model2, 'priority', true, 'parent')
      }
      if (!weight) {
        weight = this.compare(model1, model2, 'priority', true)
      }
      if (!weight) {
        weight = 0
      }

      return weight
    },
    save: function () {
      console.warn('Saving collections is not fully implemented.')
      this.sync('update', this, { url: this.url })
    },
    saveOne: function (model) {
      model.save()
    },
    saveAll: function () {
      this.models.each(this.saveOne, this)
    }
  })
}))
