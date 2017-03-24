//     Stratus.Directives.Validate.js 1.0

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

// Stratus Validate Directive
// ----------------------

// Usage: The Validate directive enhances Angular's validation and ng-messages system to allow custom validation in addition to
// the defaults like `required`, `min`, `max`, `email`, etc. This validate adds several new validations that can be
// triggered for inputs by including the requirements as options.

// - string|array `validateInvalid` One or more invalid values not allowed. Can include scope variables that will be evaluated, e.g. `validate-invalid='[model.data.nominatorName, "foo"]'`
// - string|array `validateValid` One or more values that are valid.
// - string `validateComparison` A scope variable comparison that will be evaluated, e.g. `model.data.nominatorName != model.data.nomineeName`. NOTE: if the comparison value evaluates the current model value, e.g. model.data.nomineeName this is evaluates after the viewValue is updated but BEFORE the model is updated, so it won't work with the timing.

// The ng-message validate key will be set if a specific validation fails. If more than one validation scheme is set, we will also show if any of them fail:
// - `validateComparison`: if the comparison was false.
// - `validateInvalid`: if an invalid value was provided.
// - `validateValid`: if a valid value was not provided.
// - `validateAny`: if any of the validations fail.

// Example:
// <input name="nomineeName" ng-model="model.data.fooName" placeholder="" required stratus-validate validate-comparison="model.data.fooName != model.data.barName" validate-invalid="['baz', 'rab']">
//    <div ng-messages="Nominate.nomineeName.$error" ng-messages-multiple role="alert">
//    <div ng-message="required">Please enter a name.</div>
//    <div ng-message="validateComparison">Please do not nominate yourself.</div>
//    <div ng-message="validateInvalid">Baz and Rab are not valid values.</div>
//    <div ng-message="validateAny">Ya you really messed up.</div>
// </div>

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'underscore', 'angular'], factory);
    } else {
        factory(root.Stratus, root._);
    }
}(this, function (Stratus, _) {

    Stratus.Directives.Validate = function ($parse) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                validateValid: '=validateValid',
                validateInvalid: '=validateInvalid',
                validateComparison: '=validateComparison'
            },
            link: function ($scope, $element, $attrs, $ctrl) {
                Stratus.Instances[_.uniqueId('validate_')] = $scope;

                // Check Allowed Values
                function checkValues(ngModelValue) {

                    $scope.checks = {};

                    // Evaluate a comparison function
                    // NOTE: if the comparison value evaluates the current model value, e.g. model.data.myField
                    // this is evaluates after the viewValue is updated but BEFORE the model is updated.
                    if ($attrs.validateComparison) {
                        $scope.checks.validateComparison = !$scope.validateComparison;
                    }

                    // Check valid and invalid values
                    if ($scope.validateInvalid) {
                        $scope.checks.validateInvalid = !_.contains(_.isArray($scope.validateInvalid) ? $scope.validateInvalid : [$scope.validateInvalid], ngModelValue);
                    } else if ($scope.validateValid) {
                        $scope.checks.validateValid = _.contains(_.isArray($scope.validateValid) ? $scope.validateValid : [$scope.validateValid], ngModelValue);
                    }

                    _.each($scope.checks, function (el, key) {
                        $ctrl.$setValidity(key, el);
                    });
                    $ctrl.$setValidity('validateAny', _.every($scope.checks));

                    // return a value to display to user
                    return ngModelValue;
                }

                $ctrl.$parsers.push(checkValues);

            }
        };
    };

}));

