// Drawer Component
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

  // This component is just a simple drawer.
  Stratus.Components.Drawer = {
    transclude: {
      view: '?stratusDrawerView'
    },
    bindings: {
      elementId: '@',
      onClick: '&'
    },
    controller: function ($scope, $attrs, $log) {
      // Initialize
      const $ctrl = this
      $ctrl.uid = _.uniqueId('drawer_')
      Stratus.Instances[$ctrl.uid] = $scope
      $scope.elementId = $attrs.elementId || $ctrl.uid
      Stratus.Internals.CssLoader(Stratus.BaseUrl + Stratus.BundlePath + 'components/drawer' + min + '.css')

      // Functionality
      $ctrl.display = false
      $ctrl.$onInit = function () {
        // $log.log('initialized:', $ctrl)
      }
      // $log.log('component:', $ctrl, $scope, $attrs)
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/drawer' + min + '.html'
  }
}))
