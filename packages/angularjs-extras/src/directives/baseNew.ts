// BaseNew Directive
// -----------------

// Runtime
import {snakeCase, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAttributes,
    IAugmentedJQuery,
    INgModelController,
    IScope
    // IParseService
} from 'angular'

// Angular 1 Modules
import 'angular-material'

// Stratus Core
import {cookie} from '@stratusjs/core/environment'
import {LooseObject} from '@stratusjs/core/misc'

export type StratusDirective = ({
    restrict: 'A' | string
    require?: 'ngModel' | string
    transclude?: boolean | LooseObject<string>
    scope?: LooseObject<string>
    template?: string | (($attrs?: IAttributes) => string)
    compile?($element: IAugmentedJQuery, $attrs: IAttributes): void
    link?($scope: IScope, $element: IAugmentedJQuery, $attrs: IAttributes, ngModel?: INgModelController): void
})

// Environment
const min = !cookie('env') ? '.min' : ''
const name = 'baseNew'
const localPath = '@stratusjs/angularjs-extras/src/directives'

export type BaseNewScope = IScope & {
    uid: string
    elementId: string
    initialized: boolean
}

// This directive intends to provide basic logic for extending
// the Stratus Auto-Loader for various contextual uses.
Stratus.Directives.BaseNew = (
    // $parse: IParseService
): StratusDirective => ({
    restrict: 'A',
    require: 'ngModel',
    scope: {
        stratusBaseNew: '='
    },
    link: (
        // Order or parameters matter (unlike components)
        $scope: BaseNewScope,
        $element: IAugmentedJQuery & {elementId?: string},
        $attrs: IAttributes,
        ngModel: INgModelController
    ) => {
        // Initialize
        $scope.uid = uniqueId(snakeCase(name) + '_')
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $element.elementId || $scope.uid
        $scope.initialized = false

        // Inject CSS
        Stratus.Internals.CssLoader(
            `${Stratus.BaseUrl}${Stratus.BundlePath}${localPath}${name}${min}.css`
        ).then(() => $scope.initialized = true)

        // Begin
        console.log(`${name} directive:`, {$scope, $element, $attrs, ngModel})
    },
    template: '<div id="{{ elementId }}" class="no-template"></div>',
    // templateUrl: `${Stratus.BaseUrl}${Stratus.BundlePath}${localPath}${name}${min}.html`
})
