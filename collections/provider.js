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
        define(['stratus', 'angular', 'promise', 'stratus.models.provider'], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {

    // Angular Collection
    // ------------------

    // This Collection Service handles data binding for multiple objects with the $http Service
    Stratus.Collections.Provider = ['$provide', function ($provide) {
        $provide.factory('collection', function ($http) {
            return function (options) {
                this.entity = null;
                if (options && typeof options == 'object') {
                    angular.extend(this, options);
                }

                // Infrastructure
                this.url = '/Api';
                this.models = [];
                this.meta = new Stratus.Prototypes.Collection();

                // Internals
                this.pending = true;
                this.error = false;
                this.completed = false;

                // Generate URL
                if (this.entity) {
                    this.url += '/' + Stratus.Tools.UpperFirst(this.entity);
                }

                // Contextual Hoisting
                var that = this;

                // TODO: Abstract this deeper
                // Handle Convoy
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
                this.fetch = function (action, data) {
                    this.pending = true;
                    return new Promise(function (fulfill, reject) {
                        that.sync(action, data || that.meta.get('api')).then(function (response) {
                            if (response.status == '200') {
                                // Data
                                that.meta.set(response.data.meta);
                                that.models = [];

                                angular.forEach(response.data.payload || response.data, function (model) {
                                    /* FIXME: It seems difficult to call an Angular Service within another.
                                    that.models.push(new Stratus.Models.Prototype({
                                        'entity': that.entity
                                    }, model));
                                    */
                                    that.models.push({ attributes: model });
                                });

                                // Internals
                                that.pending = false;
                                that.completed = true;

                                // Promise
                                fulfill(response);
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
                this.filter = function (query) {
                    this.meta.set('api.q', query);
                    console.log('query:', query);
                    return this.fetch();
                };
            };
        });
    }];

}));
