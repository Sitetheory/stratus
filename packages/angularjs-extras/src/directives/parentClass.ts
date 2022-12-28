// ParentClass Directive
// -----------------

// Runtime
import {includes} from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    IAttributes,
    IScope,
    // INgModelController,
    // IParseService
} from 'angular'

// Stratus Core
import {safeUniqueId} from '@stratusjs/core/misc'
import {StratusDirective} from './baseNew'
import {Selector} from '@stratusjs/core/dom'

export type ParentClassScope = IScope & {
    uid: string
    elementId: string
    initialized: boolean
    limitNode: HTMLElement | Selector
    elements: (HTMLElement | Selector)[]

    addParentClass(el: any, className?: string): void
}

// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'parentClass'

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
        $scope: ParentClassScope,
        $element: JQLite & {elementId?: string},
        $attrs: IAttributes,
        // ngModel: INgModelController
    ) => {
        // Initialize
        $scope.uid = safeUniqueId(packageName, moduleName, directiveName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.elementId = $element.elementId || $scope.uid
        $scope.initialized = false

        // Normalize Values
        $scope.limitNode = document.querySelector($attrs.limit || 'body')

        $scope.elements = []
        $scope.addParentClass = (el: Selector, className?: string) => {
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
            if (includes($scope.elements, node)) {
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
