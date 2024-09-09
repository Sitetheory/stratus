// FullHeight Directive
// -----------------
// Expected inputs
// stratus-full-height: void (required)
// full-height-minus-elements: string[] // [".header-common-parent",".search-filter-top",".sf-toolbar"]
// full-height-reference-parent: 'document' | 'window' |  '#elementName'

// Runtime
import {isArray, isString} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {IAttributes, IAugmentedJQuery, IScope, ITimeoutService, IWindowService} from 'angular'

// Angular 1 Modules
import {isJSON, safeUniqueId} from '@stratusjs/core/misc'
import {StratusDirective} from './baseNew'


// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'fullHeight'

export type FullHeightScope = IScope & { // & LooseObject<LooseFunction>
    initialized: boolean
    uid: string

    height: string
    referenceParent: string // 'document' // 'document' | 'window' |  '#elementName'
    fullHeight: boolean
    fullHeightMinusElements?: string // '["header","foo"]'
    fullHeightMinusElementNames: string[] // ['header','foo']

    init(): void
    decodeHTML(html: string): string
    getDocumentSize(): ElementSize
    getElementSize(elementSelector: string): ElementSize
    getParentSize(): ElementSize
    getWindowSize(): ElementSize
    updateWidgetSize(): void
    updateHeight(height: string): void
}
type ElementSize = {
    height: number
    width: number
}

Stratus.Directives.FullHeight = (
    $timeout: ITimeoutService,
    $window: IWindowService
): StratusDirective => ({
    restrict: 'A',
    scope: {
        stratusFullHeight: '@',
        fullHeightMinusElements: '@',
        fullHeightReferenceParent: '@',
    },
    link: (
        $scope: FullHeightScope,
        $element: IAugmentedJQuery,
        $attrs: IAttributes
    ) => {
        // Initialize
        $scope.uid = safeUniqueId(packageName, moduleName, directiveName)
        Stratus.Instances[$scope.uid] = $scope
        $scope.initialized = false
        $scope.referenceParent = 'document'
        $scope.fullHeight = true
        $scope.fullHeightMinusElementNames = []

        $scope.init = () => {
            $scope.fullHeight = $attrs.stratusFullHeight && isJSON($attrs.stratusFullHeight) ? JSON.parse($attrs.stratusFullHeight) : true

            // Sizing Options
            if ($attrs.fullHeightReferenceParent && isString($attrs.fullHeightReferenceParent)) {
                $scope.referenceParent = $attrs.fullHeightReferenceParent
            }
            if ($attrs.fullHeightMinusElements) {
                // Prevent HTML encoding with importing json
                $scope.fullHeightMinusElements = $scope.decodeHTML($attrs.fullHeightMinusElements)
            }
            const fullHeightMinusElementNames = $scope.fullHeightMinusElements && isJSON($scope.fullHeightMinusElements) ?
                JSON.parse($scope.fullHeightMinusElements) : null
            if (isArray(fullHeightMinusElementNames)) {
                // $scope.fullHeight = true
                $scope.fullHeightMinusElementNames = fullHeightMinusElementNames
            }
            $scope.initialized = true

            if ($scope.fullHeight) {
                $timeout(() => {
                    // DOM has finished rendering
                    $scope.updateWidgetSize()
                })
                $timeout(() => {
                        // Dually again to ensure we get the right size of something
                        $scope.updateWidgetSize()
                    },
                    1500
                )
                // Update the size every time the window resizes
                $window.addEventListener('resize', $scope.updateWidgetSize)
            }
        }

        $scope.decodeHTML = (html: string) => {
            const txt = document.createElement('textarea')
            txt.innerHTML = html
            return txt.value
        }

        $scope.updateWidgetSize = () => {
            if ($scope.fullHeight || $scope.fullHeightMinusElementNames.length > 0) {
                if ($scope.fullHeightMinusElementNames.length === 0) {
                    $scope.updateHeight(`${$scope.getParentSize().height}px`)
                } else {
                    // get the element and height or each fullHeightMinusElementNames
                    let heightOffset = 0
                    $scope.fullHeightMinusElementNames.forEach((elementSelector) => {
                        // const el = this.window.document.getElementById(elementSelector)
                        const el = $window.document.querySelector(elementSelector) as HTMLElement
                        if (el) {
                            heightOffset += el.offsetHeight
                        }
                    })
                    // console.log('heightOffset:', heightOffset)
                    $scope.updateHeight(`${$scope.getParentSize().height - heightOffset}px`)
                }
                // console.log('updated height', $scope.height)
            }
        }

        $scope.updateHeight = (height: string) => {
            $scope.height = height
            $element.css({
                height: $scope.height
            })
        }

        $scope.getWindowSize = () => {
            return {
                height: $window.innerHeight,
                width: $window.innerWidth
            }
        }

        $scope.getDocumentSize = () => {
            return {
                height: $window.document.body.clientHeight,
                width: $window.document.body.clientWidth
            }
        }

        $scope.getElementSize = (elementSelector: string) => {
            const el = $window.document.querySelector(elementSelector) as HTMLElement
            if (el) {
                return {
                    height: el.clientHeight,
                    width: el.clientWidth
                }
            }
            return $scope.getDocumentSize()
        }

        $scope.getParentSize = () => {
            return $scope.referenceParent === 'document' ? $scope.getDocumentSize() :
                $scope.referenceParent === 'window' ? $scope.getWindowSize() :
                    $scope.getElementSize($scope.referenceParent)
        }

        $scope.init()
    }
})
