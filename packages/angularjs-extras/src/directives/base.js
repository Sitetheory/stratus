// Base Directive
// --------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'lodash',
      'angular'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''
  const name = 'base'
  const localPath = 'extras/directives'

  // This directive intends to provide basic logic for extending
  // the Stratus Auto-Loader for various contextual uses.
  Stratus.Directives.Base = function () {
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
        Stratus.Internals.CssLoader(
          Stratus.BaseUrl + Stratus.BundlePath + localPath + name + min + '.css'
        )
        $scope.initialized = false

        // Begin
        console.log('directive:', $ctrl, $scope, $element, $attrs)
      },
      // template: '<div id="{{ elementId }}" class="no-template"></div>',
      templateUrl: Stratus.BaseUrl + Stratus.BundlePath + localPath + name + min + '.html'
    }
  }
}))
