// TimestampToDate Directive
// -----------------

// Runtime
import {snakeCase, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAugmentedJQuery,
    IAttributes,
    INgModelController,
    IScope
} from 'angular'

// Environment
const name = 'baseNew'

export type TimestampToDateScope = IScope & {
    format?: string
}

/**
 * This directive intends to handle binding of a model to convert value as
 * timestamp to date, the value is persisted into data-ng-model still timestamp
 * type.
 */
Stratus.Directives.TimestampToDate = () => ({
    restrict: 'A',
    require: 'ngModel',
    scope: {
        format: '<'
    },
    link: (
        $attrs: IAttributes,
        $element: IAugmentedJQuery,
        $scope: TimestampToDateScope,
        ngModel: INgModelController
    ) => {
        Stratus.Instances[uniqueId(snakeCase(name) + '_')] = $scope
        $scope.format = $scope.format || 'yyyy/MM/dd'
        ngModel.$parsers.push(value => new Date(value).getTime() / 1000)
        ngModel.$formatters.push(value => new Date(value * 1000))
    },
})