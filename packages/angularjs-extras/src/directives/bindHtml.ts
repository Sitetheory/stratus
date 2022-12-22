// Bind HTML Directive
// -----------------

// Runtime
import {clone, head, isEmpty, isString, startsWith, throttle} from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    IAttributes,
    IScope,
    IParseService,
    ICompileService,
    ISCEService, IAugmentedJQuery,
} from 'angular'
import {StratusDirective} from './baseNew'
import {safeUniqueId} from '@stratusjs/core/misc'

export type BindHtmlScope = IScope & {
    uid: string
    initialized: boolean
    element: IAugmentedJQuery
    compiling: boolean
    compiled: boolean
    html?: string

    canCompile(): boolean
    compile(el?: HTMLElement): void
    safeCompile(): void
    safeCompileThrottle(): void
    evalStratusBind(): void
}

// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'bindHtml'

// This directive binds html and also compiles the AngularJS Components in the child elements.
Stratus.Directives.BindHtml = (
    $sce: ISCEService,
    $parse: IParseService,
    $compile: ICompileService & any,
): StratusDirective => ({
    restrict: 'A',
    // ng-bind-html for reference:
    //
    // compile: (
    //     tElement: JQLite & any,
    //     tAttrs: IAttributes & any
    // ) => {
    //     const ngBindHtmlGetter = $parse(tAttrs.ngBindHtml)
    //     const ngBindHtmlWatch = $parse(tAttrs.ngBindHtml, (val: any) => {
    //         // Unwrap the value to compare the actual inner safe value, not the wrapper object.
    //         // @ts-ignore
    //         return $sce.valueOf(val)
    //     })
    //     $compile.$$addBindingClass(tElement)
    //
    //     return (
    //         $scope: IScope & any,
    //         $element: JQLite & any,
    //         $attrs: IAttributes & any
    //     ) => {
    //         $compile.$$addBindingInfo($element, $attrs.ngBindHtml)
    //
    //         $scope.$watch(ngBindHtmlWatch, () => {
    //             // The watched value is the unwrapped value. To avoid re-escaping, use the direct getter.
    //             const value = ngBindHtmlGetter($scope)
    //             $element.html($sce.getTrustedHtml(value) || '')
    //         })
    //     }
    // },
    link: (
        $scope: BindHtmlScope,
        $element: IAugmentedJQuery,
        $attrs: IAttributes,
    ) => {
        // Initialize
        $scope.uid = safeUniqueId(packageName, moduleName, directiveName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.initialized = false

        // Hoist Element for Debug Purposes
        $scope.element = $element

        // Safe Execution Flags
        $scope.compiling = false
        $scope.compiled = false

        // Safe Execution Controls
        // $scope.compileOnce = false

        // Check if we can compile
        $scope.canCompile = () => {
            if ($scope.compiling) {
                return false
            }
            // return !($scope.compileOnce && $scope.compiled);
            return true

        }

        // Run Compilation, Deep...
        $scope.compile = (el?: HTMLElement) => {
            // evaluate element
            // console.log($scope.uid, 'running', copy(el))
            el = el || head($element)
            if (!el || !el.nodeType) {
                return
            }
            if (el.nodeType !== Node.ELEMENT_NODE) {
                return
            }
            // console.log($scope.uid, 'parsing', copy(el))
            const children: NodeList = el.querySelectorAll(':scope > :not(.ng-scope)') // only get direct children :scope
            if (!children || !children.length) {
                // console.log($scope.uid, 'bind html has no children', copy(el), copy(children))
                return
            }
            // lock compilation
            $scope.compiling = true
            // console.log($scope.uid, 'bind html compiling children', children, $scope)
            // compile node
            $compile(children)($scope)
            // unlock compilation
            $scope.compiling = false
        }

        $scope.safeCompile = () => {
            if (!$scope.canCompile()) {
                console.log($scope.uid, 'in process of compiling, can\'t, attempt')
                return
            }
            $scope.compile()
        }
        $scope.safeCompileThrottle = () => throttle($scope.safeCompile, 250)
        $scope.evalStratusBind = () => {
            const newHtml = $scope.$eval($attrs.stratusBindHtml)
            if (!isString(newHtml)) {
                console.warn(`stratus-bind-html: unable to grab html on instance ${$scope.uid}`, clone(newHtml), typeof newHtml)
                return
            }
            // stop infinite loops
            if (newHtml === $scope.html) {
                console.warn(`stratus-bind-html: infinite loop detected for html on instance ${$scope.uid}`)
                return
            }
            // set html to scope and element
            $scope.html = newHtml
            $element.html($scope.html)
            // mark as initialized
            $scope.initialized = true
            // handle single read binds
            if (!startsWith($attrs.stratusBindHtml, '::')) {
                console.warn(`stratus-bind-html: it is recommended to prefix :: to compiled binds on instance ${$scope.uid}`)
            }
            // Process all that we now have
            $scope.safeCompile()
        }

        // Check what we are given and attempt to Compile Data.
        if (isString($attrs.stratusBindHtml) && !isEmpty($attrs.stratusBindHtml)) {
            // console.log($scope.uid, 'has stratusBindHtml, will eval it', clone($attrs.stratusBindHtml))
            $scope.evalStratusBind()
            return // Skip any other init processing
        }

        if (isString($attrs.ngBindHtml) && !isEmpty($attrs.ngBindHtml)) {
            // console.log($scope.uid, 'has ngBindHtml. will compile in a second')
            // ng-bind can take time which is difficult to determine... compile after 2 seconds
            console.warn(
                `stratus-bind-html: combined with ng-bind is unpredictable and slower.
                recommendation to move binding logic within ${$scope.uid}`
            )
            setTimeout(
                () => $scope.safeCompile(), // Attempt compile once
                2000
            )
            // Note: reducing this delay has been found to compile too soon... and never process the components
        } else {
            // console.log($scope.uid, 'has no variables. compiling immediately')
            // No ng-bind so we're not waiting on anything. Compile now
            $scope.safeCompileThrottle()
        }

        // Add Change Listener
        // When changes are detected, compile child nodes (build directives and components for child elements)
        // Note that recompiling already existing components -could- break them
        $element.on('DOMSubtreeModified', $scope.safeCompileThrottle)

        // Mark as initialized
        $scope.initialized = true
    }
})
