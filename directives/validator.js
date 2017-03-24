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
        define(['stratus', 'underscore', 'angular'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {

    Stratus.Directives.Validator = function($parse) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                validatorValid: '=validatorValid',
                validatorInvalid: '=validatorInvalid',
                validatorComparison: '=validatorComparison'
            },
            link: function($scope, $element, $attrs, $ctrl) {
                Stratus.Instances[_.uniqueId('validator_')] = $scope;

                var validatorComparison = $attrs.validatorComparison ? $parse($attrs.validatorComparison): null;

                // Check Allowed Values
                function allowedValues(ngModelValue) {

                    var checks = {};

                    // Evaluate a comparison function
                    if (validatorComparison) {
                        checks.validatorComparison = !validatorComparison($scope.$parent);
                    }

                    // Check valid and invalid values
                    if($scope.validatorInvalid) {
                        checks.validatorInvalid = !_.contains(_.isArray($scope.validatorInvalid) ? $scope.validatorInvalid : [$scope.validatorInvalid], ngModelValue);
                    } else if($scope.validatorValid) {
                        checks.validatorValid = _.contains(_.isArray($scope.validatorValid) ? $scope.validatorValid : [$scope.validatorValid], ngModelValue);
                    }

                    _.each(checks, function(el, key) {
                        $ctrl.$setValidity(key, el);
                    });
                    $ctrl.$setValidity('validatorAny', _.every(checks));

                    // return a value to display to user
                    return ngModelValue;
                }

                $ctrl.$parsers.push(allowedValues);
            }
        };
    };

}));


