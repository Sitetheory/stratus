// Href Directive
// -----------------

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAugmentedJQuery,
    IAttributes,
    ILocationService,
    ILogService,
    IScope,
    IParseService
} from 'angular'
import {StratusDirective} from './baseNew'
import {safeUniqueId} from '@stratusjs/core/misc'

// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'href'

export type HrefScope = IScope & {
    href?: string
}

// This directive intends to handle binding of a dynamic variable to
Stratus.Directives.Href = (
    $location: ILocationService,
    $log: ILogService,
    $parse: IParseService
): StratusDirective => ({
    restrict: 'A',
    link: (
        $scope: HrefScope,
        $element: IAugmentedJQuery,
        $attrs: IAttributes
    ) => {
        // Initialize
        Stratus.Instances[safeUniqueId(packageName, moduleName, directiveName)] = $scope
        $scope.href = null

        if ($attrs.stratusHref) {
            const href = $parse($attrs.stratusHref)
            $scope.$watch('$parent', newValue => {
                if (typeof newValue !== 'undefined') {
                    $scope.href = href($scope.$parent)
                    $log.log('stratus-href:', href($scope.href))
                }
            })
            $element.bind('click', () => {
                $scope.$applyAsync(() => {
                    if ($scope.href) {
                        $location.path($scope.href)
                    }
                })
            })
        }
    }
})
