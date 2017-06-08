//     Stratus.Services.Collection.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
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
        define(['stratus', 'underscore', 'angular', 'angular-material', 'stratus.services.model'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {

    // Angular Collection Service
    // --------------------------

    // This Collection Service handles data binding for multiple objects with the $http Service
    Stratus.Services.Collection = ['$provide', function ($provide) {
        $provide.factory('collection', ['$q', '$http', '$mdToast', '$timeout', 'model', function ($q, $http, $mdToast, $timeout, model) {
            return function (options) {

                // Environment
                this.target = null;
                this.infinite = false;
                this.threshold = 0.5;
                this.qualifier = ''; // ng-if
                this.decay = 0;

                if (options && typeof options === 'object') {
                    angular.extend(this, options);
                }

                // Infrastructure
                this.urlRoot = '/Api';
                this.models = [];
                this.meta = new Stratus.Prototypes.Model();
                this.model = model;

                // Internals
                this.pending = false;
                this.error = false;
                this.completed = false;
                this.paginate = false;

                // Generate URL
                if (this.target) {
                    this.urlRoot += '/' + _.ucfirst(this.target);
                }

                // Contextual Hoisting
                var that = this;

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

                /**
                 * @returns {*}
                 */
                this.url = function () {
                    return that.urlRoot;
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
                                that.models = [];

                                var data = response.data.payload || response.data;
                                if (angular.isArray(data)) {
                                    // TODO: Make this able to be flagged as direct entities
                                    data.forEach(function (target) {
                                        // TODO: Add references to the Catalog when creating these models
                                        that.models.push(new model({ collection: that }, target));
                                    });
                                }

                                // Internals
                                that.pending = false;
                                that.completed = true;
                                that.paginate = false;

                                // Promise
                                resolve(response.data.payload);
                            } else {
                                // Internals
                                that.pending = false;
                                that.error = true;

                                // Promise
                                reject((response.statusText && response.statusText !== 'OK') ? response.statusText : (
                                    angular.isObject(response.data) ? response.data : (
                                        'Invalid Payload: ' + prototype.method + ' ' + prototype.url
                                    )
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
                    return that.sync(action, data || that.meta.get('api')).catch(
                        function (message) {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('Failure to Fetch!')
                                    .toastClass('errorMessage')
                                    .position('top right')
                                    .hideDelay(3000)
                            );
                            console.error('FETCH:', message);
                        }
                    );
                };

                /**
                 * @param query
                 * @returns {*}
                 */
                this.filter = function (query) {
                    that.meta.set('api.q', angular.isDefined(query) ? query : '');
                    return that.fetch();
                };

                /**
                 * @type {Function}
                 */
                this.throttle = _.throttle(this.fetch, 1000);

                /**
                 * @param query
                 * @returns {*}
                 */
                this.throttleFilter = function (query) {
                    that.meta.set('api.q', angular.isDefined(query) ? query : '');
                    return $q(function (resolve, reject) {
                        var request = that.throttle();
                        console.log('request:', request);
                        request.then(function (models) {
                            console.log('throttled:', _.map(models, function (model) {
                                return model.domainPrimary;
                            }));
                            resolve(models);
                        }).catch(reject);
                    });
                };

                /**
                 * @param page
                 * @returns {*}
                 */
                this.page = function (page) {
                    that.paginate = true;
                    that.meta.set('api.p', page);
                    return that.fetch();
                };

                /**
                 * @returns {Array}
                 */
                this.toJSON = function () {
                    var sanitized = [];
                    that.models.forEach(function (model) {
                        if (typeof model.toJSON === 'function') {
                            sanitized.push(model.toJSON());
                        }
                    });
                    return sanitized;
                };

                /**
                 * @param target
                 * @param options
                 */
                this.add = function (target, options) {
                    if (!options || typeof options != 'object') options = {};
                    if (angular.isObject(target)) {
                        target = (target instanceof model) ? target : new model({
                            collection: that
                        }, target);
                        that.models.push(target);
                        if (options.save) target.save();
                    }
                };

                /**
                 * @param target
                 */
                this.remove = function (target) {
                    that.models.splice(that.models.indexOf(target), 1);
                };

                /**
                 * @param attribute
                 * @returns {Array}
                 */
                this.pluck = function (attribute) {
                    return _.map(that.models, function (element) {
                        return element instanceof model ? element.pluck(attribute) : null;
                    });
                };

                /**
                 * @param attribute
                 * @returns {boolean}
                 */
                this.exists = function (attribute) {
                    return !!_.reduce(that.pluck(attribute) || [], function (memo, data) {
                        return memo || angular.isDefined(data);
                    });
                };

                // Infinite Scrolling
                /* *
                this.infiniteModels = {
                    numLoaded_: 0,
                    toLoad_: 0,

                    // Required.
                    getItemAtIndex: function (index) {
                        if (index > this.numLoaded_) {
                            this.fetchMoreItems_(index);
                            return null;
                        }

                        return index;
                    },

                    // Required.
                    // For infinite scroll behavior, we always return a slightly higher
                    // number than the previously loaded items.
                    getLength: function () {
                        return this.numLoaded_ + 5;
                    },

                    fetchMoreItems_: function (index) {
                        // For demo purposes, we simulate loading more items with a timed
                        // promise. In real code, this function would likely contain an
                        // $http request.

                        if (this.toLoad_ < index) {
                            this.toLoad_ += 20;
                            $timeout(angular.noop, 300).then(angular.bind(this, function () {
                                this.numLoaded_ = this.toLoad_;
                            }));
                        }
                    }
                }
                /* */
            };
        }]);
    }];

}));
