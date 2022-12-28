// Max Length Directive
// -----------------

// Runtime
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    IAttributes,
    IAugmentedJQuery,
    IScope,
    INgModelController,
    // IParseService
} from 'angular'

// Angular 1 Modules
import {StratusDirective} from './baseNew'
import {safeUniqueId} from '@stratusjs/core/misc'

export type MaxLengthScope = IScope & {
    uid: string
    elementId: string
    initialized: boolean
}

// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'maxLength'

// This directive blocks input beyond the md-maxlength limit,
// which solves a core issue in Angular Material where data
// bound by an data-ng-model directive gets completely removed if
// the input field goes beyond the maxlength character limit.
Stratus.Directives.MaxLength = (
    // $parse: IParseService
): StratusDirective => ({
    restrict: 'A',
    require: 'ngModel',
    link: (
        $scope: MaxLengthScope,
        $element: IAugmentedJQuery & any,
        $attrs: IAttributes,
        ngModel: INgModelController
    ) => {
        // Initialize
        $scope.uid = safeUniqueId(packageName, moduleName, directiveName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $element.elementId || $scope.uid
        $scope.initialized = false

        // Force Max Length in ngModel Parser
        const maxLength = Number($attrs.stratusMaxLength || $attrs.mdMaxlength)
        if (!maxLength) {
            console.warn(`unable to set max length on instance ${$scope.uid} via stratus-max-length or md-maxlength attributes.`)
            return
        }
        ngModel.$parsers.push((data: string) => {
            if (data.length <= maxLength) {
                return data
            }
            const truncated = data.substring(0, maxLength)
            ngModel.$setViewValue(truncated)
            ngModel.$render()
            return truncated
        })
    }
})
