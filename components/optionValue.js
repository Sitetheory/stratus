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
        define(['stratus', 'moment', 'angular'], factory);
    } else {
        factory(root.Stratus, root.moment);
    }
}(this, function (Stratus, moment) {
    // This component intends to handle binding of an
    // item array into a particular attribute.
    Stratus.Components.OptionValue = {
        bindings: {
            ngModel: '=',
            custom: '@',
            multiple: '@',
            options: '=',
            type: '@'
        },
        controller: function ($scope, $element, $attrs, $parse) {
            Stratus.Instances[_.uniqueId('option_value_')] = $scope;
            $scope.model = $parse($attrs.ngModel);
            $scope.items = $scope.model($scope.$parent);
            // FIXME: This seems a bit more complex than need be, since ngModel and options are both double bound
            var normalize = function () {
                if (!angular.isArray($scope.items)) $scope.items = [];
                if (!$scope.items.length) $scope.items.push({});
            };
            normalize();
            $scope.$watch('items', function (items) {
                $scope.model.assign($scope.$parent, items);
            }, true);
            $scope.$parent.$watch($attrs.ngModel, function (items) {
                $scope.items = items;
                normalize();
            }, true);
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/optionValue' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));
