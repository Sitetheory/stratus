// Trigger Directive
// -----------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'lodash', 'angular'], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This directive intends to handle binding of a model to a function,
  // triggered upon true
  Stratus.Directives.Trigger = function ($parse, $log) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ($scope, $element, $attrs, ngModel) {
        Stratus.Instances[_.uniqueId('trigger_')] = $scope
        $scope.trigger = null
        $scope.$watch(function () {
          return $attrs.stratusTrigger
        }, function (newValue) {
          if (typeof newValue !== 'undefined') {
            $scope.trigger = $parse($attrs.stratusTrigger)
          }
        })
        $scope.$watch(function () {
          return ngModel.$modelValue
        }, function (newValue) {
          if (typeof newValue !== 'undefined' && $scope.trigger) {
            $scope.trigger($scope.$parent)
          }
        })
      }
    }
  }
}))
