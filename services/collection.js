// Collection Service
// ------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'exports',
      'stratus',
      'lodash',
      'angular',
      'stratus.services.model',
      'angular-material' // Reliant for $mdToast
    ], factory)
  } else {
    factory(root.exports, root.Stratus, root._, root.angular, root.Model)
  }
}(this, function (exports, Stratus, _, angular, Model) {
  let $$http = function () {
    console.error('$$http not loaded:', arguments)
  }
  let $$mdToast = function () {
    console.error('$$mdToast not loaded:', arguments)
  }
  class Collection extends Stratus.Prototypes.EventManager {
    constructor (options) {
      super()
      this.name = 'Collection'

      // Environment
      this.target = null
      this.direct = false
      this.infinite = false
      this.threshold = 0.5
      this.qualifier = '' // ng-if
      this.decay = 0
      this.urlRoot = '/Api'

      if (options && typeof options === 'object') {
        angular.extend(this, options)
      }

      // Infrastructure
      this.header = new Stratus.Prototypes.Model()
      this.meta = new Stratus.Prototypes.Model()
      this.model = Model
      this.models = []
      this.types = []

      // Internals
      this.pending = false
      this.error = false
      this.completed = false

      // Action Flags
      this.filtering = false
      this.paginate = false

      // Generate URL
      if (this.target) {
        this.urlRoot += '/' + _.ucfirst(this.target)
      }

      // Scope Binding
      this.serialize = this.serialize.bind(this)
      this.url = this.url.bind(this)
      this.inject = this.inject.bind(this)
      this.sync = this.sync.bind(this)
      this.fetch = this.fetch.bind(this)
      this.filter = this.filter.bind(this)
      this.throttleFilter = this.throttleFilter.bind(this)
      this.page = this.page.bind(this)
      this.toJSON = this.toJSON.bind(this)
      this.add = this.add.bind(this)
      this.remove = this.remove.bind(this)
      this.find = this.find.bind(this)
      this.pluck = this.pluck.bind(this)
      this.exists = this.exists.bind(this)

      /**
       * @type {Function}
       */
      this.throttle = _.throttle(this.fetch, 1000)

      // Infinite Scrolling
      /* *
      this.infiniteModels = {
        numLoaded_: 0,
        toLoad_: 0,
        // Required.
        getItemAtIndex: function (index) {
          if (index > this.numLoaded_) {
            this.fetchMoreItems_(index)
            return null
          }
          return index
        },
        // Required.
        // For infinite scroll behavior, we always return a slightly higher
        // number than the previously loaded items.
        getLength: function () {
          return this.numLoaded_ + 5
        },
        fetchMoreItems_: function (index) {
          // For demo purposes, we simulate loading more items with a timed
          // promise. In real code, this function would likely contain an
          // $http request.
          if (this.toLoad_ < index) {
            this.toLoad_ += 20
            $timeout(angular.noop, 300).then(angular.bind(this, function () {
              this.numLoaded_ = this.toLoad_
            }))
          }
        }
      }
      /* */
    }

    /**
     * @param obj
     * @param chain
     * @returns {string}
     */
    serialize (obj, chain) {
      const that = this
      const str = []
      obj = obj || {}
      angular.forEach(obj, function (value, key) {
        if (angular.isObject(value)) {
          if (chain) {
            key = chain + '[' + key + ']'
          }
          str.push(that.serialize(value, key))
        } else {
          let encoded = ''
          if (chain) {
            encoded += chain + '['
          }
          encoded += key
          if (chain) {
            encoded += ']'
          }
          str.push(encoded + '=' + value)
        }
      })
      return str.join('&')
    }

    /**
     * @returns {*}
     */
    url () {
      const that = this
      return that.urlRoot + (that.targetSuffix || '')
    }

    /**
     * @param data
     * @param type
     */
    inject (data, type) {
      if (!_.isArray(data)) {
        return
      }
      const that = this
      if (that.types.indexOf(type) === -1) {
        that.types.push(type)
      }
      // TODO: Make this able to be flagged as direct entities
      data.forEach(function (target) {
        // TODO: Add references to the Catalog when creating these
        // models
        that.models.push(new Model({
          collection: that,
          type: type || null
        }, target))
      })
    }

    // TODO: Abstract this deeper
    /**
     * @param {String=} [action=GET] Define GET or POST
     * @param {Object=} data
     * @param {Object=} [options={}]
     * @returns {*}
     */
    sync (action, data, options) {
      const that = this

      // Internals
      that.pending = true
      that.completed = false

      return new Promise(function (resolve, reject) {
        action = action || 'GET'
        options = options || {}
        const prototype = {
          method: action,
          url: that.url(),
          headers: {}
        }
        if (angular.isDefined(data)) {
          if (action === 'GET') {
            if (angular.isObject(data) && Object.keys(data).length) {
              prototype.url += prototype.url.includes('?') ? '&' : '?'
              prototype.url += that.serialize(data)
            }
          } else {
            prototype.headers['Content-Type'] = 'application/json'
            prototype.data = JSON.stringify(data)
          }
        }

        if (Object.prototype.hasOwnProperty.call(options, 'headers') && typeof options.headers === 'object') {
          Object.keys(options.headers).forEach(function (headerKey) {
            prototype.headers[headerKey] = options.headers[headerKey]
          })
        }

        $$http(prototype).then(function (response) {
          if (response.status === 200 && angular.isObject(response.data)) {
            // TODO: Make this into an over-writable function

            // Data
            that.header.set(response.headers() || {})
            that.meta.set(response.data.meta || {})
            that.models = []
            const data = response.data.payload || response.data
            if (that.direct) {
              that.models = data
            } else if (_.isArray(data)) {
              that.inject(data)
            } else if (_.isObject(data)) {
              _.each(data, that.inject)
            } else {
              console.error('malformed payload:', data)
            }

            // XHR Flags
            that.pending = false
            that.completed = true

            // Action Flags
            that.filtering = false
            that.paginate = false

            // Trigger Change Event
            that.throttleTrigger('change')

            // Promise
            resolve(that.models)
          } else {
            // XHR Flags
            that.pending = false
            that.error = true

            // Build Report
            const error = new Stratus.Prototypes.Error()
            error.payload = _.isObject(response.data) ? response.data : response
            if (response.statusText && response.statusText !== 'OK') {
              error.message = response.statusText
            } else if (!_.isObject(response.data)) {
              error.message = `Invalid Payload: ${prototype.method} ${prototype.url}`
            } else {
              error.message = 'Unknown AngularCollection error!'
            }

            // Trigger Change Event
            that.throttleTrigger('change')

            // Promise
            reject(error)
          }

          // Trigger Change Event
          that.throttleTrigger('change')
        }).catch(function (error) {
          // (/(.*)\sReceived/i).exec(error.message)[1]
          console.error('XHR: ' + prototype.method + ' ' + prototype.url)
          that.throttleTrigger('change')
          reject(error)
          throw error
        })
      })
    }

    /**
     * @param {String=} [action=GET] Define GET or POST
     * @param {Object=} data
     * @param {Object=} [options={}]
     * @returns {*}
     */
    fetch (action, data, options) {
      const that = this
      return that.sync(action, data || that.meta.get('api'), options).catch(
        function (error) {
          $$mdToast.show(
            $$mdToast.simple()
              .textContent('Failure to Fetch!')
              .toastClass('errorMessage')
              .position('top right')
              .hideDelay(3000)
          )
          console.error('FETCH:', error)
        }
      )
    }

    /**
     * @param query
     * @returns {*}
     */
    filter (query) {
      this.filtering = true
      this.meta.set('api.q', angular.isDefined(query) ? query : '')
      this.meta.set('api.p', 1)
      return this.fetch()
    }

    /**
     * @param query
     * @returns {*}
     */
    throttleFilter (query) {
      const that = this
      that.meta.set('api.q', angular.isDefined(query) ? query : '')
      return new Promise(function (resolve, reject) {
        const request = that.throttle()
        if (!Stratus.Environment.get('production')) {
          console.log('request:', request)
        }
        request.then(function (models) {
          if (!Stratus.Environment.get('production')) {
            // TODO: Finish handling throttled data
            /* *
              console.log('throttled:', _.map(models, function (model) {
                return model.domainPrimary
              }))
              /* */
          }
          resolve(models)
        }).catch(reject)
      })
    }

    /**
     * @param page
     * @returns {*}
     */
    page (page) {
      const that = this
      that.paginate = true
      that.meta.set('api.p', page)
      that.fetch()
      delete that.meta.get('api').p
    }

    /**
     * @returns {Array}
     */
    toJSON () {
      const sanitized = []
      const that = this
      that.models.forEach(function (model) {
        if (typeof model.toJSON === 'function') {
          sanitized.push(model.toJSON())
        }
      })
      return sanitized
    }

    /**
     * @param target
     * @param options
     */
    add (target, options) {
      if (!angular.isObject(target)) {
        return
      }
      if (!options || typeof options !== 'object') {
        options = {}
      }
      const that = this
      target = (target instanceof Model) ? target : new Model({
        collection: that
      }, target)
      that.models.push(target)
      that.throttleTrigger('change')
      if (options.save) {
        target.save()
      }
    }

    /**
     * @param target
     */
    remove (target) {
      const that = this
      that.models.splice(that.models.indexOf(target), 1)
      that.throttleTrigger('change')
    }

    /**
     * @param predicate
     * @returns {*}
     */
    find (predicate) {
      const that = this
      return _.find(that.models, _.isFunction(predicate) ? predicate : function (model) {
        return model.get('id') === predicate
      })
    }

    /**
     * @param attribute
     * @returns {Array}
     */
    pluck (attribute) {
      const that = this
      return _.map(that.models, function (element) {
        return element instanceof Model
          ? element.pluck(attribute)
          : null
      })
    }

    /**
     * @param attribute
     * @returns {boolean}
     */
    exists (attribute) {
      const that = this
      return !!_.reduce(that.pluck(attribute) || [],
        function (memo, data) {
          return memo || angular.isDefined(data)
        })
    }
  }

  // This Collection Service handles data binding for multiple objects with the
  // $http Service
  // TODO: Build out the query-only structure here as a separate set of
  // registered collections and models
  // RAJ Added $qProvide to handle unhandleExceptions in angular 1.6
  Stratus.Services.Collection = [
    '$provide',
    function ($provide) {
      $provide.factory('Collection', [
        '$http',
        '$mdToast',
        function ($http, $mdToast) {
          $$http = $http
          $$mdToast = $mdToast
          return Collection
        }
      ])
    }
  ]
  Stratus.Data.Collection = Collection
  exports = Collection
  return Collection
}))
