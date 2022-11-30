// Drop Directive
// -----------------

// Runtime
import {uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAugmentedJQuery,
    ILogService,
    IScope
} from 'angular'


// Environment
// const min = !cookie('env') ? '.min' : ''
const name = 'drop'
// const localPath = '@stratusjs/angularjs-extras/src/directives'

Stratus.Directives.Drop = (
    $log: ILogService,
    // $parse: IParseService
) => ({
    restrict: 'A',
    scope: {
        ngModel: '=ngModel'
    },
    link: (
        $scope: IScope,
        $element: IAugmentedJQuery,
    ) => {
        // Initialize
        Stratus.Instances[uniqueId(name + '_')] = $scope
        $log.log('drop:', $element)
    },
})
