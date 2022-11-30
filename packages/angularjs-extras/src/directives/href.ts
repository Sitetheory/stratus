// Href Directive
// -----------------

// Runtime
import {uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAugmentedJQuery,
    IAttributes,
    ILocationService,
    ILogService,
    IScope,
    IParseService
} from 'angular'

// Environment
// const min = !cookie('env') ? '.min' : ''
const name = 'href'
// const localPath = '@stratusjs/angularjs-extras/src/directives'

export type HrefScope = IScope & {
    href?: string
}

// This directive intends to handle binding of a dynamic variable to
Stratus.Directives.Href = (
    $location: ILocationService,
    $log: ILogService,
    $parse: IParseService
) => ({
    restrict: 'A',
    link: (
        $scope: HrefScope,
        $element: IAugmentedJQuery,
        $attrs: IAttributes
    ) => {
        // Initialize
        Stratus.Instances[uniqueId(name + '_')] = $scope
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
