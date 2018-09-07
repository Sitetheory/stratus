// OnScreen Directive
// ------------------

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
  Stratus.Directives.OnScreen = function ($parse, $interpolate) {
    return {
      restrict: 'A',
      scope: {
        onScreen: '@onScreen',
        stratusOnScreen: '@stratusOnScreen'
      },
      link: function ($scope, $element) {
        Stratus.Instances[_.uniqueId('on_screen_')] = $scope
      }
    }
  }
}))
