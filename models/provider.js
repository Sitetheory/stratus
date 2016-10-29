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
        factory(root.Stratus, root.angular);
    }
}(this, function (Stratus, angular) {

    // Angular Model
    // -------------

    // This Model Service handles data binding for a single object with the $http Service
    Stratus.Models.Provider = ['$provide', function ($provide) {
        $provide.factory('model', function ($http) {
            return function (options) {
                this.entity = null;
                if (options && typeof (options) == 'object') {
                    angular.extend(this, options);
                }
                this.url = '/Api';
                this.attributes = {};

                // Generate URL
                if (this.entity) {
                    this.url += '/' + Stratus.Tools.UpperFirst(this.entity);
                }

                // Contextual Hoisting
                var that = this;

                // Current ID
                this.id = function () {
                    return (that.attributes && typeof (that.attributes) === 'object' && that.attributes.id) ? that.attributes.id : null;
                };

                // Handle Convoy
                this.sync = function (action) {
                    var prototype = {
                        method: action || 'GET',
                        url: that.id() ? that.url + '/' + that.id() : that.url,
                        headers: {
                            action: action || 'GET'
                        }
                    };
                    return $http(prototype);
                };
                this.error = function (response) {
                    console.error(response);
                };
                this.fetch = function (callback) {
                    if (typeof (callback) !== 'function') callback = function () {};
                    that.sync().then(function (response) {
                        if (response.status == '200') {
                            that.meta = response.data.meta || {};
                            that.attributes = response.data.payload || response.data;
                            callback();
                        } else {
                            that.error(response);
                        }
                    }, that.error);
                };
            };
        });
    }];

}));
