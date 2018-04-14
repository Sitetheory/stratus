// SingleClick Directive
// ---------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'angular'], factory)
  } else {
    factory(root.Stratus, root._)
  }
}(this, function (Stratus, _) {
  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.SingleClick = function ($parse, $log) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        var fn = $parse($attr.stratusSingleClick)
        var delay = 300
        var clicks = 0
        var timer = null
        $element.on('click', function (event) {
          clicks++

          // count clicks
          if (clicks === 1) {
            timer = setTimeout(function () {
              $scope.$apply(function () {
                fn($scope, {$event: event})
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
