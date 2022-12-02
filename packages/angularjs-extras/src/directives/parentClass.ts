// ParentClass Directive
// -----------------

// Runtime
import _ from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    IAttributes,
    IScope,
    // INgModelController,
    // IParseService
} from 'angular'

// Angular 1 Modules
import 'angular-material'

// Stratus Core
import {LooseObject} from '@stratusjs/core/misc'
import {StratusDirective} from './baseNew'

// Stratus Core
// import {cookie} from '@stratusjs/core/environment'

// Environment
// const min = !cookie('env') ? '.min' : ''
const name = 'parentClass'
// const localPath = '@stratusjs/angularjs-extras/src/directives'

// This directive adds a class to all parent nodes and stops
// at the defined selector.
Stratus.Directives.ParentClass = (
    // $parse: IParseService
): StratusDirective => ({
    restrict: 'A',
    scope: {
        // Class we're adding
        stratusParentClass: '@',
        // Element we will stop at
        limit: '@',
        // Element we will stop before
        limitBelow: '@',
    },
    link: (
        $scope: IScope & LooseObject,
        $element: JQLite & {elementId?: string},
        $attrs: IAttributes,
        // ngModel: INgModelController
    ) => {
        // Initialize
        $scope.uid = _.uniqueId(_.snakeCase(name) + '_')
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $element.elementId || $scope.uid
        $scope.initialized = false

        // Normalize Values
        $scope.limitNode = document.querySelector($attrs.limit || 'body')

        $scope.elements = []
        $scope.addParentClass = (el: any, className?: string) => {
            // Ensure class name exists
            if (!className) {
                return
            }
            // Ensure element exists
            if (!el) {
                return
            }
            // Ensure we stop at the limit
            const node = el.selection || el
            if (node === $scope.limitNode) {
                return
            }
            // Ensure we only visit a node once
            if (_.includes($scope.elements, node)) {
                return
            }
            $scope.elements.push(node)
            // Ensure parent exists
            const parent = el.parent()
            if (!parent) {
                return
            }
            // Add class to the parent
            parent.addClass(className)
            // Handle the parent, recursively
            $scope.addParentClass(parent, className)
        }

        // Start off on the initial element
        $scope.addParentClass(Stratus.Select($element), $attrs.stratusParentClass)
    }
})
