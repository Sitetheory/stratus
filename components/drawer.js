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
      this.uid = _.uniqueId('drawer_')
      Stratus.Instances[this.uid] = $scope
      $scope.elementId = $attrs.elementId || this.uid
      this.display = false
      this.$onInit = function () {
        $log.log('initialized:', this)
      }
      /* *
      Stratus.Internals.CssLoader(Stratus.BaseUrl +
          Stratus.BundlePath + 'components/drawer' +
          (Stratus.Environment.get('production') ? '.min' : '') + '.css')
      /* */
      $log.log('component:', this, $scope, $attrs)
    },
    templateUrl: Stratus.BaseUrl + Stratus.BundlePath + 'components/drawer' +
        (Stratus.Environment.get('production') ? '.min' : '') + '.html'
  }
}))
