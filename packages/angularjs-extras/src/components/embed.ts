// Embed Component
// ---------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'

// Angular 1 Modules
import 'angular-material'

// Stratus Dependencies
import {sanitize} from '@stratusjs/core/conversion'
import {cookie} from '@stratusjs/core/environment'

// Environment
const min = !cookie('env') ? '.min' : ''
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
        $ctrl.uid = _.uniqueId(_.camelCase(name) + '_')
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
