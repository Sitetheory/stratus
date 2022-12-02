// Dom Events Extras Directive
// -----------------
// Intended to add the DOM events that https://github.com/angular/angular.js/blob/master/src/ng/directive/ngEventDirs.js has missed
// Such as:
// focusin: stratus-focusin (different than data-ng-focus) You can focus any element directly so long as you add tabindex="-1"
//          Otherwise, this will always detect inner children being focused or directly on just input fields
// focusout: stratus-focusout (different than data-ng-blur)

// Runtime
import {capitalize} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAugmentedJQuery,
    IAttributes,
    IExceptionHandlerService,
    IScope,
    IParseService,
    IRootScopeService
} from 'angular'

// Stratus Core
import {LooseObject} from '@stratusjs/core/misc'
import {StratusDirective} from './baseNew'

/**
 * List of DOM events that will be converted into Directives
 */
const directiveEvents = [
    'focusin',
    'focusout'
]
/**
 * For events that might fire synchronously during DOM manipulation
 * we need to execute their event handlers asynchronously using $evalAsync,
 * so that they are not executed in an inconsistent state.
 */
const forceAsyncEvents: LooseObject<boolean> = {
    focusin: true,
    focusout: true
}

directiveEvents.forEach(eventName => {
    const directiveName = capitalize(eventName)
    const attributeName = 'stratus' + directiveName

    // Loop each listed event to call on the browser's base event handler
    Stratus.Directives[directiveName] = (
        $exceptionHandler: IExceptionHandlerService,
        $parse: IParseService,
        $rootScope: IRootScopeService
    ): StratusDirective => ({
        restrict: 'A',
        compile: (
            $element: IAugmentedJQuery,
            $attrs: IAttributes
        ) => {
            const fn = $parse($attrs[attributeName])
            return function ngEventHandler (scope: IScope, element: IAugmentedJQuery) {
                element.on(eventName, event => {
                    // console.log(eventName, 'hit')
                    const callback = () => {
                        fn(scope, { $event: event })
                    }

                    if (!$rootScope.$$phase) {
                        scope.$apply(callback)
                    } else if (forceAsyncEvents.hasOwnProperty(eventName) && forceAsyncEvents[eventName]) {
                        scope.$evalAsync(callback)
                    } else {
                        try {
                            callback()
                        } catch (error) {
                            $exceptionHandler(error)
                        }
                    }
                })
            }
        }
    })
})
