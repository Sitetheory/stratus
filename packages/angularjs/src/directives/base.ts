// Base Directive
// --------------

// Runtime
import * as _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {IAttributes, IScope} from 'angular'

// Angular 1 Modules
import 'angular-material'

// Stratus Dependencies
import {camelToSnake} from '@stratusjs/core/conversion'

// Environment
const min = Stratus.Environment.get('production') ? '.min' : ''
const name = 'base'
const localPath = '@stratusjs/angularjs/src/directives'

// This directive intends to provide basic logic for extending
// the Stratus Auto-Loader for various contextual uses.
Stratus.Directives.Base = () => ({
    restrict: 'A',
    scope: {
        ngModel: '='
    },
    link: ($scope: IScope|any, $element: JQLite|any, $attrs: IAttributes|any) => {
        // Initialize
        const $ctrl: any = this
        $ctrl.uid = _.uniqueId(camelToSnake(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $element.elementId || $ctrl.uid
        Stratus.Internals.CssLoader(
            Stratus.BaseUrl + Stratus.BundlePath + localPath + name + min + '.css'
        )
        $scope.initialized = false

        // Begin
        console.log('directive:', $ctrl, $scope, $element, $attrs)
    },
    // template: '<div id="{{ elementId }}" class="no-template"></div>',
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + localPath + name + min + '.html'
})
