//     Stratus.Directives.Trigger.js 1.0

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

// Stratus Trigger Directive
// ----------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {
    // This directive intends to handle binding of a model to a function, triggered upon true
    Stratus.Directives.Trigger = function ($parse, $log) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, $element, $attrs, ngModel) {
                Stratus.Instances[_.uniqueId('trigger_')] = $scope;
                $scope.$watch(function () {
                    return ngModel.$modelValue;
                }, function (newValue) {
                    if (typeof newValue !== 'undefined' && $attrs.stratusTrigger) {
                        ($parse($attrs.stratusTrigger))($scope.$parent);
                    }
                });
            }
        };
    };
}));
