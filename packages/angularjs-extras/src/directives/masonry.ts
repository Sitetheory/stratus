// Masonry Directive
// @deprecated Masonry is not import and this directive will not work currently
// --------------
// Initialize on page by adding to a

// Runtime
import {snakeCase, uniqueId} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    IAttributes,
    IAugmentedJQuery,
    IScope
    // IParseService
} from 'angular'
// import Masonry from 'masonry-native' // TODO this package doesnt exist

// Angular 1 Modules
import 'angular-material'

// Stratus Core
import {isJSON} from '@stratusjs/core/misc'
import {StratusDirective} from './baseNew'

// Environment
const name = 'masonry'

export type MasonryScope = IScope & {
    uid: string
    elementId: string
    initialized: boolean
}

// This directive intends to provide basic logic for extending
// the Stratus Auto-Loader for various contextual uses.
Stratus.Directives.Masonry = (): StratusDirective => ({
    restrict: 'A',
    // NOTE: at the moment we don't pass in a conditional, because it requires more planning
    // scope: {
    //   conditional: '<'
    // },
    link: (
        $scope: MasonryScope,
        $element: IAugmentedJQuery & {elementId?: string},
        $attrs: IAttributes
    ) => {
        // Initialize
        const $ctrl: any = this
        $ctrl.uid = uniqueId(snakeCase(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $element.elementId || $ctrl.uid
        $scope.initialized = false

        // Get Masonry Options
        const masonryOptions = $attrs.stratusMasonry && isJSON($attrs.stratusMasonry) ? JSON.parse($attrs.stratusMasonry) : {}

        // Set Default Masonry Options
        masonryOptions.elementSelector = masonryOptions.elementSelector || '.grid'
        masonryOptions.itemSelector = masonryOptions.itemSelector || '.grid-item'
        masonryOptions.columnWidth = masonryOptions.columnWidth || '.grid-sizer'
        masonryOptions.percentPosition = masonryOptions.percentPosition || true
        masonryOptions.horizontalOrder = masonryOptions.horizontalOrder || true

        // Load Element
        $ctrl.init = () => {
            // TODO: According to Masonry docs (https://masonry.desandro.com/) we should be able to pass in $element
            //  instead of the element selector (since that is a jQuery Lite Object), but that doesn't work. The problem
            //  with this method is that this will call on every instance of .grid on the page
            // var $grid = jQuery('.grid').masonry(masonryOptions)
            // const msnry = new Masonry(masonryOptions.elementSelector, masonryOptions) // FIXME masonry class doesnt appear to exist
            // msnry.layout()
            $scope.initialized = true
        }

        // Initialization by Event
        // TODO: initialize it only AFTER a conditional value is true (e.g. when the content from the collection is
        //  data-ng-repeated and added to the DOM, so that this can find all elements on the page). That would require
        //  us to pass in a selector (e.g. `#my-id .grid-item` and the total number of elements to search for, and then
        //  watch and only initialize AFTER all the elements are added to the page. Without that, this loads masonry too soon.
        // NOTE: Temporary solution to timing issue is to set timeout of 1 millisecond which seems to force it to load
        // AFTER everything else (put it at the end of the queue)
        setTimeout(() => {
            $ctrl.init()
        }, 1)

        // console.log('onInit setup function');
        // let initNow = true
        // if (Object.prototype.hasOwnProperty.call($attrs.$attr, 'initNow')) {
        //   // TODO: This needs better logic to determine what is acceptably initialized
        //   initNow = _.isJSON($attrs.initNow) ? JSON.parse($attrs.initNow) : false
        // }
        //
        // if (initNow) {
        //   $ctrl.init()
        //   return
        // }
        //
        // $ctrl.stopWatchingInitNow = $scope.$watch('$ctrl.initNow', function (initNow) {
        //   console.log('watching initNow')
        //   if (initNow !== true) {
        //     return
        //   }
        //   if (!$scope.initialized) {
        //     $ctrl.init()
        //   }
        //   $ctrl.stopWatchingInitNow()
        // })
    }
})
