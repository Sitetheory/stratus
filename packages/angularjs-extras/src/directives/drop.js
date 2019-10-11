// Drop Directive
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
  Stratus.Directives.Drop = function ($parse, $log) {
    return {
      restrict: 'A',
      scope: {
        ngModel: '=ngModel'
      },
      link: function ($scope, $element, $attrs) {
        Stratus.Instances[_.uniqueId('drop_')] = $scope
        $log.log('drop:', $element)
      }
    }
  }
}))
