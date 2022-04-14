// Bind HTML Directive
// -----------------

// Runtime
import _ from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {
    IAttributes,
    IScope,
    IParseService,
    ICompileService,
    ISCEService,
} from 'angular'

// Angular 1 Modules
import 'angular-material'

// Interfaces
interface TrustedValueHolder {
    $$unwrapTrustedValue: () => string
}

// Environment
// const min = !cookie('env') ? '.min' : ''
const name = 'bindHtml'
// const localPath = '@stratusjs/angularjs-extras/src/directives'

// This directive binds html and also compiles the AngularJS Components in the child elements.
Stratus.Directives.BindHtml = (
    $sce: ISCEService,
    $parse: IParseService,
    $compile: ICompileService & any,
) => ({
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
        $scope: IScope & any,
        $element: JQLite & any,
        $attrs: IAttributes & any,
    ) => {
        // Initialize
        const $ctrl: any = this
        $ctrl.uid = _.uniqueId(_.snakeCase(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $element.elementId || $ctrl.uid
        $scope.initialized = false

        // Run Compilation, Deep...
        $scope.compile = (el?: any) => {
            // evaluate element
            el = el || $element.contents()
            if (!el) {
                return
            }
            // compile node
            $compile(el)($scope)
            // attempt to compile child
            const contents = el.contents()
            if (!contents) {
                return
            }
            if (!contents.length) {
                return
            }
            $scope.compile(contents)
        }

        // Add Change Listener
        // When changes are detected, compile child nodes (build directives and components for child elements)
        $element.on('DOMSubtreeModified', () => $scope.compile())

        // Attempt compile once
        $scope.compile()

        // Attempt to Compile Data
        if (!$attrs.stratusBindHtml) {
            // Mark as initialized since the watcher isn't critical
            $scope.initialized = true
            // this isn't critical anymore, since we added a DOMSubtreeModified hook
            // console.warn(`unable to set html on instance ${$ctrl.uid} via stratus-bind-html attributes.`)
            return
        }

        // Start Watcher
        $scope.watcher = $scope.$watch(
            () => $scope.$eval($attrs.stratusBindHtml),
            (newValue?: TrustedValueHolder, oldValue?: TrustedValueHolder) => {
                if (!_.isObject(newValue)) {
                    console.warn(`stratus-bind-html: unable to find trusted html on instance ${$ctrl.uid}`)
                    return
                }
                if (!_.isFunction(newValue.$$unwrapTrustedValue)) {
                    console.warn(`stratus-bind-html: unable to find trusted html on instance ${$ctrl.uid}`)
                    return
                }
                // attempt to generate html
                const newHtml = newValue.$$unwrapTrustedValue()
                if (!_.isString(newHtml)) {
                    console.warn(`stratus-bind-html: unable to unwrap html on instance ${$ctrl.uid}`)
                    return
                }
                // stop infinite loops
                if (newHtml === $scope.html) {
                    console.warn(`stratus-bind-html: infinite loop detected for html on instance ${$ctrl.uid}`)
                    console.warn(`stratus-bind-html: halting watcher on instance ${$ctrl.uid}`)
                    $scope.watcher()
                    return
                }
                // set html to scope and element
                $scope.html = newHtml
                $element.html($scope.html)
                // mark as initialized
                $scope.initialized = true
                // handle single read binds
                if (!_.startsWith($attrs.stratusBindHtml, '::')) {
                    console.warn(`stratus-bind-html: it is recommended to prefix :: to compiled binds on instance ${$ctrl.uid}`)
                    return
                }
                // stop listening
                $scope.watcher()
            }
        )
    }
})
