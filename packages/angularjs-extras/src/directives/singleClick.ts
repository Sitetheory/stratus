// SingleClick Directive
// -----------------

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAugmentedJQuery,
    IAttributes,
    IParseService,
    IScope
} from 'angular'
import {StratusDirective} from './baseNew'

Stratus.Directives.SingleClick = (
    // $log: ILogService,
    $parse: IParseService
): StratusDirective => ({
    restrict: 'A',
    link: (
        $scope: IScope,
        $element: IAugmentedJQuery,
        $attrs: IAttributes,
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
