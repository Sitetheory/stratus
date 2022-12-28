// Trigger Directive
// -----------------

// Runtime
import {isUndefined} from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    IAttributes,
    IAugmentedJQuery,
    ICompiledExpression,
    INgModelController,
    IParseService,
    IScope
} from 'angular'
import {StratusDirective} from './baseNew'
import {safeUniqueId} from '@stratusjs/core/misc'

export type TriggerScope = IScope & {
    uid: string
    elementId: string
    initialized: boolean
    trigger: ICompiledExpression
}

// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'trigger'

// This directive intends to handle binding of a model to a function,
// triggered upon true
Stratus.Directives.Trigger = (
    $parse: IParseService
): StratusDirective => ({
    restrict: 'A',
    require: 'ngModel',
    link: (
        $scope: TriggerScope,
        $element: IAugmentedJQuery & any,
        $attrs: IAttributes,
        ngModel: INgModelController
    ) => {
        // Initialize
        // const $ctrl: any = this
        $scope.uid = safeUniqueId(packageName, moduleName, directiveName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $element.elementId || $scope.uid
        $scope.initialized = false

        // Watch Trigger
        $scope.trigger = null
        $scope.$watch(() => $attrs.stratusTrigger,
            (newValue: any) => {
                if (isUndefined(newValue)) {
                    return
                }
                $scope.trigger = $parse($attrs.stratusTrigger)
            })

        // Watch ngModel
        $scope.$watch(() => ngModel.$modelValue,
            (newValue: any) => {
                if (isUndefined(newValue)) {
                    return
                }
                if (!$scope.trigger) {
                    console.error('unable to trigger:', $scope)
                    return
                }
                $scope.trigger($scope)
            })
    }
})
