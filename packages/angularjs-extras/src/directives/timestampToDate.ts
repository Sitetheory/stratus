// TimestampToDate Directive
// -----------------

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAugmentedJQuery,
    IAttributes,
    INgModelController,
    IScope
} from 'angular'
import {StratusDirective} from './baseNew'
import {safeUniqueId} from '@stratusjs/core/misc'

// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'timestampToDate'

export type TimestampToDateScope = IScope & {
    format?: string
}

/**
 * This directive intends to handle binding of a model to convert value as
 * timestamp to date, the value is persisted into data-ng-model still timestamp
 * type.
 */
Stratus.Directives.TimestampToDate = (): StratusDirective => ({
    restrict: 'A',
    require: 'ngModel',
    scope: {
        format: '<'
    },
    link: (
        $scope: TimestampToDateScope,
        $element: IAugmentedJQuery,
        $attrs: IAttributes,
        ngModel: INgModelController
    ) => {
        Stratus.Instances[safeUniqueId(packageName, moduleName, directiveName)] = $scope
        $scope.format = $scope.format || 'yyyy/MM/dd'
        ngModel.$parsers.push(value => new Date(value).getTime() / 1000)
        ngModel.$formatters.push(value => new Date(value * 1000))
    },
})
