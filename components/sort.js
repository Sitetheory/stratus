//     Stratus.Components.Sort.js 1.0

//     Copyright (c) 2017 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of $scope information or reproduction of $scope
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

// Stratus Sort Component
// ------------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'angular', 'stratus.services.registry', 'angular-material'], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {
    // This component handles sorting for a collection
    Stratus.Components.Sort = {
        bindings: {
            ngModel: '=',
            target: '@'
        },
        controller: function ($scope, $attrs, registry) {
            Stratus.Instances[_.uniqueId('sort')] = $scope;
            $scope.collection = ($scope.$parent && $scope.$parent.collection) ? $scope.$parent.collection : null;
            $scope.query = '';
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/sort' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
