// Masonry Directive
// --------------
// Initialize on page by adding to a

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'lodash',
      'angular',
      'masonry-native'
      // 'jquery'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular, root.Masonry /* ,root.jQuery */)
  }
}(this, function (Stratus, _, angular, Masonry /*, jQuery */) {
  // Environment
  const name = 'masonry'

  // const min = Stratus.Environment.get('production') ? '.min' : ''
  // const localPath = 'extras/directives'

  // This directive intends to provide basic logic for extending
  // the Stratus Auto-Loader for various contextual uses.
  Stratus.Directives.Masonry = function () {
    return {
      restrict: 'A',
      // NOTE: at the moment we don't pass in a conditional, because it requires more planning
      // scope: {
      //   conditional: '<'
      // },
      link: function ($scope, $element, $attrs) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $element.elementId || $ctrl.uid
        $scope.initialized = false

        // Get Masonry Options
        let masonryOptions = $attrs.stratusMasonry && _.isJSON($attrs.stratusMasonry) ? JSON.parse($attrs.stratusMasonry) : {}

        // Set Default Masonry Options
        masonryOptions.elementSelector = masonryOptions.elementSelector || '.grid'
        masonryOptions.itemSelector = masonryOptions.itemSelector || '.grid-item'
        masonryOptions.columnWidth = masonryOptions.columnWidth || '.grid-sizer'
        masonryOptions.percentPosition = masonryOptions.percentPosition || true
        masonryOptions.horizontalOrder = masonryOptions.horizontalOrder || true

        // Load Element
        $ctrl.init = function () {
          // TODO: According to Masonry docs (https://masonry.desandro.com/) we should be able to pass in $element instead of the element selector (since that is a jQuery Lite Object), but that doesn't work. The problem with this method is that this will call on every instance of .grid on the page
          // var $grid = jQuery('.grid').masonry(masonryOptions)
          let msnry = new Masonry(masonryOptions.elementSelector, masonryOptions)
          msnry.layout()
          $scope.initialized = true
        }

        // Initialization by Event
        // TODO: initialize it only AFTER a conditional value is true (e.g. when the content from the collection is ng-repeated and added to the DOM, so that this can find all elements on the page). That would require us to pass in a selector (e.g. `#my-id .grid-item` and the total number of elements to search for, and then watch and only initialize AFTER all the elements are added to the page. Without that, this loads masonry too soon.
        // NOTE: Temporary solution to timing issue is to set timeout of 1 milisecond which seems to force it to load AFTER everything else (put it at the end of the queue)
        setTimeout(function () {
          $ctrl.init()
        }, 1)

        // console.log('onInit setup function');
        // let initNow = true
        // if ($attrs.$attr.hasOwnProperty('initNow')) {
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
    }
  }
}))
