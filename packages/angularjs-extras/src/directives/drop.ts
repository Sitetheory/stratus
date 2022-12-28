// Drop Directive
// -----------------

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAugmentedJQuery,
    ILogService,
    IScope
} from 'angular'
import {StratusDirective} from './baseNew'
import {safeUniqueId} from '@stratusjs/core/misc'


// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'drop'

Stratus.Directives.Drop = (
    $log: ILogService,
    // $parse: IParseService
): StratusDirective => ({
    restrict: 'A',
    scope: {
        ngModel: '=ngModel'
    },
    link: (
        $scope: IScope,
        $element: IAugmentedJQuery,
    ) => {
        // Initialize
        Stratus.Instances[safeUniqueId(packageName, moduleName, directiveName)] = $scope
        $log.log('drop:', $element)
    },
})
