// Trigger Directive
// -----------------

// Runtime
import _ from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    IAttributes,
    IScope,
    INgModelController,
    IParseService
} from 'angular'

// Angular 1 Modules
import 'angular-material'

// Environment
// const min = !cookie('env') ? '.min' : ''
const name = 'trigger'
// const localPath = '@stratusjs/angularjs-extras/src/directives'

// This directive intends to handle binding of a model to a function,
// triggered upon true
Stratus.Directives.Trigger = (
    $parse: IParseService
) => ({
    restrict: 'A',
    require: 'ngModel',
    link: (
        $scope: IScope & any,
        $element: JQLite & any,
        $attrs: IAttributes & any,
        ngModel: INgModelController
    ) => {
        // Initialize
        const $ctrl: any = this
        $ctrl.uid = _.uniqueId(_.snakeCase(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $element.elementId || $ctrl.uid
        $scope.initialized = false

        // Watch Trigger
        $scope.trigger = null
        $scope.$watch(() => $attrs.stratusTrigger,
            (newValue: any) => {
                if (_.isUndefined(newValue)) {
                    return
                }
                $scope.trigger = $parse($attrs.stratusTrigger)
            })

        // Watch ngModel
        $scope.$watch(() => ngModel.$modelValue,
            (newValue: any) => {
                if (_.isUndefined(newValue)) {
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
