// Src Directive
// -----------------

// Runtime
import {filter, isString, size} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    element,
    IAttributes,
    IAugmentedJQuery,
    IScope,
    IWindowService
} from 'angular'
import {StratusDirective} from './baseNew'
import {isJSON, safeUniqueId} from '@stratusjs/core/misc'

// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'src'

export type SrcScope = IScope & {
    whitelist: string[]
    filter?: string[]
    registered?: boolean
    group: {
        method: CallableFunction
        el: IAugmentedJQuery
        spy: string | IAugmentedJQuery
        ignoreSpy?: boolean
    }

    loadImage(): void
    register(): void
    setSrc(tagType: string, src: string): void
}

// This directive intends to handle binding of a dynamic variable to
Stratus.Directives.Src = (
    $window: IWindowService
): StratusDirective => ({
    restrict: 'A',
    scope: {
        src: '@src',
        stratusSrc: '@stratusSrc',
        // stratusSrcSizes: '@stratusSrcSizes', // Unused at this time
        stratusSrcVersion: '@stratusSrcVersion',
        stratusSrcResize: '@stratusSrcResize',
        style: '@style',
        initNow: '=initNow'
    },
    link: (
        $scope: SrcScope,
        $element: IAugmentedJQuery,
        $attrs: IAttributes
    ) => {
        // Initialize
        Stratus.Instances[safeUniqueId(packageName, moduleName, directiveName)] = $scope

        $scope.whitelist = [
            'apng',
            'avif',
            'gif',
            'jpg',
            'jpeg',
            'png',
            'webp'
        ]
        $scope.filter = null

        const getSrcPath = (src: string): string => {
            if (!src) {
                return ''
            }
            try {
                const url = new URL(
                    src.indexOf('//') === 0 ? `${window.location.protocol}${src}` : src,
                    window.location.href
                )
                return url.pathname || ''
            } catch (error) {
                return src.split(/[?#]/)[0]
            }
        }
        const isBooleanSentinelSrc = (src: string): boolean => {
            const normalizedSrc = src.trim().replace(/^url\(["']?(.+?)["']?\)$/i, '$1').trim()
            if (/^(true|false)$/i.test(normalizedSrc)) {
                return true
            }
            const srcPath = getSrcPath(normalizedSrc).replace(/\/+$/, '')
            return /^\/?(true|false)$/i.test(srcPath)
        }

        // Add Watchers
        $scope.$watch(() => {
            return $attrs.stratusSrc || $attrs.src || $attrs.style
        }, (newVal, _oldVal, _scope) => {
            if (newVal && $element.attr('data-size')) {
                $scope.registered = false
            }
            $scope.register()
        })

        /** Sets the image src/css background on a tag */
        $scope.setSrc = (tagType: string, src: string) => {
            if (src && isString(src) && src.length > 0 && !isBooleanSentinelSrc(src)) {
                if (tagType === 'img') {
                    $element.attr('src', src)
                } else {
                    $element.css('background-image', `url(${src})`)
                }
            }
        }

        // Group Registration
        $scope.registered = false
        $scope.register = () => {
            const normalizeSrc = (src: any): string|null => {
                if (
                    typeof src === 'undefined' ||
                    src === null ||
                    src === true ||
                    src === false ||
                    src === 'true' ||
                    src === 'false'
                ) {
                    return null
                }
                if (isString(src)) {
                    const normalizedSrc = src.trim().replace(/^url\(["']?(.+?)["']?\)$/i, '$1').trim()
                    return isBooleanSentinelSrc(normalizedSrc) ? null : normalizedSrc
                }
                return src
            }

            // find background image in CSS if there is no src (e.g. for div)
            let backgroundImage = null
            const type = $element.prop('tagName').toLowerCase()
            if (type !== 'img') {
                backgroundImage = $element.css('background-image') || null
                if (backgroundImage) {
                    backgroundImage = backgroundImage.slice(4, -1).replace(/"/g, '')
                    if (isBooleanSentinelSrc(backgroundImage)) {
                        backgroundImage = null
                    }
                }
            }

            // Prevent Progressive loading if set to false. Will not continue any further
            if (
                $attrs.stratusSrcVersion === 'false' ||
                $attrs.stratusSrcVersion === false
            ) {
                // Requested to not progressive load
                // Set it's suggested image and exit
                $scope.setSrc(type, $attrs.stratusSrc || $attrs.src || backgroundImage)
                return true
            }

            // Prevent Progressive loading if set to false
            if (
                $attrs.stratusSrc === 'false' ||
                $attrs.stratusSrc === false
            ) {
                // Requested to not progressive load
                // Set it's suggested image and exit
                // $scope.setSrc(type, $attr.src || backgroundImage)
                // New: if set to false, don't do stratus-src at all. see https://app.asana.com/0/348823217261712/1149917100747392
                return true
            }

            // Treat stratus-src="true" the same as empty
            if (
                $attrs.stratusSrc === 'true' ||
                $attrs.stratusSrc === true
            ) {
                $attrs.stratusSrc = null
            }

            const src = normalizeSrc($attrs.stratusSrc) ||
                normalizeSrc($attrs.src) ||
                normalizeSrc(backgroundImage)

            // Get Extension
            const extMatch = src ? src.match(/\.([0-9a-z]+)(\?.*)?$/i) : null
            const ext = extMatch && extMatch[1] ? extMatch[1].toLowerCase() : null

            // Limit Resizable Types
            $scope.filter = filter($scope.whitelist, value => ext === value)
            if (!size($scope.filter)) {
                // Set its suggested image and exit
                $scope.setSrc(type, src)
                return true
            }

            // Ensure we have a location
            if (!src) {
                return false
            }

            // Don't re-register
            if ($scope.registered) {
                return true
            }
            $scope.registered = true

            // Begin Registration
            $element.attr('data-src', src)

            // FIXME: This needs to be converted to the new event structure.
            // TODO: this also needs to listen for if the src or stratus-src changes, so it retriggers, e.g. in a
            //  reusable popup where the contents change.
            // TODO: this also needs to work in popups that may not be trigger "onScroll" or "onScreen" because they
            //  are outside the flow of the page (usually at the bottom of the page out of view, but in the window with
            //  an absolute position)
            $scope.group = {
                method: Stratus.Internals.LoadImage,
                el: $element,
                // Could be replaced with spy: $element.data('spy') ? $document[0].querySelector($element.data('spy')) : $element
                // TODO need spy examples to test with
                spy: $element.data('spy') ? element($window.document.querySelector($element.data('spy'))) : $element
                // spy: $element.data('spy') ? Stratus.Select($element.data('spy')) : $element
            }

            // Extra logic if we need to forcibly load an image and ignore scroll spy
            if (Object.prototype.hasOwnProperty.call($attrs.$attr, 'initNow')) {
                $scope.group.ignoreSpy = true
                // If data-init-now was set, scroll spy logic will be ignored and skipped
                const initNow = isJSON($attrs.initNow) ? JSON.parse($attrs.initNow) : false
                if (!initNow) {
                    const stopWatchingInitNow = $scope.$watch('initNow', (initNowCtrl: boolean) => {
                        if (initNowCtrl !== true) {
                            return
                        }
                        $scope.loadImage()
                        stopWatchingInitNow()
                    })
                } else {
                    $scope.loadImage()
                }
                return
            }

            Stratus.RegisterGroup.add('OnScroll', $scope.group) // TODO Stratus.RegisterGroup typings needed
            Stratus.Internals.LoadImage($scope.group)
            Stratus.Internals.OnScroll()
        }

        $scope.loadImage = () => {
            Stratus.Internals.LoadImage($scope.group)
        }

        // Source Interpolation
        /* *
        $scope.src = $scope.src || $scope.stratusSrc
        $scope.interpreter = $interpolate($scope.src, false, null, true)
        $scope.initial = $scope.interpreter($scope.$parent)
        if (!isUndefined($scope.initial)) {
          $element.attr('stratus-src', $scope.initial)
          $scope.register()
        }

        $scope.$watch('stratusSrc', function (value) {
          if (!isUndefined(value) && !isEmpty(value)) {
            $element.attr('stratus-src', value)
            $element.attr('data-loading', false)
            $scope.registered = false
            $scope.register()
          }
        })
        /* */
    }
})
