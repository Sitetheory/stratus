// Model Service
// -------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'angular-material',
      'stratus.services.commonMethods',
    ], factory);
  } else {
    factory(root.Stratus, root._);
  }
}(this, function (Stratus, _) {
  // This Model Service handles data binding for a single object with the $http Service
  Stratus.Services.Model = ['$provide', function ($provide) {
    $provide.factory('model', ['$q', '$http', '$mdToast', '$rootScope', 'commonMethods', function ($q, $http, $mdToast, $rootScope, commonMethods) {
      return function (options, attributes) {

        // Environment
        this.target = null;
        this.manifest = false;
        this.stagger = false;
        if (!options || typeof options !== 'object') options = {};
        angular.extend(this, options);

        // Infrastructure
        this.urlRoot = '/Api';
        this.data = {};

        // Handle Collections & Meta
        this.meta = new Stratus.Prototypes.Model();
        if (_.has(this, 'collection')) {
          if (this.collection.target) this.target = this.collection.target;
          if (this.collection.meta.has('api')) this.meta.set('api', this.collection.meta.get('api'));
        }

        // Handle Attributes (Typically from Collection Hydration)
        if (attributes && typeof attributes === 'object') {
          angular.extend(this.data, attributes);
        }

        // Generate URL
        if (this.target) {
          this.urlRoot += '/' + _.ucfirst(this.target);
        }

        // XHR Flags
        this.pending = false;
        this.error = false;
        this.completed = false;

        // Auto-Saving Flags
        this.changed = false;
        this.saving = false;
        this.watching = false;

        // Auto-Saving Logic
        this.patch = {};

        // Contextual Hoisting
        var that = this;

        // Watch for Data Changes
        this.watcher = function () {
          if (that.watching) return true;
          that.watching = true;
          $rootScope.$watch(function () {
            return that.data;
          }, function (newData, priorData) {
            var patch = _.patch(newData, priorData);
            console.log(patch);
            if (patch) {
              that.changed = true;
              if ((newData.id && newData.id !== priorData.id) || that.isNewVersion(newData)) {
                window.location.replace(
                  Stratus.Internals.SetUrlParams({ id: newData.id })
                );
              }
              that.patch = _.extend(that.patch, patch);
            }
          }, true);
        };

        /**
        * @returns {*}
        */
        this.url = function () {
          return that.get('id') ? that.urlRoot + '/' + that.get('id') : that.urlRoot;
        };

        /**
        * @param obj
        * @param chain
        * @returns {string}
        */
        this.serialize = function (obj, chain) {
          var str = [];
          obj = obj || {};
          angular.forEach(obj, function (value, key) {
            if (angular.isObject(value)) {
              str.push(that.serialize(value, key));
            } else {
              var encoded = '';
              if (chain) encoded += chain + '[';
              encoded += key;
              if (chain) encoded += ']';
              str.push(encoded + '=' + value);
            }
          });
          return str.join('&');
        };

        // TODO: Abstract this deeper
        /**
        * @param action
        * @param data
        * @returns {*}
        */
        this.sync = function (action, data) {
            this.pending = true;
            return $q(function (resolve, reject) {
                action = action || 'GET';
                var prototype = {
                  method: action,
                  url: that.url(),
                  headers: {}
                };
                if (angular.isDefined(data)) {
                  if (action === 'GET') {
                    if (angular.isObject(data) && Object.keys(data).length) {
                      prototype.url += '?' + that.serialize(data);
                      if (commonMethods.moreParams()) {
                        angular.forEach(commonMethods.moreParams(), function (value, key) {
                          prototype.url += '&' + 'options[' + key + ']=' + value;
                        });
                      }
                    }
                  } else {
                    prototype.headers['Content-Type'] = 'application/json';
                    prototype.data = JSON.stringify(data);
                  }
                }

                $http(prototype).then(function (response) {
                    if (response.status === 200 && angular.isObject(response.data)) {
                      // TODO: Make this into an over-writable function
                      // Data
                      that.meta.set(response.data.meta || {});
                      var convoy = response.data.payload || response.data;
                      if (angular.isArray(convoy) && convoy.length) {
                        that.data = _.first(that.data);
                        that.error = false;
                      } else if (angular.isObject(convoy)) {
                        that.data = convoy;
                        that.error = false;
                      } else {
                        that.error = true;
                      }

                      if (!that.error) {
                        // XHR Flags
                        that.pending = false;
                        that.completed = true;

                        // Auto-Saving Settings
                        that.saving = false;

                        that.patch = {};

                        // Begin Watching
                        that.watcher();

                        // Reset status model
                        setTimeout(function () {
                          that.changed = false;
                        }, 100);
                      }

                      // Promise
                      resolve(that.data);
                    } else {
                      // XHR Flags
                      that.pending = false;
                      that.error = true;

                      // Promise
                      reject((response.statusText && response.statusText !== 'OK') ? response.statusText : (
                        angular.isObject(response.data) ? response.data : (
                          'Invalid Payload: ' + prototype.method + ' ' + prototype.url)
                        ));
                    }
                  }).catch(function () {
                    // (/(.*)\sReceived/i).exec(error.message)[1]
                    reject('XHR: ' + prototype.method + ' ' + prototype.url);
                  });
              });
          };

        /**
        * @param action
        * @param data
        * @returns {*}
        */
        this.fetch = function (action, data) {
          return that.sync(action, data || that.meta.get('api')).catch(function (message) {
            $mdToast.show(
              $mdToast.simple()
              .textContent('Failure to Fetch!')
              .toastClass('errorMessage')
              .position('top right')
              .hideDelay(3000)
            );
            console.error('FETCH:', message);
          });
        };

        /**
        * @returns {*}
        */
        this.save = function () {
          that.saving = true;
          return that.sync(that.get('id') ? 'PUT' : 'POST', that.toJSON({
            patch: true
          })).catch(function (message) {
            $mdToast.show(
              $mdToast.simple()
              .textContent('Failure to Save!')
              .toastClass('errorMessage')
              .position('top right')
              .hideDelay(3000)
            );
            console.error('SAVE:', message);
          });
        };

        /**
        * @type {Function}
        */
        this.throttle = _.throttle(this.save, 2000);

        /**
        * @returns {*}
        */
        this.throttleSave = function () {
          return $q(function (resolve, reject) {
            var request = that.throttle();
            console.log('throttle request:', request);
            request.then(function (data) {
              console.log('throttle received:', data);
              resolve(data);
            }).catch(reject);
          });
        };

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
          var data;

          // options.patch ? that.toPatch() :
          data = that.data;
          data = that.meta.has('api') ? {
            meta: that.meta.get('api'),
            payload: data
          } : data;
          if (that.meta.size() > 0) {
            that.meta.clearTemp();
          }
          return data;
        };

        /**
        * @returns {null}
        */
        that.toPatch = function () {
          return that.patch;
        };

        /**
        * @type {{match: RegExp, search: RegExp, attr: RegExp}}
        */
        this.bracket = {
          match: /\[[\d+]]/,
          search: /\[([\d+])]/g,
          attr: /(^[^\[]+)/
        };

        /**
        * @param path
        * @returns {Array}
        */
        this.buildPath = function (path) {
          var acc = [];
          if (!_.isString(path)) {
            return acc;
          }
          var cur;
          var search;
          _.each(path.split('.'), function (link) {
            // handle bracket chains
            if (link.match(that.bracket.match)) {
              // extract attribute
              cur = that.bracket.attr.exec(link);
              if (cur !== null) {
                acc.push(cur[1]);
                cur = null;
              } else {
                cur = false;
              }

              // extract cells
              search = that.bracket.search.exec(link);
              while (search !== null) {
                if (cur !== false) {
                  cur = parseInt(search[1]);
                  if (!isNaN(cur)) {
                    acc.push(cur);
                  } else {
                    cur = false;
                  }
                }
                search = that.bracket.search.exec(link);
              }
            } else {
              // normal attributes
              acc.push(link);
            }
          });
          return acc;
        };

        /**
        * @param attr
        * @returns {*}
        */
        this.get = function (attr) {
          if (typeof attr !== 'string' || !that.data || typeof that.data !== 'object') {
            return undefined;
          } else {
            return that.buildPath(attr).reduce(function (attrs, link) {
              return attrs && attrs[link];
            }, that.data);
          }
        };

        /**
        * Check response is a new version. In the case, current url represent the specific version.
        * we need to check the version after submit, if it is a new one, we'll redirect to the newest version page
        * @return boolean
        */
        this.isNewVersion = function (newData) {
          return (!_.isEmpty(commonMethods.moreParams()) && newData.version && commonMethods.moreParams().version != newData.version.id);
        };

        /**
        * @param attr
        * @param value
        */
        this.set = function (attr, value) {
          if (attr && typeof attr === 'object') {
            _.each(attr, function (value, attr) {
              that.setAttribute(attr, value);
            }, this);
          } else {
            that.setAttribute(attr, value);
          }
        };

        /**
        * @param attr
        * @param value
        */
        this.setAttribute = function (attr, value) {
          if (typeof attr === 'string' && (_.contains(attr, '.') || _.contains(attr, '['))) {
            var future;
            that.buildPath(attr).reduce(function (attrs, link, index, chain) {
              future = index + 1;
              if (!_.has(attrs, link)) {
                attrs[link] = _.has(chain, future) && _.isNumber(chain[future]) ? [] : {};
              }
              if (!_.has(chain, future)) {
                attrs[link] = value;
              }
              return attrs && attrs[link];
            }, that.data);
          } else {
            that.data[attr] = value;
          }
          /* TODO: that.trigger('change:' + attr, value); */
        };

        /**
        * @param attribute
        * @param item
        * @param options
        * @returns {*}
        */
        this.toggle = function (attribute, item, options) {
          if (angular.isObject(options) && angular.isDefined(options.multiple) && angular.isUndefined(options.strict)) {
            options.strict = true;
          }
          options = _.extend({
            multiple: true
          }, angular.isObject(options) ? options : {});
          /* TODO: After plucking has been tested, remove this log *
          console.log('toggle:', attribute, item, options);
          /* */
          var request = attribute.split('[].');
          var target = that.get(request.length > 1 ? request[0] : attribute);
          if (angular.isUndefined(target) || (options.strict && angular.isArray(target) !== options.multiple)) {
            target = options.multiple ? [] : null;
            that.set(request.length > 1 ? request[0] : attribute, target);
          }
          if (angular.isUndefined(item)) {
            that.set(attribute, !target);
          } else if (angular.isArray(target)) {
            /* This is disabled, since hydration should not be forced by default *
            var hydrate = {};
            if (request.length > 1) {
            hydrate[request[1]] = { id: item };
          } else {
          hydrate.id = item;
        }
        /* */
            if (!that.exists(attribute, item)) {
              target.push(item);
            } else {
              _.each(target, function (element, key) {
                var child = (request.length > 1 && angular.isObject(element) && request[1] in element) ? element[request[1]] : element;
                var childId = (angular.isObject(child) && child.id) ? child.id : child;
                var itemId = (angular.isObject(item) && item.id) ? item.id : item;
                if (childId === itemId || (angular.isString(childId) && angular.isString(itemId) && _.strcmp(childId, itemId) === 0)) {
                  target.splice(key, 1);
                }
              });
            }
          } else if (typeof target === 'object' || typeof target === 'number') {
            // (item && typeof item !== 'object') ? { id: item } : item
            that.set(attribute, !that.exists(attribute, item) ? item : null);
          }
          return that.get(attribute);
        };

        /**
        * @param attribute
        * @returns {*}
        */
        this.pluck = function (attribute) {
          if (typeof attribute === 'string' && attribute.indexOf('[].') > -1) {
            var request = attribute.split('[].');
            if (request.length > 1) {
              attribute = that.get(request[0]);
              if (attribute && angular.isArray(attribute)) {
                var list = [];
                attribute.forEach(function (element) {
                  if (angular.isObject(element) && request[1] in element) {
                    list.push(element[request[1]]);
                  }
                });
                if (list.length) {
                  return list;
                }
              }
            }
          } else {
            return that.get(attribute);
          }
          return undefined;
        };

        /**
        * @param attribute
        * @param item
        * @returns {boolean}
        */
        this.exists = function (attribute, item) {
          if (!item) {
            attribute = that.get(attribute);
            return typeof attribute !== 'undefined' && attribute;
          } else if (typeof attribute === 'string' && item) {
            attribute = that.pluck(attribute);
            if (angular.isArray(attribute)) {
              return typeof attribute.find(function (element) {
                return element === item || (
                  angular.isObject(element) && element.id && element.id === item || _.isEqual(element, item)
                );
              }) !== 'undefined';
            } else {
              return attribute === item || (
                angular.isObject(attribute) && attribute.id && (
                  _.isEqual(attribute, item) || attribute.id === item
                )
              );
            }
          }
          return false;
        };

        /**
        * @type {Function}
        */
        this.destroy = function () {
          // TODO: Add a confirmation option here
          if (that.collection) {
            that.collection.remove(that);
          }
          if (that.get('id')) {
            that.sync('DELETE', {}).catch(function (message) {
              $mdToast.show(
                $mdToast.simple()
                .textContent('Failure to Delete!')
                .toastClass('errorMessage')
                .position('top right')
                .hideDelay(3000)
              );
              console.error('DESTROY:', message);
            });
          }
        };

        /**
        * @type {Function}
        */
        this.initialize = _.once(this.initialize || function () {
          if (that.manifest && !that.get('id')) {
            that.sync('POST', that.meta.has('api') ? {
              meta: that.meta.get('api'),
              payload: {}
            } : {}).catch(function (message) {
              $mdToast.show(
                $mdToast.simple()
                .textContent('Failure to Manifest!')
                .toastClass('errorMessage')
                .position('top right')
                .hideDelay(3000)
              );
              console.error('MANIFEST:', message);
            });
          }
        });
        if (!that.stagger) {
          this.initialize();
        }
      };
    }]);
  }];

}));
