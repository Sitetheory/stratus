// SingleClick Directive
// -----------------

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAugmentedJQuery,
    IAttributes,
    ILogService,
    IParseService,
    IScope
} from 'angular'

Stratus.Directives.SingleClick = (
    $log: ILogService,
    $parse: IParseService
) => ({
    restrict: 'A',
    link: (
        $attrs: IAttributes,
        $element: IAugmentedJQuery,
        $scope: IScope
    ) => {
        const fn = $parse($attrs.stratusSingleClick)
        const delay = 300
        let clicks = 0
        let timer: ReturnType<typeof setTimeout> = null
        $element.on('click', event => {
            clicks++

            // count clicks
            if (clicks === 1) {
                timer = setTimeout(() => {
                    $scope.$applyAsync(() => {
                        fn($scope, { $event: event })
                    })
                    clicks = 0
                }, delay)
            } else {
                clearTimeout(timer)
                clicks = 0
            }
        })
    }
})
