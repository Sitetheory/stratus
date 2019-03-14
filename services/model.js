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
      'angular-material'
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
        '$http',
        '$mdToast',
        '$rootScope',
        function ($http, $mdToast, $rootScope) {
          return class AngularModel extends Stratus.Prototypes.Model {
            constructor (options, attributes) {
              super(attributes)
              this.name = 'AngularModel'

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
              // this.initData = {}

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

              /**
               * @type {{match: RegExp, search: RegExp, attr: RegExp}}
               */
              this.bracket = {
                match: /\[[\d+]]/,
                search: /\[([\d+])]/g,
                attr: /(^[^[]+)/
              }

              // Scope Binding
              this.watcher = this.watcher.bind(this)
              this.getIdentifier = this.getIdentifier.bind(this)
              this.getType = this.getType.bind(this)
              this.getHash = this.getHash.bind(this)
              this.url = this.url.bind(this)
              this.serialize = this.serialize.bind(this)
              this.sync = this.sync.bind(this)
              this.fetch = this.fetch.bind(this)
              this.save = this.save.bind(this)
              this.specialAction = this.specialAction.bind(this)
              this.throttleSave = this.throttleSave.bind(this)
              this.toJSON = this.toJSON.bind(this)
              this.toPatch = this.toPatch.bind(this)
              this.buildPath = this.buildPath.bind(this)
              this.get = this.get.bind(this)
              this.find = this.find.bind(this)
              this.set = this.set.bind(this)
              this.setAttribute = this.setAttribute.bind(this)
              this.toggle = this.toggle.bind(this)
              this.pluck = this.pluck.bind(this)
              this.exists = this.exists.bind(this)
              this.destroy = this.destroy.bind(this)

              /**
               * @type {Function}
               */
              this.throttle = _.throttle(this.save, 2000)

              /**
               * @type {Function}
               */
              this.initialize = _.once(this.initialize || function () {
                const that = this
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
                    console.error('MANIFEST:', message)
                  })
                }
              })

              if (!this.stagger) {
                this.initialize()
              }
            }

            // Watch for Data Changes
            watcher () {
              if (this.watching) {
                return true
              }
              this.watching = true
              const that = this
              $rootScope.$watch(function () {
                return that.data
              }, function (newData, priorData) {
                const patch = _.patch(newData, priorData)

                if (!Stratus.Environment.get('production')) {
                  console.log('Patch:', patch)
                }

                // Set the origin data
                /* *
                if (_.isEmpty(that.initData)) {
                  angular.copy(that.data, that.initData)
                }
                /* */

                if (!patch) {
                  return true
                }

                that.changed = true

                const version = _.getAnchorParams('version')

                // that.changed = !angular.equals(newData, that.initData)
                if ((newData.id && newData.id !== priorData.id) ||
                  (!_.isEmpty(version) && newData.version && parseInt(version) !== newData.version.id)
                ) {
                  window.location.replace(
                    _.setUrlParams({
                      id: newData.id
                    })
                  )
                }
                that.patch = _.extend(that.patch, patch)
              }, true)
            }

            /**
             * @returns {*}
             */
            getIdentifier () {
              return (this.identifier = this.get('id') || this.identifier)
            }

            /**
             * @returns {*}
             */
            getType () {
              return (this.type = this.type || this.target || 'orphan')
            }

            /**
             * @returns {*}
             */
            getHash () {
              return this.getType() + (_.isNumber(this.getIdentifier()) ? this.getIdentifier().toString() : this.getIdentifier())
            }

            /**
             * @returns {*}
             */
            url () {
              let url = this.getIdentifier() ? this.urlRoot + '/' + this.getIdentifier() : this.urlRoot + (this.targetSuffix || '')

              // add further param to specific version
              if (_.getUrlParams('version')) {
                // TODO: Move the following version logic to a router
                url += url.includes('?') ? '&' : '?'
                url += 'options[version]=' + _.getUrlParams('version')
              }
              return url
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

            // TODO: Abstract this deeper
            /**
             * @param {String=} [action=GET] Define GET or POST
             * @param {Object=} data
             * @param {Object=} [options={}]
             * @returns {*}
             */
            sync (action, data, options) {
              this.pending = true
              const that = this
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

                if (!Stratus.Environment.get('production')) {
                  console.log('Prototype:', prototype)
                }

                if (options.hasOwnProperty('headers') && typeof options.headers === 'object') {
                  Object.keys(options.headers).forEach(function (headerKey) {
                    prototype.headers[headerKey] = options.headers[headerKey]
                  })
                }

                $http(prototype).then(function (response) {
                  if (response.status === 200 && angular.isObject(response.data)) {
                    // TODO: Make this into an over-writable function
                    // Data
                    that.header.set(response.headers() || {})
                    that.meta.set(response.data.meta || {})
                    const convoy = response.data.payload || response.data
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

                      // Reset status model
                      setTimeout(function () {
                        that.changed = false
                      }, 100)
                    }

                    // XHR Flags
                    that.pending = false

                    // Promise
                    // angular.copy(that.data, that.initData)
                    resolve(that.data)
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
                      error.message = 'Unknown AngularModel error!'
                    }

                    // Promise
                    reject(error)
                  }
                }).catch(function () {
                  // (/(.*)\sReceived/i).exec(error.message)[1]
                  console.error(`XHR: ${prototype.method} ${prototype.url}`, arguments)
                  reject.call(arguments)
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
              return that.sync(action, data || that.meta.get('api'), options)
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
                  console.error('FETCH:', message)
                })
            }

            /**
             * @returns {*}
             */
            save () {
              const that = this
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
                  console.error('SAVE:', message)
                })
            }

            /**
             * TODO: Ensure the meta temp locations get cleared appropriately before removing function
             * @deprecated This is specific to the Sitetheory 1.0 API and will be removed entirely
             * @returns {*}
             */
            specialAction (action) {
              this.meta.temp('api.options.apiSpecialAction', action)
              this.save()
              if (this.meta.get('api') && this.meta.get('api').hasOwnProperty('options') && this.meta.get('api').options.hasOwnProperty('apiSpecialAction')) {
                delete this.meta.get('api').options.apiSpecialAction
              }
            }

            /**
             * @returns {*}
             */
            throttleSave () {
              const that = this
              return new Promise(function (resolve, reject) {
                const request = that.throttle()
                console.log('throttle request:', request)
                request.then(function (data) {
                  console.log('throttle received:', data)
                  resolve(data)
                }).catch(reject)
              })
            }

            // Attribute Functions

            /**
             * @param options
             * @returns {{meta, payload}}
             */
            toJSON (options) {
              /* *
                options = _.extend(options || {}, {
                    patch: false
                });
                /* */
              const that = this
              let data

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
            toPatch () {
              return this.patch
            }

            /**
             * @param path
             * @returns {Array}
             */
            buildPath (path) {
              const acc = []
              if (!_.isString(path)) {
                return acc
              }
              const that = this
              let cur
              let search
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
            get (attr) {
              const that = this
              if (typeof attr !== 'string' || !that.data || typeof that.data !== 'object') {
                return undefined
              } else {
                return that.buildPath(attr).reduce(function (attrs, link) {
                  return attrs && attrs[link]
                }, that.data)
              }
            }

            /**
             * if the attributes is an array, the function allow to find the specific object by the condition ( key - value )
             * @param attributes
             * @param key
             * @param value
             * @returns {*}
             */
            find (attributes, key, value) {
              const that = this
              if (typeof attributes === 'string') {
                attributes = that.get(attributes)
              }

              if (!(attributes instanceof Array)) {
                return attributes
              } else {
                return attributes.find(function (obj) {
                  return obj[key] === value
                })
              }
            }

            /**
             * @param attr
             * @param value
             */
            set (attr, value) {
              const that = this
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
            setAttribute (attr, value) {
              const that = this
              if (typeof attr === 'string' &&
                  (_.contains(attr, '.') || _.contains(attr, '['))
              ) {
                let future
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
            toggle (attribute, item, options) {
              const that = this
              if (angular.isObject(options) &&
                  angular.isDefined(options.multiple) &&
                  angular.isUndefined(options.strict)) {
                options.strict = true
              }
              options = _.extend({
                multiple: true
              }, angular.isObject(options) ? options : {})
              /* TODO: After plucking has been tested, remove this log *
                console.log('toggle:', attribute, item, options);
                /* */
              const request = attribute.split('[].')
              let target = that.get(request.length > 1 ? request[0] : attribute)
              if (angular.isUndefined(target) ||
                  (options.strict && angular.isArray(target) !==
                    options.multiple)) {
                target = options.multiple ? [] : null
                that.set(request.length > 1 ? request[0] : attribute, target)
              }
              if (angular.isArray(target)) {
                /* This is disabled, since hydration should not be forced by default *
                const hydrate = {}
                if (request.length > 1) {
                  hydrate[request[1]] = {
                    id: item
                  }
                } else {
                  hydrate.id = item
                }
                /* */
                if (angular.isUndefined(item)) {
                  that.set(attribute, null)
                } else if (!that.exists(attribute, item)) {
                  target.push(item)
                } else {
                  _.each(target, function (element, key) {
                    const child = (request.length > 1 &&
                        angular.isObject(element) && request[1] in element)
                      ? element[request[1]]
                      : element
                    const childId = (angular.isObject(child) && child.id)
                      ? child.id
                      : child
                    const itemId = (angular.isObject(item) && item.id)
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
            pluck (attribute) {
              const that = this
              if (typeof attribute !== 'string' || attribute.indexOf('[].') === -1) {
                return that.get(attribute)
              }
              const request = attribute.split('[].')
              if (request.length <= 1) {
                return undefined
              }
              attribute = that.get(request[0])
              if (!attribute || !angular.isArray(attribute)) {
                return undefined
              }
              const list = []
              attribute.forEach(function (element) {
                if (!angular.isObject(element) || !(request[1] in element)) {
                  return
                }
                list.push(element[request[1]])
              })
              if (!list.length) {
                return undefined
              }
              return list
            }

            /**
             * @param attribute
             * @param item
             * @returns {boolean}
             */
            exists (attribute, item) {
              const that = this
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
            destroy () {
              const that = this
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
                  console.error('DESTROY:', message)
                })
              }
            }
          }
        }
      ])
    }]
}))
