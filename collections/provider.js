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
        define(['stratus', 'angular', 'promise'], factory);
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
                if (options && typeof (options) == 'object') {
                    angular.extend(this, options);
                }
                this.url = '/Api';
                this.models = [];

                // Generate URL
                if (this.entity) {
                    this.url += '/' + Stratus.Tools.UpperFirst(this.entity);
                }

                // Contextual Hoisting
                var that = this;

                // TODO: Abstract this deeper
                // Handle Convoy
                this.sync = function (action) {
                    var prototype = {
                        method: action || 'GET',
                        url: that.url,
                        headers: {
                            action: action || 'GET'
                        }
                    };
                    return $http(prototype);
                };
                this.error = function (response) {
                    console.error(response);
                };
                this.fetch = function () {
                    return new Promise(function (fulfill, reject) {
                        that.sync().then(function (response) {
                            if (response.status == '200') {
                                that.meta = response.data.meta || {};
                                that.models = response.data.payload || response.data;
                                fulfill(response);
                            } else {
                                reject(response);
                            }
                        }, reject);
                    });
                };
                this.filter = function (query) {
                    console.log('filter:', query);
                };
            };
        });
    }];

}));
