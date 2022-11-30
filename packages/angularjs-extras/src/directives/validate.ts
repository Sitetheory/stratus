// Validate Directive
// -----------------
// Usage: The Validate directive enhances Angular's validation and data-ng-messages
// system to allow custom validation in addition to the defaults like
// `required`, `min`, `max`, `email`, etc. This validate adds several new
// validations that can be triggered for inputs by including the requirements
// as options.

// - string|array `validateInvalid` One or more invalid values not allowed. Can
// include scope variables that will be evaluated, e.g.
// `validate-invalid='[model.data.nominatorName, "foo"]'` - string|array
// `validateValid` One or more values that are valid. - string
// `validateComparison` A scope variable comparison that will be evaluated,
// e.g. `model.data.nominatorName != model.data.nomineeName`. NOTE: if the
// comparison value evaluates the current model value, e.g.
// model.data.nomineeName this is evaluates after the viewValue is updated but
// BEFORE the model is updated, so it won't work with the timing.

// The data-ng-message validate key will be set if a specific validation fails. If
// more than one validation scheme is set, we will also show if any of them
// fail: - `validateComparison`: if the comparison was false. -
// `validateInvalid`: if an invalid value was provided. - `validateValid`: if a
// valid value was not provided. - `validateAny`: if any of the validations
// fail.

// Example:
// <input name="nomineeName" data-ng-model="model.data.fooName" placeholder=""
// required stratus-validate validate-comparison="model.data.fooName !=
// model.data.barName" validate-invalid="['baz', 'rab']"> <div
// data-ng-messages="Nominate.nomineeName.$error" data-ng-messages-multiple role="alert">
// <div data-ng-message="required">Please enter a name.</div> <div
// data-ng-message="validateComparison">Please do not nominate yourself.</div> <div
// data-ng-message="validateInvalid">Baz and Rab are not valid values.</div> <div
// data-ng-message="validateAny">Ya you really messed up.</div> </div>

// Runtime
import {every, forEach, includes, isArray, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAugmentedJQuery,
    IAttributes,
    IScope,
    INgModelController
} from 'angular'

// Environment
// const min = !cookie('env') ? '.min' : ''
const name = 'validate'
// const localPath = '@stratusjs/angularjs-extras/src/directives'

export type ValidateScope = IScope & {
    checks: {
        validateComparison?: boolean
        validateInvalid?: boolean
        validateValid?: boolean
    }
    validateComparison?: boolean
    validateInvalid?: string | string[] | number | number[]
    validateValid?: string | string[] | number | number[]
}

Stratus.Directives.Validate = (
    // $parse: IParseService
) => ({
    restrict: 'A',
    require: 'ngModel',
    scope: {
        validateValid: '=validateValid',
        validateInvalid: '=validateInvalid',
        validateComparison: '=validateComparison'
    },
    link: (
        $scope: ValidateScope,
        $element: IAugmentedJQuery,
        $attrs: IAttributes,
        $ctrl: INgModelController
    ) => {
        // Initialize
        Stratus.Instances[uniqueId(name + '_')] = $scope

        // Check Allowed Values
        const checkValues = (ngModelValue: string | number) => {
            $scope.checks = {}

            // Evaluate a comparison function
            // NOTE: if the comparison value evaluates the current model value,
            // e.g. model.data.myField this is evaluates after the viewValue is
            // updated but BEFORE the model is updated.
            if ($attrs.validateComparison) {
                $scope.checks.validateComparison = !$scope.validateComparison
            }

            // Check valid and invalid values
            if ($scope.validateInvalid) {
                $scope.checks.validateInvalid = !includes(
                    isArray($scope.validateInvalid)
                        ? $scope.validateInvalid
                        : [$scope.validateInvalid], ngModelValue)
            } else if ($scope.validateValid) {
                $scope.checks.validateValid = includes(
                    isArray($scope.validateValid)
                        ? $scope.validateValid
                        : [$scope.validateValid], ngModelValue)
            }

            forEach($scope.checks, (el, key) => {
                if ($ctrl && $ctrl.$setValidity) {
                    $ctrl.$setValidity(key, el)
                }
            })
            if ($ctrl && $ctrl.$setValidity) {
                $ctrl.$setValidity('validateAny', every($scope.checks))
            }

            // return a value to display to user
            return ngModelValue
        }

        $ctrl.$parsers.push(checkValues)
    }
})
