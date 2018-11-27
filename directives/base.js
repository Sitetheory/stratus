// Base Directive
// --------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular'
    ], factory)
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
        this.uid = _.uniqueId('base_')
        Stratus.Instances[this.uid] = $scope
        $scope.elementId = $element.elementId || this.uid
        Stratus.Internals.CssLoader(Stratus.BaseUrl +
          Stratus.BundlePath + 'directives/base' +
          (Stratus.Environment.get('production') ? '.min' : '') + '.css')
        console.log('directive:', this, $scope, $element)
      },
      template: '<div id="{{ elementId }}" class="no-template"></div>',
      templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'directives/drawer' +
        (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    }
  }
}))
