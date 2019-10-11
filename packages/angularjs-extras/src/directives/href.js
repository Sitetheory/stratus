// HREF Directive
// --------------

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
  Stratus.Directives.Href = function ($parse, $location, $log) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        Stratus.Instances[_.uniqueId('href_')] = $scope
        $scope.href = null
        if ($attrs.stratusHref) {
          const href = $parse($attrs.stratusHref)
          $scope.$watch('$parent', function (newValue) {
            if (typeof newValue !== 'undefined') {
              $scope.href = href($scope.$parent)
              $log.log('stratus-href:', href($scope.href))
            }
          })
          $element.bind('click', function () {
            $scope.$applyAsync(function () {
              if ($scope.href) {
                $location.path($scope.href)
              }
            })
          })
        }
      }
    }
  }
}))
