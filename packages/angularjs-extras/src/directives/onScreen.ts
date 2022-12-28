// OnScreen Directive
// -----------------

// Runtime
import {isNumber, isUndefined} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    element,
    IAttributes,
    IAugmentedJQuery,
    IScope
} from 'angular'

// Stratus Core
import {hydrate, safeUniqueId} from '@stratusjs/core/misc'
import {StratusDirective} from './baseNew'

// Environment
const packageName = 'angularjs-extras'
const moduleName = 'directives'
const directiveName = 'onScreen'

export type OnScreenScope = IScope & {
    uid: string
    elementId: string
    initialized: boolean
}

// This directive intends to provide basic logic for extending
// the Stratus Auto-Loader for various contextual uses.
Stratus.Directives.OnScreen = (
    // $parse: IParseService
): StratusDirective => ({
    restrict: 'A',
    scope: {
        onScreen: '@onScreen',
        stratusOnScreen: '@stratusOnScreen',
        offScreen: '@offScreen',
        spy: '@spy',
        target: '@target',
        partial: '@partial', // by default: true
        update: '@update', // by default: 100 ms
        animation: '@animation', // by default: none
        event: '@event', // event can be multiple listeners: reset
        offset: '@offset', // The distance the spy element is allowed to enter the screen before triggering 'onscreen'
        reset: '@reset' // The location on the page that should trigger a reset (removal of all classes). Defaults to 0 (top of page)
    },
    link: (
        $scope: OnScreenScope,
        $element: IAugmentedJQuery,
        $attrs: IAttributes
    ) => {
        // Initialize
        $scope.uid = safeUniqueId(packageName, moduleName, directiveName)
        Stratus.Instances[$scope.uid] = $scope
        // const $element = element instanceof jQuery ? element : jQuery(element) // Already JQLite
        $scope.elementId = $attrs.elementId || $scope.uid
        $scope.initialized = false

        // event can be multiple listeners: reset
        const event: string[] = $attrs.event ? $attrs.event.split(' ') : []
        const target: IAugmentedJQuery = $attrs.target ? element($attrs.target) : $element
        let spy: IAugmentedJQuery = $attrs.spy ? element($attrs.spy) : $element
        if (!spy.length) {
            spy = $element
        }
        let partial = hydrate($attrs.partial)
        if (typeof partial !== 'boolean') {
            partial = true
        }
        let update = hydrate($attrs.update)
        if (typeof update !== 'number') {
            update = 100
        }
        let animation = hydrate($attrs.animation)
        if (typeof animation !== 'number') {
            animation = false
        }
        let lastUpdate = 0
        let isWaiting = false
        let wasOnScreen = false
        let wipeJob: ReturnType<typeof setTimeout> = null

        // The distance the spy element is allowed to enter the screen before triggering 'onscreen'
        const offset = hydrate($attrs.offset) || 0

        // The location on the page that should trigger a reset (removal of all classes). Defaults to 0 (top of page)
        const reset = hydrate($attrs.reset) || 0

        // Custom Methods for On/Off Screen
        // TODO: Add Parsing Here
        const onScreen = () => $attrs.onScreen && typeof $attrs.onScreen === 'function' ? $attrs.onScreen() : true
        const offScreen = () => $attrs.offScreen && typeof $attrs.offScreen === 'function' ? $attrs.offScreen() : true
        const isOnScreen = () => {
            // FIXME: This needs to be converted to the Chronos structure.
            if (isWaiting) {
                return wasOnScreen
            }
            const calculation = (new Date()).getTime()
            if (calculation - lastUpdate > update) {
                lastUpdate = calculation
                wasOnScreen = Stratus.Internals.IsOnScreen(spy, offset, partial)
            } else {
                isWaiting = true
                setTimeout(() => {
                    isWaiting = false
                    // isOnScreen and calculate require each other
                    // tslint:disable-next-line:no-use-before-declare
                    calculate()
                }, ((lastUpdate + update) - calculation) + 1)
            }
            return wasOnScreen
        }
        const wipe = (request?: any) => {
            if (!animation) {
                return
            }
            if (isUndefined(request)) {
                // FIXME: This needs to be converted to the Chronos structure.
                if (isNumber(wipeJob)) {
                    clearTimeout(wipeJob)
                }
                wipeJob = setTimeout(() => {
                    wipe(true)
                }, animation)
            } else {
                target.removeClass('reveal conceal')
            }
        }

        // Bind Angular to Environment
        const calculate = () => {
            // remove all classes when the scroll is all the way back at the top of the page (or the spy is above a
            // specific location specified location)
            if (
                event.indexOf('reset') !== -1 &&
                (
                    (reset > 0 && $element.offset().top <= reset) ||
                    element(Stratus.Environment.get('viewPort') || window).scrollTop() <= 0
                )
            ) {
                target.removeClass('on-screen off-screen scroll-up scroll-down reveal conceal')
                target.addClass('reset')
                return
            }
            if (isOnScreen()) {
                // Add init class so we can know it's been on screen before
                if (!target.hasClass('on-screen')) {
                    target.addClass('on-screen on-screen-init')
                }
                if (target.hasClass('off-screen')) {
                    target.removeClass('off-screen')
                }
                // Execute Custom Methods
                onScreen()
                // Success
                return true
            } else {
                if (target.hasClass('on-screen')) {
                    target.removeClass('on-screen')
                }
                if (!target.hasClass('off-screen')) {
                    target.addClass('off-screen')
                }
                // Execute Custom Methods
                offScreen()
                // Failure
                return false
            }
        }

        // FIXME: This needs to be converted to the new event structure.
        // Ensure OnScroll is listening
        Stratus.Internals.OnScroll()

        // Listen for Screen Changes
        Stratus.Environment.on('change:viewPortChange', calculate)
        Stratus.Environment.on('change:lastScroll', () => {
            // If no scrolling has occurred remain false
            const lastScroll = Stratus.Environment.get('lastScroll')

            // Add scroll classes no matter what, so you can target styles when the item is on or off screen depending on scroll action
            if (lastScroll === 'down' && !target.hasClass('reset')) {
                if (!target.hasClass('scroll-down')) {
                    target.addClass('scroll-down')
                }
                if (target.hasClass('scroll-up')) {
                    target.removeClass('scroll-up')
                }
                if (animation && Stratus.Internals.IsOnScreen(spy, offset, partial)) {
                    if (target.hasClass('reveal')) {
                        target.removeClass('reveal')
                    }
                    if (!target.hasClass('conceal')) {
                        target.addClass('conceal')
                    }
                    wipe()
                }
            }

            if (lastScroll === 'up') {
                if (!target.hasClass('scroll-up')) {
                    target.addClass('scroll-up')
                }
                if (target.hasClass('scroll-down')) {
                    target.removeClass('scroll-down')
                }
                if (target.hasClass('reset')) {
                    target.removeClass('reset')
                }
                if (animation) {
                    if (!target.hasClass('reveal')) {
                        target.addClass('reveal')
                    }
                    if (target.hasClass('conceal')) {
                        target.removeClass('conceal')
                    }
                    wipe()
                }
            }
        })

        // Run Initial & Delayed Calculations
        const limit = 8
        let i = 0
        const delayed = () => {
            if (++i > limit) {
                // console.log('exit:', target)
                return
            }
            // console.log('attempt:', i, target)
            if (calculate()) {
                // console.log('success:', target, 'attempts:', i)
                return
            }
            setTimeout(delayed, 250)
        }
        delayed()
    }
})
