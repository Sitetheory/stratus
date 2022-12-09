// Base Directive
// --------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {IAttributes, IScope} from 'angular'

// Angular 1 Modules
import 'angular-material'

// Stratus Dependencies
import {cookie} from '@stratusjs/core/environment'

// Environment
const min = !cookie('env') ? '.min' : ''
const name = 'base'
const localPath = '@stratusjs/angularjs/src/directives'

// This directive intends to provide basic logic for extending
// the Stratus Auto-Loader for various contextual uses.
Stratus.Directives.Base = function () {
    return {
        restrict: 'A',
        scope: {
            ngModel: '='
        },
        link: ($scope: IScope|any, $element: JQLite|any, $attrs: IAttributes|any) => {
            // Initialize
            const $ctrl: any = this
            $scope.uid = _.uniqueId(_.snakeCase(name) + '_')
            Stratus.Instances[$scope.uid] = $scope
            $scope.elementId = $element.elementId || $scope.uid
            Stratus.Internals.CssLoader(
                Stratus.BaseUrl + Stratus.BundlePath + localPath + name + min + '.css'
            )
            $scope.initialized = false

            // Begin
            console.log('directive:', $ctrl, $scope, $element, $attrs)
        },
        // template: '<div id="{{ elementId }}" class="no-template"></div>',
        templateUrl: Stratus.BaseUrl + Stratus.BundlePath + localPath + name + min + '.html'
    }
}
