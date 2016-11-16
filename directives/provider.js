//     Stratus.Views.Provider.js 1.0

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

    // Angular Directive Provider
    // --------------------------

    // This View Service handles element binding for a single scope and element
    Stratus.Directives.Provider = ['$provide', function ($provide) {
        $provide.factory('view', function ($scope, $element) {
            return function (options) {
                this.promise = null;
                this.initialize = function (options) {
                    console.log('element:', $element);
                    console.log('options:', options);
                };
                this.initialize(options);
            };
        });
    }];

}));
