// Embed Component
// ---------------

// Runtime
import * as _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Angular 1 Modules
import 'angular-material'

// Stratus Dependencies
import {camelToSnake, sanitize} from '@stratusjs/core/conversion'
import {IAttributes} from 'angular'

// Environment
const min = Stratus.Environment.get('production') ? '.min' : ''
const name = 'embed'
const localPath = '@stratusjs/angularjs-extras/src/components'

// This component is just a simple twitter feed.
Stratus.Components.TwitterFeed = {
    bindings: {
        // Basic Control for Designers
        elementId: '@',

        // Scripts
        scripts: '=',
    },
    controller(
        $scope: angular.IScope|any,
        $attrs: angular.IAttributes,
        $element: JQLite
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(camelToSnake(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
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
