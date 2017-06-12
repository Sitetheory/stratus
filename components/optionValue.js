//     Stratus.Components.OptionValue.js 1.0

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

// Stratus OptionValue Component
// -----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'angular'], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {
    // This component intends to handle binding of an
    // item array into a particular attribute.
    Stratus.Components.OptionValue = {
        bindings: {
            ngModel: '=',
            multiple: '<',
            options: '=',
            type: '@'
        },
        controller: function ($scope) {
            Stratus.Instances[_.uniqueId('option_value_')] = $scope;
            $scope.items = [];
            var normalize = function () {
                if (!angular.isArray($scope.items)) {
                    $scope.items = [];
                }
                if (!$scope.items.length) {
                    $scope.items.push({});
                }
            };
            normalize();
            $scope.$parent.$watch(function () {
                return $scope.$ctrl.ngModel;
            }, function (items) {
                if (items !== $scope.items) {
                    $scope.items = items;
                    normalize();
                }
            }, true);
            $scope.$watch('items', function (items) {
                $scope.$ctrl.ngModel = items;
            }, true);
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/optionValue' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
