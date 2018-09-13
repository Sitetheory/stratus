// Model Service
// -------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'angular-material',
      'stratus.services.utility'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This Model Service handles data binding for a single object with the $http
  // Service
  Stratus.Services.Model = [
    '$provide', function ($provide) {
      $provide.factory('Model', [
        '$q',
        '$http',
        '$mdToast',
        '$rootScope',
        '$log',
        'utility',
        function ($q, $http, $mdToast, $rootScope, $log, utility) {
          return function (options, attributes) {
            // Environment
            this.target = null
            this.manifest = false
            this.stagger = false
            this.toast = false
            this.urlRoot = '/Api'
            if (!options || typeof options !== 'object') {
              options = {}
            }
            angular.extend(this, options)

            // Infrastructure
            this.identifier = null
            this.data = {}

            // The data used to detect the data is changed.
            this.initData = {}

            // Handle Collections & Meta
            this.header = new Stratus.Prototypes.Model()
            this.meta = new Stratus.Prototypes.Model()
            if (_.has(this, 'collection')) {
              if (this.collection.target) {
                this.target = this.collection.target
              }
              if (this.collection.meta.has('api')) {
                this.meta.set('api', this.collection.meta.get('api'))
              }
            }

            // Handle Attributes (Typically from Collection Hydration)
            if (attributes && typeof attributes === 'object') {
              angular.extend(this.data, attributes)
            }

            // Generate URL
            if (this.target) {
              this.urlRoot += '/' + _.ucfirst(this.target)
            }

            // XHR Flags
            this.pending = false
            this.error = false
            this.completed = false

            // TODO: Enable Auto-Save

            // Auto-Saving Flags
            this.changed = false
            this.saving = false
            this.watching = false

            // Auto-Saving Logic
            this.patch = {}

            // Contextual Hoisting
            var that = this

            // Watch for Data Changes
            this.watcher = function () {
              if (that.watching) {
                return true
              }
              that.watching = true
              $rootScope.$watch(function () {
                return that.data
              }, function (newData, priorData) {
                var patch = _.patch(newData, priorData)
                $log.log('Patch:', patch)

                // Set the origin data
                if (_.isEmpty(that.initData)) {
                  angular.copy(that.data, that.initData)
                }

                if (patch) {
                  that.changed = !angular.equals(newData, that.initData)
                  if ((newData.id && newData.id !== priorData.id) ||
                    that.isNewVersion(newData)) {
                    window.location.replace(
                      Stratus.Internals.SetUrlParams({
                        id: newData.id
                      })
                    )
                  }
                  that.patch = _.extend(that.patch, patch)
                }
              }, true)
            }

            /**
             * @returns {*}
             */
            this.getIdentifier = function () {
              return (this.identifier = that.get('id') || that.identifier)
            }

            /**
             * @returns {*}
             */
            this.getType = function () {
              return (this.type = that.type || that.target || 'orphan')
            }

            /**
             * @returns {*}
             */
            this.getHash = function () {
              return this.getType() +
                (_.isNumber(this.getIdentifier()) ? this.getIdentifier()
                  .toString() : this.getIdentifier())
            }

            /**
             * @returns {*}
             */
            this.url = function () {
              var url = that.getIdentifier() ? that.urlRoot + '/' +
                that.getIdentifier() : that.urlRoot + (that.targetSuffix || '')

              // TODO: Move the following version logic to a router
              url += '?'

              // add futher param to specific version
              if (_.getUrlParams('version')) {
                url += 'options[version]=' + _.getUrlParams('version')
              }
              return url
            }

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

            // TODO: Abstract this deeper
            /**
             * @param action
             * @param data
             * @returns {*}
             */
            this.sync = function (action, data) {
              this.pending = true
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
                      prototype.url += '&' + that.serialize(data)
                    }
                  } else {
                    prototype.headers['Content-Type'] = 'application/json'
                    prototype.data = JSON.stringify(data)
                  }
                }

                if (!Stratus.Environment.get('production')) {
                  $log.log('Prototype:', prototype)
                }

                $http(prototype).then(function (response) {
                  if (response.status === 200 && angular.isObject(response.data)) {
                    // TODO: Make this into an over-writable function
                    // Data
                    that.header.set(response.headers() || {})
                    that.meta.set(response.data.meta || {})
                    var convoy = response.data.payload || response.data
                    if (that.meta.has('status') && _.first(that.meta.get('status')).code !== 'SUCCESS') {
                      that.error = true
                    } else if (angular.isArray(convoy) && convoy.length) {
                      that.data = _.first(convoy)
                      that.error = false
                    } else if (angular.isObject(convoy) && !angular.isArray(convoy)) {
                      that.data = convoy
                      that.error = false
                    } else {
                      that.error = true
                    }

                    if (!that.error) {
                      // XHR Flags
                      that.completed = true

                      // Auto-Saving Settings
                      that.saving = false
                      that.patch = {}

                      // Begin Watching
                      that.watcher()
                    }

                    // XHR Flags
                    that.pending = false

                    // Promise
                    angular.copy(that.data, that.initData)
                    resolve(that.data)
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
                          prototype.url)
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
              return that.sync(action, data || that.meta.get('api'))
                .catch(function (message) {
                  if (that.toast) {
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('Failure to Fetch!')
                        .toastClass('errorMessage')
                        .position('top right')
                        .hideDelay(3000)
                    )
                  }
                  $log.error('FETCH:', message)
                })
            }

            /**
             * @returns {*}
             */
            this.save = function () {
              that.saving = true
              return that.sync(that.getIdentifier() ? 'PUT' : 'POST',
                that.toJSON({
                  patch: true
                }))
                .catch(function (message) {
                  if (that.toast) {
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('Failure to Save!')
                        .toastClass('errorMessage')
                        .position('top right')
                        .hideDelay(3000)
                    )
                  }
                  $log.error('SAVE:', message)
                })
            }

            /**
             * TODO: Ensure the meta temp locations get cleared appropriately before removing function
             * @deprecated This is specific to the Sitetheory 1.0 API and will be removed entirely
             * @returns {*}
             */
            this.specialAction = function (action) {
              this.meta.temp('api.options.apiSpecialAction', action)
              this.save()
              if (this.meta.get('api') && this.meta.get('api').hasOwnProperty('options') && this.meta.get('api').options.hasOwnProperty('apiSpecialAction')) {
                delete this.meta.get('api').options.apiSpecialAction
              }
            }

            /**
             * @type {Function}
             */
            this.throttle = _.throttle(this.save, 2000)

            /**
             * @returns {*}
             */
            this.throttleSave = function () {
              return $q(function (resolve, reject) {
                var request = that.throttle()
                $log.log('throttle request:', request)
                request.then(function (data) {
                  $log.log('throttle received:', data)
                  resolve(data)
                }).catch(reject)
              })
            }

            // Attribute Functions

            /**
             * @param options
             * @returns {{meta, payload}}
             */
            this.toJSON = function (options) {
              /* *
              options = _.extend(options || {}, {
                  patch: false
              });
              /* */
              var data

              // options.patch ? that.toPatch() :
              data = that.data
              data = that.meta.has('api') ? {
                meta: that.meta.get('api'),
                payload: data
              } : data
              if (that.meta.size() > 0) {
                that.meta.clearTemp()
              }
              return data
            }

            /**
             * @returns {null}
             */
            that.toPatch = function () {
              return that.patch
            }

            /**
             * @type {{match: RegExp, search: RegExp, attr: RegExp}}
             */
            this.bracket = {
              match: /\[[\d+]]/,
              search: /\[([\d+])]/g,
              attr: /(^[^[]+)/
            }

            /**
             * @param path
             * @returns {Array}
             */
            this.buildPath = function (path) {
              var acc = []
              if (!_.isString(path)) {
                return acc
              }
              var cur
              var search
              _.each(path.split('.'), function (link) {
                // handle bracket chains
                if (link.match(that.bracket.match)) {
                  // extract attribute
                  cur = that.bracket.attr.exec(link)
                  if (cur !== null) {
                    acc.push(cur[1])
                    cur = null
                  } else {
                    cur = false
                  }

                  // extract cells
                  search = that.bracket.search.exec(link)
                  while (search !== null) {
                    if (cur !== false) {
                      cur = parseInt(search[1])
                      if (!isNaN(cur)) {
                        acc.push(cur)
                      } else {
                        cur = false
                      }
                    }
                    search = that.bracket.search.exec(link)
                  }
                } else {
                  // normal attributes
                  acc.push(link)
                }
              })
              return acc
            }

            /**
             * Use to get an attributes in the model.
             * @param attr
             * @returns {*}
             */
            this.get = function (attr) {
              if (typeof attr !== 'string' || !that.data ||
                typeof that.data !== 'object') {
                return undefined
              } else {
                return that.buildPath(attr).reduce(function (attrs, link) {
                  return attrs && attrs[link]
                }, that.data)
              }
            }

            /**
            * if the attributes is an array, the function allow to find the specific object by the condition ( key - value )
            * @param attr
            * @param key
            * @param value
            * @returns {*}
            */
            this.find = function (attributes, key, value) {
              if (typeof attributes === 'string') {
                attributes = that.get(attributes)
              }

              if (!(attributes instanceof Array)) {
                return attributes
              } else {
                return attributes.find(function (obj) { return obj[key] === value })
              }
            }

            /**
             * Check response is a new version. In the case, current url
             * represent the specific version. we need to check the version
             * after submit, if it is a new one, we'll redirect to the newest
             * version page
             * @return boolean
             */
            this.isNewVersion = function (newData) {
              return !_.isEmpty(utility.moreParams()) && newData.version &&
                parseInt(utility.moreParams().version) !== newData.version.id
            }

            /**
             * @param attr
             * @param value
             */
            this.set = function (attr, value) {
              if (attr && typeof attr === 'object') {
                _.each(attr, function (value, attr) {
                  that.setAttribute(attr, value)
                }, this)
              } else {
                that.setAttribute(attr, value)
              }
            }

            /**
             * @param attr
             * @param value
             */
            this.setAttribute = function (attr, value) {
              if (typeof attr === 'string' &&
                (_.contains(attr, '.') || _.contains(attr, '['))) {
                var future
                that.buildPath(attr)
                  .reduce(function (attrs, link, index, chain) {
                    future = index + 1
                    if (!_.has(attrs, link)) {
                      attrs[link] = _.has(chain, future) &&
                      _.isNumber(chain[future]) ? [] : {}
                    }
                    if (!_.has(chain, future)) {
                      attrs[link] = value
                    }
                    return attrs && attrs[link]
                  }, that.data)
              } else {
                that.data[attr] = value
              }
              /* TODO: that.trigger('change:' + attr, value); */
            }

            /**
             * @param attribute
             * @param item
             * @param options
             * @returns {*}
             */
            this.toggle = function (attribute, item, options) {
              if (angular.isObject(options) &&
                angular.isDefined(options.multiple) &&
                angular.isUndefined(options.strict)) {
                options.strict = true
              }
              options = _.extend({
                multiple: true
              }, angular.isObject(options) ? options : {})
              /* TODO: After plucking has been tested, remove this log *
              $log.log('toggle:', attribute, item, options);
              /* */
              var request = attribute.split('[].')
              var target = that.get(
                request.length > 1 ? request[0] : attribute)
              if (angular.isUndefined(target) ||
                (options.strict && angular.isArray(target) !==
                  options.multiple)) {
                target = options.multiple ? [] : null
                that.set(request.length > 1 ? request[0] : attribute, target)
              }
              if (angular.isArray(target)) {
                /* This is disabled, since hydration should not be forced by default *
                var hydrate = {};
                if (request.length > 1) {
                    hydrate[request[1]] = {
                        id: item
                    };
                } else {
                    hydrate.id = item;
                }
                /* */
                if (angular.isUndefined(item)) {
                  that.set(attribute, null)
                } else if (!that.exists(attribute, item)) {
                  target.push(item)
                } else {
                  _.each(target, function (element, key) {
                    var child = (request.length > 1 &&
                      angular.isObject(element) && request[1] in element)
                      ? element[request[1]]
                      : element
                    var childId = (angular.isObject(child) && child.id)
                      ? child.id
                      : child
                    var itemId = (angular.isObject(item) && item.id)
                      ? item.id
                      : item
                    if (childId === itemId || (
                      angular.isString(childId) && angular.isString(itemId) && _.strcmp(childId, itemId) === 0
                    )) {
                      target.splice(key, 1)
                    }
                  })
                }
              } else if (typeof target === 'object' || typeof target === 'number') {
                // (item && typeof item !== 'object') ? { id: item } : item
                that.set(attribute, !that.exists(attribute, item) ? item : null)
              } else if (angular.isUndefined(item)) {
                that.set(attribute, !target)
              }

              return that.get(attribute)
            }

            /**
             * @param attribute
             * @returns {*}
             */
            this.pluck = function (attribute) {
              if (typeof attribute === 'string' &&
                attribute.indexOf('[].') > -1) {
                var request = attribute.split('[].')
                if (request.length > 1) {
                  attribute = that.get(request[0])
                  if (attribute && angular.isArray(attribute)) {
                    var list = []
                    attribute.forEach(function (element) {
                      if (angular.isObject(element) && request[1] in element) {
                        list.push(element[request[1]])
                      }
                    })
                    if (list.length) {
                      return list
                    }
                  }
                }
              } else {
                return that.get(attribute)
              }
              return undefined
            }

            /**
             * @param attribute
             * @param item
             * @returns {boolean}
             */
            this.exists = function (attribute, item) {
              if (!item) {
                attribute = that.get(attribute)
                return typeof attribute !== 'undefined' && attribute
              } else if (typeof attribute === 'string' && item) {
                attribute = that.pluck(attribute)
                if (angular.isArray(attribute)) {
                  return typeof attribute.find(function (element) {
                    return element === item || (
                      (angular.isObject(element) && element.id && element.id === item) || _.isEqual(element, item)
                    )
                  }) !== 'undefined'
                } else {
                  return attribute === item || (
                    angular.isObject(attribute) && attribute.id && (
                      _.isEqual(attribute, item) || attribute.id === item
                    )
                  )
                }
              }
              return false
            }

            /**
             * @type {Function}
             */
            this.destroy = function () {
              // TODO: Add a confirmation option here
              if (that.collection) {
                that.collection.remove(that)
              }
              if (that.getIdentifier()) {
                that.sync('DELETE', {}).catch(function (message) {
                  if (that.toast) {
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('Failure to Delete!')
                        .toastClass('errorMessage')
                        .position('top right')
                        .hideDelay(3000)
                    )
                  }
                  $log.error('DESTROY:', message)
                })
              }
            }

            /**
             * @type {Function}
             */
            this.initialize = _.once(this.initialize || function () {
              if (that.manifest && !that.getIdentifier()) {
                that.sync('POST', that.meta.has('api') ? {
                  meta: that.meta.get('api'),
                  payload: {}
                } : {}).catch(function (message) {
                  if (that.toast) {
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('Failure to Manifest!')
                        .toastClass('errorMessage')
                        .position('top right')
                        .hideDelay(3000)
                    )
                  }
                  $log.error('MANIFEST:', message)
                })
              }
            })
            if (!that.stagger) {
              this.initialize()
            }
          }
        }
      ])
    }]
}))
