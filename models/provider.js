//     Stratus.Models.Provider.js 1.0

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
        define(['stratus', 'angular'], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {

    // Angular Model
    // -------------

    // This Model Service handles data binding for a single object with the $http Service
    Stratus.Models.Provider = ['$provide', function ($provide) {
        $provide.factory('model', function ($q, $http) {
            return function (options, attributes) {

                // Build Environment
                this.entity = null;
                if (options && typeof options == 'object') {
                    angular.extend(this, options);
                }
                this.url = '/Api';
                this.attributes = {};
                if (attributes && typeof attributes == 'object') {
                    angular.extend(this.attributes, attributes);
                }

                // Generate URL
                if (this.entity) {
                    this.url += '/' + Stratus.Tools.UpperFirst(this.entity);
                }

                // Contextual Hoisting
                var that = this;

                /**
                 * @param action
                 * @returns {*}
                 */
                this.sync = function (action) {
                    var prototype = {
                        method: action || 'GET',
                        url: that.get('id') ? that.url + '/' + that.get('id') : that.url,
                        headers: {
                            action: action || 'GET'
                        }
                    };
                    return $http(prototype);
                };

                /**
                 * @returns {*}
                 */
                this.fetch = function () {
                    return $q(function (resolve, reject) {
                        that.sync().then(function (response) {
                            if (response.status == '200') {
                                that.meta = response.data.meta || {};
                                that.attributes = response.data.payload || response.data;
                                resolve(that.attributes);
                            } else {
                                reject(response);
                            }
                        }, reject);
                    });
                };

                // Attribute Functions

                /**
                 * @param attribute
                 * @returns {*}
                 */
                this.get = function (attribute) {
                    if (typeof attribute !== 'string' || !that.attributes || typeof that.attributes !== 'object') {
                        return undefined;
                    } else {
                        return attribute.split('.').reduce(function (attributes, a) {
                            return attributes && attributes[a];
                        }, that.attributes);
                    }
                };

                /**
                 * @param attribute
                 * @param item
                 * @returns {*}
                 */
                this.toggle = function (attribute, item) {
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
                                    return element === item || (angular.isObject(element) && element.id && element.id === item);
                                }) !== 'undefined';
                        }
                    }
                    return false;
                };
            };
        });
    }];

}));
