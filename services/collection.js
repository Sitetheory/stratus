// Collection Service
// ------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'angular-material',
      'stratus.services.model'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This Collection Service handles data binding for multiple objects with the
  // $http Service
  // TODO: Build out the query-only structure here as a separate set of
  // registered collections and models
  // RAJ Added $qProvide to handle unhandleExceptions in angular 1.6
  Stratus.Services.Collection = [
    '$provide', '$qProvider',
    function ($provide, $qProvider) {
      $qProvider.errorOnUnhandledRejections(false)
      $provide.factory('Collection', [
        '$q',
        '$http',
        '$mdToast',
        '$timeout',
        '$log',
        'Model',
        function ($q, $http, $mdToast, $timeout, $log, Model) {
          return function (options) {
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
            this.models = []
            this.header = new Stratus.Prototypes.Model()
            this.meta = new Stratus.Prototypes.Model()
            this.model = Model

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

            // Contextual Hoisting
            var that = this

            /**
             * @param obj
             * @param chain
             * @returns {string}
             */
            this.serialize = function (obj, chain) {
              var str = []
              obj = obj || {}
              angular.forEach(obj, function (value, key) {
                if (angular.isObject(value)) {
                  if (chain) {
                    key = chain + '[' + key + ']'
                  }
                  str.push(that.serialize(value, key))
                } else {
                  var encoded = ''
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
            this.url = function () {
              return that.urlRoot + (that.targetSuffix || '')
            }

            /**
             * @param data
             * @param type
             */
            this.inject = function (data, type) {
              if (!_.isArray(data)) {
                return
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
             * @param action
             * @param data
             * @returns {*}
             */
            this.sync = function (action, data) {
              // Internals
              that.pending = true
              that.completed = false

              return $q(function (resolve, reject) {
                action = action || 'GET'
                var prototype = {
                  method: action,
                  url: that.url(),
                  headers: {}
                }
                if (angular.isDefined(data)) {
                  if (action === 'GET') {
                    if (angular.isObject(data) && Object.keys(data).length) {
                      prototype.url += '?' + that.serialize(data)
                    }
                  } else {
                    prototype.headers['Content-Type'] = 'application/json'
                    prototype.data = JSON.stringify(data)
                  }
                }
                $http(prototype).then(function (response) {
                  if (response.status === 200 && angular.isObject(response.data)) {
                    // TODO: Make this into an over-writable function

                    // Data
                    that.header.set(response.headers() || {})
                    that.meta.set(response.data.meta || {})
                    that.models = []
                    var data = response.data.payload || response.data
                    if (that.direct) {
                      that.models = data
                    } else if (_.isArray(data)) {
                      that.inject(data)
                    } else if (_.isObject(data)) {
                      _.each(data, that.inject)
                    } else {
                      $log.error('malformed payload:', data)
                    }

                    // XHR Flags
                    that.pending = false
                    that.completed = true

                    // Action Flags
                    that.filtering = false
                    that.paginate = false

                    // Promise
                    resolve(that.models)
                  } else {
                    // XHR Flags
                    that.pending = false
                    that.error = true

                    // Promise
                    reject((response.statusText && response.statusText !== 'OK')
                      ? response.statusText
                      : (
                        angular.isObject(response.data) ? response.data : (
                          'Invalid Payload: ' + prototype.method + ' ' +
                          prototype.url
                        )
                      ))
                  }
                }).catch(function () {
                  // (/(.*)\sReceived/i).exec(error.message)[1]
                  reject('XHR: ' + prototype.method + ' ' + prototype.url)
                })
              })
            }

            /**
             * @param action
             * @param data
             * @returns {*}
             */
            this.fetch = function (action, data) {
              return that.sync(action, data || that.meta.get('api')).catch(
                function (message) {
                  $mdToast.show(
                    $mdToast.simple()
                      .textContent('Failure to Fetch!')
                      .toastClass('errorMessage')
                      .position('top right')
                      .hideDelay(3000)
                  )
                  $log.error('FETCH:', message)
                }
              )
            }

            /**
             * @param query
             * @returns {*}
             */
            this.filter = function (query) {
              that.filtering = true
              that.meta.set('api.q', angular.isDefined(query) ? query : '')
              that.meta.set('api.p', 1)
              return that.fetch()
            }

            /**
             * @type {Function}
             */
            this.throttle = _.throttle(this.fetch, 1000)

            /**
             * @param query
             * @returns {*}
             */
            this.throttleFilter = function (query) {
              that.meta.set('api.q', angular.isDefined(query) ? query : '')
              return $q(function (resolve, reject) {
                var request = that.throttle()
                if (!Stratus.Environment.get('production')) {
                  $log.log('request:', request)
                }
                request.then(function (models) {
                  if (!Stratus.Environment.get('production')) {
                    // TODO: Finish handling throttled data
                    /* *
                    $log.log('throttled:', _.map(models, function (model) {
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
            this.page = function (page) {
              that.paginate = true
              that.meta.set('api.p', page)
              that.fetch()
              delete that.meta.get('api').p
            }

            /**
             * @returns {Array}
             */
            this.toJSON = function () {
              var sanitized = []
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
            this.add = function (target, options) {
              if (!options || typeof options !== 'object') {
                options = {}
              }
              if (angular.isObject(target)) {
                target = (target instanceof Model) ? target : new Model({
                  collection: that
                }, target)
                that.models.push(target)
                if (options.save) {
                  target.save()
                }
              }
            }

            /**
             * @param target
             */
            this.remove = function (target) {
              that.models.splice(that.models.indexOf(target), 1)
            }

            /**
             * @param attribute
             * @returns {Array}
             */
            this.pluck = function (attribute) {
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
            this.exists = function (attribute) {
              return !!_.reduce(that.pluck(attribute) || [],
                function (memo, data) {
                  return memo || angular.isDefined(data)
                })
            }

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
        }
      ])
    }
  ]
}))
