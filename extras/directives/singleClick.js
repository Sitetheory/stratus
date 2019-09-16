// SingleClick Directive
// ---------------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'lodash', 'angular'], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.SingleClick = function ($parse, $log) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        const fn = $parse($attr.stratusSingleClick)
        const delay = 300
        let clicks = 0
        let timer = null
        $element.on('click', function (event) {
          clicks++

          // count clicks
          if (clicks === 1) {
            timer = setTimeout(function () {
              $scope.$applyAsync(function () {
                fn($scope, { $event: event })
              })
              clicks = 0
            }, delay)
          } else {
            clearTimeout(timer)
            clicks = 0
          }
        })
      }
    }
  }
}))
