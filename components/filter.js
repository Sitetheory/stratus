//     Stratus.Components.Filter.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
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

// Stratus Filter Component
// ------------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'angular', 'stratus.services.registry', 'angular-material'], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {
    // This component handles filtering for a collection
    Stratus.Components.Filter = {
        bindings: {
            ngModel: '=',
            target: '@'
        },
        controller: function ($scope, $attrs, registry) {
            Stratus.Instances[_.uniqueId('filter')] = $scope;
            $scope.collection = ($scope.$parent && $scope.$parent.collection) ? $scope.$parent.collection : null;
            $scope.query = '';
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/filter' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
