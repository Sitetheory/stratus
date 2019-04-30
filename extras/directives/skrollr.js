// Skrollr Directive
// -------------
// This enables the Skrollr third party parallax scrolling.
// See: https://github.com/Prinzhorn/skrollr
// Initiate on the page by adding the stratus-skrollr attribute to any element, and then adding standard options, e.g.
// <div stratus-skrollr data-0="transform: translateY(0px); opacity: 1;" data-600="transform: translateY(300px); opacity: .2;"></div>

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'skrollr'
      ], factory)
  } else {
    factory(root.Stratus, root._,)
  }
}(this, function (Stratus, _) {
  // This directive intends to handle binding of a dynamic variable to
  Stratus.Directives.Skrollr = function () {
    return {
      restrict: 'A',
      scope: {
        ngModel: '='
      },
      link: function ($scope, $element, $attrs) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(_.camelToSnake(name) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $element.elementId || $ctrl.uid
        $scope.initialized = false
      }
    }
  }
}))
