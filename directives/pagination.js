//     Stratus.Directives.Pagination.js 1.0

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

// Stratus Pagination Directive
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'moment', 'angular'], factory);
    } else {
        factory(root.Stratus, root.moment);
    }
}(this, function (Stratus, moment) {
    // This directive intends to handle binding and
    // full pagination for the scope's collection.
    Stratus.Directives.Pagination = {
        restrict: 'AE',
        link: function ($scope) {
            // TODO: collection.meta.attributes.pageTotal
            console.log('scope:', $scope);
            console.log('parent:', $scope.$parent);
        },
        template: 'coming soon!'
    };
    angular.module('stratus-pagination', [])
        .directive('stratusPagination', function ($compile) {
            return Stratus.Directives.Pagination;
        });
}));
