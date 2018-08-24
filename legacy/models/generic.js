//     Stratus.Models.Generic.js 1.0

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
    define(['stratus', 'underscore', 'backbone', 'zepto', 'backbone.relational'], factory)
  } else {
    factory(root.Stratus, root._, root.Backbone, root.$)
  }
}(this, function (Stratus, _, Backbone, $) {
  // Generic Model
  // -------------

  // This Backbone Model is reflective of a Generic entity.
  // Stratus.Prototypes.Models.Generic = Backbone.RelationalModel.extend({
  Stratus.Models.Generic = Backbone.RelationalModel.extend({

    // API Queries
    meta: Stratus.Prototypes.Model,

    // Settings
    _isVersioned: false,
    _autoSave: false,
    autoSaveInterval: '1.5s',
    saveJob: null,

    // State Registers
    initialized: false,
    registered: false,
    _isEvaluated: false,
    _isHydrated: false,
    _saving: false,

    // Constructor
    // -----------
    /**
     * @param attributes
     * @param options
     * @returns {boolean}
     */
    initialize: function (attributes, options) {
      /*
      this.autoSaveViews = {};
      this.autoSaveInitiated = null;
      this.autoSaveChangeSet = {};
      this.autoSaveTimeChanged = 0;
      this.autoSaveInit = false;
      */

      /*
       TODO: handle the rest!

       Options
       data-pipeline=message|redirect
       data-messageSuccess
       data-messageError
       data-redirectSuccess
       data-redirectError

       Then on success, clear out the contents of the <div data-entity> and add the message, and ad class=“messageSuccess” and data-id=“{id}"
       */

      // Handle Collections & Meta
      this.meta = new Stratus.Prototypes.Model()
      if (_.has(this, 'collection') && _.has(this.collection, 'api') && this.collection.api) {
        this.meta.set(this.collection.api)
      }

      // Event Registration
      this.primeRegister()
      return true
    },

    /**
     * @returns {boolean}
     */
    primeRegister: function () {
      this.registered = this.registered || this.onRegister()
      return true
    },

    /**
     * @returns {boolean}
     */
    onRegister: function () {
      this.on('change', this.primeEvaluation, this)
      this.on('save', this.onSave, this)
      this.on('refresh', this.refresh, this)
      this.saveJob = Stratus.Chronos.add(1.5, this.saveInterval, this)
      return true
    },

    /**
     * @returns {boolean}
     */
    saveInterval: function () {
      if (!this._saving && !this._changing && this.isHydrated() && !this.isNew() && _.size(this.patch)) {
        this.trigger('save', this.patch)
      }
      return true
    },

    /**
     * @param patch
     * @returns {*|boolean}
     */
    onSave: function (patch) {
      this._saving = true
      return this.save()
    },

    /**
     * @returns {boolean}
     */
    primeEvaluation: function () {
      this._isEvaluated = this._isEvaluated || this.evaluate()
      return this._isEvaluated
    },

    /**
     * @returns {boolean}
     */
    evaluate: function () {
      if (!this.isHydrated()) return false
      this.patch = {}
      return true
    },

    /**
     * @param options
     * @returns {boolean}
     */
    safeInitialize: function (options) {
      // FIXME: Move the url / success on manifest all in this portion

      // Ensure we only run this function once
      if (this.initialized) return true
      this.initialized = true

      // Store Core Settings if Necessary
      this.entity = options.entity
      this.target = options.target
      this.versionEntity = options.versionEntity
      this.versionRouter = options.versionRouter
      this.versionId = options.versionId

      // Store Internal Version Information
      this._isVersioned = (this.versionEntity && this.versionRouter)
      this._isEvaluated = false

      // Set API Options
      if (options.api) {
        _.each(options.api, function (value, key) {
          this.meta.set(key, value)
        }, this)
      }

      // Create Version Router
      if (this.isVersioned()) {
        require(['stratus', 'stratus.routers.version'], function (Stratus) {
          Stratus.Instances[_.uniqueId('router.version_')] = new Stratus.Routers.Version({ model: this })
        }.bind(this))
      }

      // Fetch from API or Save for Manifestation
      if (options.manifest && this.isNew()) {
        this.save()
      } else {
        this.trigger('refresh')
      }

      // Enable Chronos AutoSave Feature
      this._autoSave = options.autoSave
      if (this._autoSave) {
        this.autoSave(this._autoSave)
      }

      return true
    },

    /**
     * @param toggle
     * @returns {*}
     */
    autoSave: function (toggle) {
      return Stratus.Chronos.toggle(this.saveJob, toggle)
    },

    // refresh()
    // --------
    /**
     * @returns {boolean}
     */
    refresh: function () {
      if (!this.isVersioned() || this.isEvaluated()) {
        this.fetch((this.meta.size() > 0) ? { data: this.meta.toObject() } : {})
      }
      return true
    },

    // urlRoot()
    // --------
    /**
     * @returns {*}
     */
    urlRoot: function () {
      var apiPath = '/Api'
      apiPath += (this.versionEntity && this.versionId) ? '/' + _.ucfirst(this.versionEntity) + '/' + this.versionId : ''
      return (typeof this.collection !== 'undefined') ? this.collection.url : apiPath + '/' + _.ucfirst(this.entity)
    },

    // toObject()
    // --------
    /**
     * @returns {*}
     */
    toObject: function () {
      return _.clone(this.attributes)
    },

    // toJSON()
    // ---------
    /**
     * @param options
     * @returns {*}
     */
    toJSON: function (options) {
      var attributes = (this.meta.size() > 0) ? {
        meta: this.meta.toJSON(),
        payload: Backbone.RelationalModel.prototype.toJSON.call(this, options)
      } : Backbone.RelationalModel.prototype.toJSON.call(this, options)
      if (this.meta.size() > 0) {
        this.meta.clearTemp()
      }
      return attributes
    },

    // isVersioned()
    // --------
    // Check if the model is a version-enabled entity.
    /**
     * @returns {boolean|*}
     */
    isVersioned: function () {
      return (typeof this._isVersioned !== 'undefined') ? this._isVersioned : false
    },

    // isEvaluated()
    // --------
    // Check if the model is a version-enabled entity.
    /**
     * @returns {boolean|*}
     */
    isEvaluated: function () {
      return (typeof this._isEvaluated !== 'undefined') ? this._isEvaluated : false
    },

    // isHydrated()
    // --------
    // Check if the model has been hydrated.
    /**
     * @returns {boolean|*}
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

    // parse()
    // --------
    /**
     * @param resp
     * @param options
     * @returns {*}
     */
    parse: function (resp, options) {
      this._isHydrated = true
      this._saving = false
      if (typeof resp === 'object' && _.has(resp, 'payload')) {
        /* $('[data-entity="' + resp.route.controller + '"][data-id="' + resp.payload.id + '"]').attr('data-status', resp.meta.status[0].code); */

        // FIXME: @Disabled! This is still a rough draft from generic collection functions and will need to be updated when more necessary
        // Add Relations
        if (_.has(resp.meta, 'relations') && false) {
          /* Hydrate Backbone Relations */
          if (typeof resp.meta.relations === 'object') {
            _.each(resp.meta.relations, this.hydrateRelations, Backbone)
          }
          /* Hydrate Undefined Relations */
          if (typeof resp.meta.relations === 'object') {
            _.each(resp.meta.relations, this.hydrateTypes, this)
          }
          this.relations = resp.meta.relations

          // FIXME: This has problems with initializing relations multiple times
          _.each(this.relations, function (relation) {
            Backbone.Relational.store.initializeRelation(this, relation, options)
            /*
             if (_.has(relation, 'reverseRelation')) Backbone.Relational.store.initializeRelation(this, relation, options);
             */
          }, this)
        }
        if (this.attributes && this.versionEntity && _.has(resp.payload[this.versionEntity], 'id')) {
          if (this.versionId !== resp.payload[this.versionEntity].id) {
            /*
             this.set({ versionId: resp.payload[this.versionEntity].id });
             */
          }
        }

        var status = _.first(resp.meta.status)
        if (status.code !== 'SUCCESS') {
          // TODO: Add Validation Messages
          Stratus.Events.trigger('toast', new Stratus.Prototypes.Toast({
            title: status.code,
            message: status.message,
            class: 'danger'
          }))
          if (!Stratus.Environment.get('production')) console.trace('Error:', resp)
          this.trigger('error', this, options)
        } else {
          if (!Stratus.Environment.get('production')) console.info('Success:', resp)
          this.trigger('success', this, options)
        }

        return resp.payload
      } else {
        if (this.attributes && this.versionEntity && _.has(resp[this.versionEntity], 'id')) {
          if (this.versionId !== resp[this.versionEntity].id) {
            // this.set({ versionId: resp[this.versionEntity].id });
          }
        }
        return resp
      }
    },

    /**
     * @param key
     * @param val
     * @param options
     * @returns {boolean}
     */
    save: function (key, val, options) {
      // Twiddle Options
      var attrs
      if (key === null || typeof key === 'object') {
        attrs = key
        options = val
      } else {
        (attrs = {})[key] = val
      }

      // Stop Unchanged Models from hitting the API
      if (!this.isNew() && !_.size(attrs) && !_.size(this.patch)) return false

      // FIXME: This is getting patches that are objects and dot notation, and we need to think of a way to handle both.
      // Patch models that aren't new
      if (!this.isNew() && false) {
        // Set all changes before patching
        if (_.size(attrs)) this.set(attrs)

        // TODO: Allow Auto-Patching on an Interval, which will require an 'interactive' boolean value to be checked every time it patches, this way it can be halted while someone is typing

        // If nothing was actually changed on this save, discard the request
        /* if (!_.size(this.patch)) return false; */

        // Gather Data Points
        var current = this.toJSON()
        var payload = (_.has(current, 'payload')) ? current.payload : current

        // Delete Unchanged Attributes
        _.each(payload, function (val, key) {
          if (!_.has(this.patch, key)) delete payload[key]
        }, this)

        // Overwrite Options
        key = current
        val = { patch: true }
      }

      // Call
      return Backbone.Model.prototype.save.call(this, key, val, options)
    }

  })

  // Add prototype to Stratus.Models namespace model
  Stratus.Models.set('Generic', Stratus.Models.Generic)
}))
