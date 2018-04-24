// Base Directive
// --------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['stratus', 'underscore', 'angular'], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // This directive intends to provide basic logic for extending
  // the Stratus Auto-Loader for various contextual uses.
  Stratus.Directives.Base = function ($compile) {
    return {
      restrict: 'A',
      scope: {
        ngModel: '='
      },
      link: function ($scope, $element) {
        console.log($scope, $element)
      },
      template: '<div class="noTemplate"></div>'
    }
  }
}))
