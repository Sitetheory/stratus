// Src Directive
// -------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'underscore', 'angular'], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.Src = function ($parse, $interpolate) {
    return {
      restrict: 'A',
      scope: {
        src: '@src',
        stratusSrc: '@stratusSrc'
      },
      link: function ($scope, $element) {
        Stratus.Instances[_.uniqueId('src_')] = $scope
        $scope.whitelist = [
          'jpg',
          'jpeg',
          'png'
        ]
        $scope.filter = null

        // Group Registration
        $scope.registered = false
        $scope.register = function () {
          if ($scope.registered) {
            return true
          }
          var ext = $element.attr('src') ? $element.attr('src').match(/\.([0-9a-z]+)(\?.*)?$/i) : null
          if (ext) {
            ext = ext[1] ? ext[1].toLowerCase() : null
          }
          $scope.filter = _.filter($scope.whitelist, function (value) {
            return ext === value
          })
          if (!_.size($scope.filter)) {
            return true
          }
          if ($scope.registered) {
            return true
          }
          $scope.registered = true
          $element.attr('data-src', 'lazy') // This is here for CSS backwards compatibility
          $scope.group = {
            method: Stratus.Internals.LoadImage,
            el: $element,
            spy: $element.data('spy') ? Stratus($element.data('spy')) : $element
          }
          Stratus.RegisterGroup.add('OnScroll', $scope.group)
          Stratus.Internals.LoadImage($scope.group)
          Stratus.Internals.OnScroll()
        }

        // Source Interpolation
        $scope.src = $scope.src || $scope.stratusSrc
        $scope.interpreter = $interpolate($scope.src, false, null, true)
        $scope.initial = $scope.interpreter($scope.$parent)
        if (angular.isDefined($scope.initial)) {
          $element.attr('src', $scope.initial)
          $scope.register()
        } else {
          $scope.$watch(function () {
            return $scope.interpreter($scope.$parent)
          }, function (value) {
            if (angular.isDefined(value)) {
              $element.attr('src', value)
              $scope.register()
            }
          })
        }
      }
    }
  }
}))
