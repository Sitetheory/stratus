// Max Length Directive
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
const name = 'maxLength'
// const localPath = '@stratusjs/angularjs-extras/src/directives'

// This directive blocks input beyond the md-maxlength limit,
// which solves a core issue in Angular Material where data
// bound by an ng-model directive gets completely removed if
// the input field goes beyond the maxlength character limit.
Stratus.Directives.MaxLength = (
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

        // Force Max Length in ngModel Parser
        const maxLength = Number($attrs.stratusMaxLength || $attrs.mdMaxlength)
        if (!maxLength) {
            console.warn(`unable to set max length on instance ${$ctrl.uid} via stratus-max-length or md-maxlength attributes.`)
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
