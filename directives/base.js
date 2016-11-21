//     Stratus.Directives.Base.js 1.0

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

// Stratus Base Directive
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'angular'], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {
    // This directive intends to provide basic logic for extending
    // the Stratus Auto-Loader for various contextual uses.
    Stratus.Directives.Base = {
        restrict: 'AE',
        scope: {
            ngModel: '='
        },
        link: function ($scope, $element) {
            console.log($scope, $element);
        },
        template: '<div class="noTemplate"></div>'
    };
    angular.module('stratus-base', [])
        .directive('stratusBase', function ($compile) {
            return Stratus.Directives.Base;
        });
}));
