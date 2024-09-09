// Embed Component
// ---------------

// Runtime
import {Stratus} from '@stratusjs/runtime/stratus'
import {IAttributes, IAugmentedJQuery, IScope} from 'angular'

// Angular 1 Modules
import 'angular-material'
import {LooseObject, safeUniqueId} from '@stratusjs/core/misc'

// Stratus Dependencies
// import {cookie} from '@stratusjs/core/environment'

// Environment
// const min = !cookie('env') ? '.min' : ''
// const name = 'embed'
const packageName = 'angularjs-extras'
const moduleName = 'components'
const componentName = 'embed'
// const localPath = '@stratusjs/angularjs-extras/src/components'

// This component is just a simple twitter feed.
Stratus.Components.TwitterFeed = {
    bindings: {
        // Basic Control for Designers
        elementId: '@',

        // Scripts
        scripts: '=',
    },
    controller(
        $scope: IScope&LooseObject,
        $attrs: IAttributes,
        $element: IAugmentedJQuery
    ) {
        // Initialize
        // const $ctrl = this
        // $scope.uid = _.uniqueId(_.snakeCase(name) + '_')
        $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $attrs.elementId || $scope.uid
        $scope.initialized = false

        // Initialization
        $scope.initialize = async () => {
            if ($scope.initialized) {
                return
            }
            $scope.initialized = true
            console.log('embed initialized!')
        }
        $scope.initialize()
    },
    template: '<div id="{{ elementId }}"></div>'
}
