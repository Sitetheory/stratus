// Help Component
// --------------

/* global define */

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'stratus',
      'underscore',
      'angular',
      'angular-material'
    ], factory)
  } else {
    factory(root.Stratus, root._, root.angular)
  }
}(this, function (Stratus, _, angular) {
  // Environment
  const min = Stratus.Environment.get('production') ? '.min' : ''

  // TODO: Possibly Convert to Tether-Tooltip
  // This component intends to display help information
  // in an widely accessible tooltip icon standard.
  Stratus.Components.Help = {
    transclude: true,
    bindings: {
      // Basic Control for Designers
      elementId: '@'
    },
    controller: function ($scope, $attrs) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId('help_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(Stratus.BaseUrl + Stratus.BundlePath + 'components/help' + min + '.css')
      $scope.initialized = false
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/help' + min + '.html'
  }
}))
