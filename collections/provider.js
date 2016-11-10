//     Stratus.Collections.Provider.js 1.0

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
        define(['stratus', 'underscore', 'angular', 'stratus.models.provider'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {

    // Angular Collection
    // ------------------

    // This Collection Service handles data binding for multiple objects with the $http Service
    Stratus.Collections.Provider = ['$provide', function ($provide) {
        $provide.factory('collection', function ($q, $http, $timeout, model) {
            return function (options) {
                this.entity = null;
                this.infinite = false;
                this.threshold = 0.5;
                this.qualifier = ''; // ng-if
                this.decay = 0;

                if (options && typeof options == 'object') {
                    angular.extend(this, options);
                }

                // Infrastructure
                this.url = '/Api';
                this.models = [];
                this.meta = new Stratus.Prototypes.Collection();
                this.model = model;

                // Internals
                this.pending = true;
                this.error = false;
                this.completed = false;

                // Generate URL
                if (this.entity) {
                    this.url += '/' + _.ucfirst(this.entity);
                }

                // Contextual Hoisting
                var that = this;

                // TODO: Abstract this deeper
                /**
                 * @param action
                 * @param data
                 * @returns {*}
                 */
                this.sync = function (action, data) {
                    action = action || 'GET';
                    var prototype = {
                        method: action,
                        url: that.url,
                        headers: {
                            action: action
                        }
                    };
                    if (angular.isDefined(data)) {
                        if (action === 'GET') {
                            if (angular.isObject(data)) {
                                var values = [];
                                angular.forEach(data, function (value, key) {
                                    values.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                                });
                                if (values.length) {
                                    prototype.url += '?' + values.join('&');
                                }
                            }
                        } else {
                            prototype.headers['Content-Type'] = 'application/json';
                            prototype.data = JSON.stringify(data);
                        }
                    }
                    return $http(prototype);
                };

                /**
                 * @param action
                 * @param data
                 * @returns {*}
                 */
                this.fetch = function (action, data) {
                    this.pending = true;
                    return $q(function (resolve, reject) {
                        that.sync(action, data || that.meta.get('api')).then(function (response) {
                            if (response.status == '200') {
                                // Data
                                that.meta.set(response.data.meta);
                                that.models = [];

                                var data = response.data.payload || response.data;
                                if (angular.isArray(data)) {
                                    data.forEach(function (entity) {
                                        that.models.push(new that.model({
                                            entity: that.entity
                                        }, entity));
                                    });
                                }

                                // Internals
                                that.pending = false;
                                that.completed = true;

                                // Promise
                                resolve(that.models);
                            } else {
                                // Internals
                                that.pending = false;
                                that.error = true;

                                // Promise
                                reject(response);
                            }
                        }, reject);
                    });
                };

                /**
                 * @param query
                 * @returns {*|Promise}
                 */
                this.filter = function (query) {
                    that.meta.set('api.q', query);
                    return that.fetch();
                };

                // Infinite Scrolling
                /*
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
                */
            };
        });
    }];

}));
