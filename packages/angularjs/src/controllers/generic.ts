// Generic Controller: used to connect to any API and/or process
// ------------------

// Runtime
import _, {forEach, head, isArray, isDate, isElement, isEmpty, isFunction, isNumber, isObject, isString, isUndefined} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {ICompiledExpression, ILogService, IParseService, ISCEService, IScope, IWindowService} from 'angular'
import {cookie} from '@stratusjs/core/environment'

// Forced Runtime Load
// tslint:disable-next-line:no-duplicate-imports
import 'angular'

// Modules
import 'angular-sanitize'

// Services
import {Registry} from '../services/registry'
import {Model} from '../services/model'
import {Collection} from '../services/collection'

// Stratus Dependencies
import {
    isJSON,
    safeUniqueId,
    setUrlParams
} from '@stratusjs/core/misc'

// Require this to Sanitize all data-ng-bind-html instances
Stratus.Modules.ngSanitize = true

// This Controller handles simple element binding
// for a single scope to an API Object Reference.
Stratus.Controllers.Generic = [
    '$scope',
    '$element',
    '$log',
    '$sce',
    '$parse',
    '$window',
    'Registry',
    async (
        $scope: IScope|any,
        $element: JQLite,
        $log: ILogService,
        $sce: ISCEService,
        $parse: IParseService,
        $window: IWindowService,
        R: Registry
    ) => {
        // Store Instance
        $scope.uid = safeUniqueId('controller_generic_')
        Stratus.Instances[$scope.uid] = $scope

        // Registry
        // TODO: This should be moved to the end of this initialization function,
        //       but this can affect the timing of odd DOM implementations, so
        //       this feature will need to be planned and tested.
        await R.fetch($element, $scope)

        // Wrappers
        // NOTE: parent is overwritten in nested controllers every time you have an data-ng-if statement (it silently
        // creates a new scope that inherits the variables of the current scope, but overwrites parent, so that you have
        // to do $parent.$parent.$parent everytime you need to access the parent inside nested data-ng-if statements. So we set
        // the realParent to a permanent variable here that can be accessed at any level of data-ng-if, because the parent variable
        // does not get modified
        $scope.ctrlParent = $scope.$parent
        $scope.Stratus = Stratus
        $scope._ = _
        $scope.cookie = cookie
        $scope.$window = $window
        $scope.setUrlParams = setUrlParams
        $scope.$log = $log

        // Inject Javascript Objects
        $scope.Math = Math

        // Type Checks
        $scope.isArray = isArray
        $scope.isDate = isDate
        $scope.isDefined = (value: any) => !isUndefined(value)
        $scope.isElement = isElement
        $scope.isFunction = isFunction
        $scope.isNumber = isNumber
        $scope.isObject = isObject
        $scope.isString = isString
        $scope.isUndefined = isUndefined

        // Angular Wrappers
        $scope.getHTML = $sce.trustAsHtml
        $scope.getURL = $sce.trustAsResourceUrl

        // URL Functions
        $scope.getAnchor = () => {
            const url = window.location.href
            if (!url || !url.length) {
                return false
            }
            const anchor = url.indexOf('#')
            if (anchor < 0) {
                return false
            }
            if ((anchor + 1) >= url.length) {
                return false
            }
            return url.substring(anchor + 1, url.length)
        }
        /**
         * @param anchor - The anchor you'd like to smooth scroll to.  You can use the getAnchor() function if you'd like to point to the
         * anchor in the URL.
         * @param inUrl  - This flags whether the anchor needs to be present in the URL to continue.  If you're using the getAnchor() call
         * above, this isn't necessary.
         * @param delay  - This gives a delay of only 1ms, but is enough to lower the priority of this calculation, since javascript runs
         * concurrently.
         */
        $scope.scrollToAnchor = (anchor?: string, inUrl?: boolean, delay?: number) => {
            if (!anchor || isEmpty(anchor)) {
                $log.warn('anchor id not set!')
                return false
            }
            if (isUndefined(inUrl)) {
                inUrl = false
            }
            if (inUrl && anchor !== $scope.getAnchor()) {
                return false
            }
            const el = $window.document.getElementById(anchor)
            if (!el) {
                $log.warn(`element not found: ${anchor}`)
                return false
            }
            // TODO: We can add an event listener and make this function async() if the need ever arises,
            //       but I don't have a non-polling solution for this at the moment
            /* *
            addEventListener('scroll', e => {
                // Note: Don't forget to removeEventListener() at the end!
                // Note: Chrome has been building a window.onscrollend event, but I don't know it will be released.
                $log.log(e)
            })
            /* */
            // Execute Smooth Scroll
            if (!delay) {
                // $log.info(`start scroll: ${anchor}`)
                // TODO: If a method is found, this could check if an element is visible before scrolling
                el.scrollIntoView({ behavior: 'smooth' })
                return true
            }
            // Delay Smooth Scroll
            // $log.info(`delay scroll: ${anchor}`)
            return setTimeout(() => {
                $scope.scrollToAnchor(anchor, inUrl, --delay)
            }, 1)
        }

        // TODO: Consider moving the R.fetch() here

        // Bind Redraw to all Change Events
        if ($scope.data && isFunction($scope.data.on)) {
            $scope.data.on('change', () => $scope.$applyAsync())
        }

        // Handle Selected
        if (!$scope.collection || !($scope.collection instanceof Collection)) {
            return
        }
        const selected: {
            raw: string;
            id: string,
            model?: Model|ICompiledExpression,
            value?: any
        } = {
            id: $element.attr('data-selected'),
            raw: $element.attr('data-raw')
        }
        if (!selected.id || !isString(selected.id)) {
            return
        }
        if (isJSON(selected.id)) {
            selected.id = JSON.parse(selected.id)
            $scope.$watch('collection.models', (models: Array<Model>) => {
                if ($scope.selected || $scope.selectedInit) {
                    return
                }
                forEach(models, (model: Model) => {
                    if (selected.id !== model.getIdentifier()) {
                        return
                    }
                    $scope.selected = selected.raw ? model.data : model
                    $scope.selectedInit = true
                })
            })
        } else {
            selected.model = $parse(selected.id)
            selected.value = selected.model($scope.$parent)
            if (!isArray(selected.value)) {
                return
            }
            selected.value = selected.value.filter((n: any) => n)
            if (selected.value.length) {
                return
            }
            $scope.selected = head(selected.value)
        }
    }
]
